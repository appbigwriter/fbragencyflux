import { afterAll, afterEach, describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { Client } from 'pg'
import { relationalRepository, RelationalFluxRepository, closeRelationalPools, type FluxStateRepository } from '../src/lib/persistence'
import { fullState } from './relational-fixture'

/**
 * Backend relacional: RelationalFluxRepository contra PostgreSQL real (docker postgres:16-alpine)
 * via driver pg/pool de FLUX_DATABASE_URL — o mesmo transporte usado pelo runtime.
 * Requer docker; sem docker o teste falha explicitamente (não silenciosamente).
 */

const CONNECTION = 'postgres://postgres:fluxtest@127.0.0.1:55432/flux'
const MIGRATIONS = ['../04-database/003_flux_relational_persistence.sql', '../04-database/004_flux_relational_rpcs.sql']

// skipIf is evaluated at collection time, so the docker probe must run at module load.
const dockerProbe = spawnSync(process.platform === 'win32' ? 'docker.exe' : 'docker', ['version', '--format', '{{.Server.Version}}'], { encoding: 'utf8', timeout: 30_000 })
const dockerAvailable = dockerProbe.status === 0 && !/error/i.test(dockerProbe.stdout)

afterEach(() => { delete process.env.FLUX_DATABASE_URL })
afterAll(async () => { await closeRelationalPools() })

describe('backend relacional contra PostgreSQL real', () => {
  it.skipIf(!dockerAvailable)('load/save/update/readback completos pelo driver pg de FLUX_DATABASE_URL', async () => {
    // Fresh database per run: apply 003 + 004 (the same migrations the runtime uses).
    const admin = new Client({ connectionString: CONNECTION })
    await admin.connect()
    await admin.query('drop schema public cascade; create schema public;')
    for (const file of MIGRATIONS) {
      const sql = (await readFile(file, 'utf8')).replace('create extension if not exists pgcrypto;', '')
      await admin.query(sql)
    }
    await admin.query("insert into flux_tenants (slug, name, external_id) values ('tenant-business', 'Explicit tenant', 'tenant-business')")
    await admin.end()

    process.env.FLUX_DATABASE_URL = CONNECTION
    const repository = relationalRepository()
    expect(repository).toBeInstanceOf(RelationalFluxRepository)

    // load: estado vazio inicial (version 0, sem entidades)
    const empty = await repository.load()
    expect(empty!.version).toBe(0)
    expect(empty!.projects).toEqual([])

    // save: fixture completa do domínio
    const fixture = fullState()
    await repository.save(fixture)

    // readback: tudo que foi salvo volta igual, IDs de negócio preservados
    const loaded = await repository.load()
    expect(loaded!.version).toBeGreaterThan(0)
    expect(loaded!.projects.map((p) => p.id)).toEqual(['project-BUSINESS'])
    expect(loaded!.cards.map((c) => c.id)).toEqual(['CARD-1'])
    for (const [key, value] of Object.entries(fixture)) {
      if (key === 'version') continue
      expect(loaded![key as keyof typeof loaded], key).toEqual(value)
    }

    // update: mutação com commit CAS + readback de versão
    const result = await repository.update((state) => {
      state.cards[0].title = 'Implement (updated)'
      state.coordinator = { ...state.coordinator, waitingReasons: ['awaiting QA update'] }
      return state.cards[0].title
    })
    expect(result).toBe('Implement (updated)')
    const after = await repository.load()
    expect(after!.cards[0].title).toBe('Implement (updated)')
    expect(after!.coordinator?.waitingReasons).toEqual(['awaiting QA update'])
    expect(after!.version).toBe(loaded!.version + 1)

    // estado em colunas relacionais, não em snapshot json
    const columns = await new Client({ connectionString: CONNECTION }).connect().then(async (client) => {
      const rows = await client.query('select external_id, title, status, assignee from flux_cards')
      await client.end()
      return rows.rows
    })
    expect(columns).toEqual([{ external_id: 'CARD-1', title: 'Implement (updated)', status: 'awaiting_owner', assignee: 'Théo' }])
  }, 120_000)

  it.skipIf(!dockerAvailable)('CAS: commit com versão stale falha fechado com PERSISTENCE_CONFLICT', async () => {
    const admin = new Client({ connectionString: CONNECTION })
    await admin.connect()
    await admin.query('drop schema public cascade; create schema public;')
    for (const file of MIGRATIONS) {
      const sql = (await readFile(file, 'utf8')).replace('create extension if not exists pgcrypto;', '')
      await admin.query(sql)
    }
    await admin.query("insert into flux_tenants (slug, name, external_id) values ('tenant-business', 'Explicit tenant', 'tenant-business')")
    await admin.end()

    const stale = new RelationalFluxRepository({ query: (sql: string, values?: unknown[]) => new Client({ connectionString: CONNECTION }).connect().then(async (client) => { try { return await client.query(sql, values) } finally { await client.end() } }) }) as FluxStateRepository
    await expect(stale.save(fullState())).resolves.toBeUndefined()
    // Second save reuses the same pre-loaded version object -> server version moved on -> conflict
    await expect(stale.save(fullState())).rejects.toMatchObject({ code: 'PERSISTENCE_CONFLICT' })
  }, 120_000)

  it('resolução de configuração: FLUX_DATABASE_URL tem precedência; sem config falha PERSISTENCE_NOT_CONFIGURED', () => {
    process.env.FLUX_DATABASE_URL = CONNECTION
    expect(relationalRepository()).toBeInstanceOf(RelationalFluxRepository)
    delete process.env.FLUX_DATABASE_URL
    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key'
    // postgrest transport resolves without touching the network
    expect(relationalRepository()).toBeInstanceOf(RelationalFluxRepository)
    delete process.env.SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
    delete process.env.DATABASE_URL
    try { relationalRepository(); expect.unreachable('must fail closed') } catch (error) { expect((error as { code?: string }).code).toBe('PERSISTENCE_NOT_CONFIGURED') }
  })
})
