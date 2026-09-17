import { describe, it, expect } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import * as persistence from '../src/lib/persistence'
import { fullState } from './relational-fixture'

export async function database() {
  const db = new PGlite()
  await db.exec((await readFile('../04-database/003_flux_relational_persistence.sql', 'utf8')).replace('create extension if not exists pgcrypto;', ''))
  await db.exec(await readFile('../04-database/004_flux_relational_rpcs.sql', 'utf8'))
  return db
}

describe('004_flux_relational_rpcs (additive migration vs 003)', () => {
  it('roundtrips every domain entity through the new 004 RPCs', async () => {
    const db = await database()
    await db.query("INSERT INTO flux_tenants (slug,name,external_id) VALUES ('tenant-business','Explicit tenant','tenant-business')")
    const repo = new persistence.RelationalFluxRepository(db)
    const fixture = fullState()
    await repo.save(fixture)
    const loaded = await repo.load()
    for (const [key, value] of Object.entries(fixture)) if (key !== 'version') expect(loaded[key as keyof typeof loaded], key).toEqual(value)
    const second = new persistence.RelationalFluxRepository(db)
    expect(await second.load()).toEqual(loaded)
    await repo.update(state => { state.projects[0].description = `${state.projects[0].description}` })
    const after = await repo.load()
    expect(after.version).toBe(loaded.version + 1)
    await db.close()
  }, 60000)
})
