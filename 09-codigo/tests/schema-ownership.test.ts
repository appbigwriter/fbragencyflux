import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd())
const read = (file: string) => readFileSync(resolve(root, file), 'utf8')

describe('Flux database schema ownership', () => {
  it('canonical migrations create and reference Flux only under custom_agencyflux', () => {
    const foundation = read('../04-database/003_flux_relational_persistence.sql')
    const rpcs = read('../04-database/004_flux_relational_rpcs.sql')
    expect(foundation).toContain('create schema if not exists custom_agencyflux')
    expect(foundation).toContain('set search_path = custom_agencyflux, public')
    expect(foundation).not.toMatch(/public\.flux_/) 
    expect(rpcs).toContain('create schema if not exists custom_agencyflux')
    expect(rpcs).toContain('custom_agencyflux.flux_relational_read')
    expect(rpcs).toContain('custom_agencyflux.flux_relational_commit')
    expect(rpcs).not.toMatch(/public\.flux_/)
    expect(rpcs).not.toContain("schemaname = 'public'")
    expect(rpcs).not.toContain('search_path = pg_catalog, public')
  })

  it('legacy relational draft is quarantined and cannot recreate public Flux objects', () => {
    const legacy = read('../04-database/004_flux_runtime_relational.sql')
    expect(legacy).toContain('QUARANTINED LEGACY DRAFT')
    expect(legacy).not.toMatch(/create\s+(table|function)|create\s+or\s+replace/i)
    expect(legacy).not.toMatch(/public\.flux_/)
  })

  it('Control Tower legacy snapshot migration uses the Flux-owned schema', () => {
    const snapshot = read('../../GestaoDB/supabase/migrations/011_flux_external_state.sql')
    expect(snapshot).toContain('create schema if not exists custom_agencyflux')
    expect(snapshot).toContain('custom_agencyflux.flux_state')
    expect(snapshot).not.toContain('public.flux_state')
  })

  it('migration generator cannot regenerate public Flux objects', () => {
    const generator = read('../09-codigo/tests/build-relational-migration.mjs')
    expect(generator).toContain('custom_agencyflux')
    expect(generator).not.toContain('public.flux_')
    expect(generator).not.toContain('search_path = pg_catalog, public')
  })
})
