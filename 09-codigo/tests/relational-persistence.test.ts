import { describe, it, expect, vi, afterEach } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import * as persistence from '../src/lib/persistence'
import { fullState } from './relational-fixture'
import { getState, importHistory } from '../src/lib/flux-repository'

afterEach(() => vi.restoreAllMocks())

export async function database() {
  const db = new PGlite()
  // pgcrypto is not bundled in WASM; gen_random_uuid is PostgreSQL core.
  await db.exec((await readFile('../04-database/003_flux_relational_persistence.sql','utf8')).replace('create extension if not exists pgcrypto;', ''))
  await db.exec(await readFile('../04-database/004_flux_runtime_relational.sql','utf8'))
  return db
}
describe('relational persistence', () => {
  it('roundtrips every current domain entity and nested value, preserving all business IDs', async () => {
    const db=await database()
    await db.query("INSERT INTO flux_tenants (slug,name,external_id) VALUES ('tenant-business','Explicit tenant','tenant-business')")
    const repo=new persistence.RelationalFluxRepository(db)
    const fixture=fullState()
    await repo.save(fixture)
    const loaded=await repo.load()
    for(const [key,value] of Object.entries(fixture)) if(key!=='version') expect(loaded[key as keyof typeof loaded],key).toEqual(value)
    const second=new persistence.RelationalFluxRepository(db)
    expect(await second.load()).toEqual(loaded)
    await db.close()
  },30000)
  it('reads do not seed, write, or scan the filesystem', async () => {
    const fake=new persistence.FakeFluxRepository({version:0,projects:[],cards:[],approvals:[],gates:[],events:[],handoffs:[],artifacts:[]})
    vi.spyOn(persistence,'configuredRepository').mockReturnValue(fake)
    const save=vi.spyOn(fake,'save')
    expect((await getState()).projects).toEqual([])
    expect(save).not.toHaveBeenCalled()
    await expect(importHistory()).rejects.toMatchObject({code:'FILESYSTEM_DISABLED'})
  })
  it('roundtrips business identifiers and card fields in PostgreSQL columns', async () => {
    const db = await database()
    const repo = new persistence.RelationalFluxRepository({ query: (sql: string, params?: unknown[]) => db.query(sql, params) })
    await repo.update(state => {
      state.projects.push({ id: 'business-P', name: 'Project', status: 'active', owner: 'Kora', description: 'real input' })
      state.cards.push({ id: 'CARD-1', project: 'business-P', title: 'Implement', status: 'awaiting_owner', assignee: 'Théo', priority: 'high', detail: 'detail', acceptanceCriteria: ['one', 'two'], updatedAt: '2026-09-17T00:00:00.000Z' })
    })
    const state = await repo.load()
    expect(state?.projects[0].id).toBe('business-P')
    expect(state?.cards[0]).toMatchObject({ id: 'CARD-1', status: 'awaiting_owner', acceptanceCriteria: ['one','two'] })
    const rows = await db.query('select external_id, title from flux_cards')
    expect(rows.rows).toEqual([{external_id:'CARD-1', title:'Implement'}])
    await db.close()
  }, 30000)
  it('has a real relational adapter instead of snapshot or filesystem persistence', () => {
    expect(persistence).toHaveProperty('RelationalFluxRepository')
    expect(() => persistence.configuredRepository('state.json')).toThrow(/filesystem/i)
  })
})
