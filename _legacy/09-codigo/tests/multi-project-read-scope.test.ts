import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getAggregatedSnapshot, type FluxState } from '../src/lib/flux-repository'
import { parseReadScopeAllowlist, readScopeFromRequest } from '../src/lib/read-scope'

const dirs: string[] = []
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

const state = (): FluxState => ({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [] })

describe('multi-project read scope', () => {
  it.each([
    ['', null], ['tenant-a/project-a,', null], [',tenant-a/project-a', null], ['tenant-a', null], ['*/project-a', null], ['*/*', null], ['tenant-a/*,tenant-a/*', null], ['tenant-a/project-a, tenant-a/project-a', null],
  ])('fails closed for invalid allowlist %j', (value, expected) => expect(parseReadScopeAllowlist(value)).toEqual(expected))

  it('accepts a tenant wildcard alongside exact pairs', () => {
    expect(parseReadScopeAllowlist(' tenant-a/* , tenant-b/project-b ')).toEqual([{ tenantId: 'tenant-a', projectId: '*' }, { tenantId: 'tenant-b', projectId: 'project-b' }])
  })

  it('normalizes whitespace around valid pairs', () => {
    expect(parseReadScopeAllowlist(' tenant-a/project-a , tenant-b/project-b ')).toEqual([{ tenantId: 'tenant-a', projectId: 'project-a' }, { tenantId: 'tenant-b', projectId: 'project-b' }])
  })

  it('rejects an explicitly empty request scope instead of falling back to legacy parameters', () => {
    expect(() => readScopeFromRequest(new Request('http://localhost/api/flux/snapshot?tenantId=tenant-a&projectId=project-a&readScope= '))).toThrowError(expect.objectContaining({ code: 'READ_SCOPE_INVALID' }))
  })

  it('accepts multiple pairs through an explicit request header', () => {
    const scope = readScopeFromRequest(new Request('http://localhost/api/flux/snapshot', { headers: { 'x-flux-read-scope': 'tenant-a/project-a,tenant-b/project-b' } }))
    expect(scope).toEqual({ visibility: 'private', scopes: [{ tenantId: 'tenant-a', projectId: 'project-a' }, { tenantId: 'tenant-b', projectId: 'project-b' }] })
  })

  it('derives a public tenant wildcard when projectId is omitted', () => {
    process.env.FLUX_PUBLIC_READ_SCOPE = 'tenant-a/*'
    expect(readScopeFromRequest(new Request('http://localhost/api/flux/snapshot?scope=public&tenantId=tenant-a'))).toEqual({ visibility: 'public', scopes: [{ tenantId: 'tenant-a', projectId: '*' }] })
  })

  it('rejects public cross-tenant requests', () => {
    process.env.FLUX_PUBLIC_READ_SCOPE = 'tenant-a/*'
    expect(() => readScopeFromRequest(new Request('http://localhost/api/flux/snapshot?scope=public&tenantId=tenant-b'))).toThrowError(expect.objectContaining({ code: 'PUBLIC_SCOPE_UNDEFINED' }))
  })

  it('aggregates two projects and excludes a non-allowed project and tenant', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-multi-project-')); dirs.push(dir); const file = join(dir, 'state.json'); const input = state()
    input.projects = [
      { id: 'a', name: 'A', tenantId: 'tenant-a', status: 'active', owner: 'Kora', description: '' },
      { id: 'b', name: 'B', tenantId: 'tenant-a', status: 'active', owner: 'Kora', description: '' },
      { id: 'secret', name: 'Secret', tenantId: 'tenant-b', status: 'active', owner: 'Kora', description: '' },
    ]
    input.cards = [
      { id: 'ca', title: 'A', project: 'a', tenantId: 'tenant-a', status: 'ready', assignee: 'Kora', priority: 'normal', detail: '', acceptanceCriteria: [], updatedAt: '' },
      { id: 'cb', title: 'B', project: 'b', tenantId: 'tenant-a', status: 'ready', assignee: 'Kora', priority: 'normal', detail: '', acceptanceCriteria: [], updatedAt: '' },
      { id: 'cs', title: 'Secret', project: 'secret', tenantId: 'tenant-b', status: 'ready', assignee: 'Kora', priority: 'normal', detail: '', acceptanceCriteria: [], updatedAt: '' },
    ]
    input.events = [{ id: 'ea', time: '', actor: 'Kora', action: 'A', cardId: 'ca' }, { id: 'eb', time: '', actor: 'Kora', action: 'B', cardId: 'cb' }, { id: 'es', time: '', actor: 'Kora', action: 'secret', cardId: 'cs' }]
    await writeFile(file, JSON.stringify(input))
    const result = await getAggregatedSnapshot([{ tenantId: 'tenant-a', projectId: 'a' }, { tenantId: 'tenant-a', projectId: 'b' }], file)
    expect(result.projects.map((item) => item.id)).toEqual(['a', 'b'])
    expect(result.cards.map((item) => item.id)).toEqual(['ca', 'cb'])
    expect(result.recentEvents.map((item) => item.id).sort()).toEqual(['ea', 'eb'])
    expect(result.projects.every((item) => item.tenantId === 'tenant-a')).toBe(true)
  })

  it('includes new projects for an authorized tenant and excludes another tenant', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-tenant-wildcard-')); dirs.push(dir); const file = join(dir, 'state.json'); const input = state()
    input.projects = [
      { id: 'new', name: 'New', tenantId: 'tenant-a', status: 'active', owner: 'Kora', description: '' },
      { id: 'other', name: 'Other', tenantId: 'tenant-b', status: 'active', owner: 'Kora', description: '' },
    ]
    input.cards = [
      { id: 'cn', title: 'New', project: 'new', tenantId: 'tenant-a', status: 'ready', assignee: 'Kora', priority: 'normal', detail: '', acceptanceCriteria: [], updatedAt: '' },
      { id: 'co', title: 'Other', project: 'other', tenantId: 'tenant-b', status: 'ready', assignee: 'Kora', priority: 'normal', detail: '', acceptanceCriteria: [], updatedAt: '' },
    ]
    await writeFile(file, JSON.stringify(input))
    const result = await getAggregatedSnapshot([{ tenantId: 'tenant-a', projectId: '*' }], file)
    expect(result.projects.map((item) => item.id)).toEqual(['new'])
    expect(result.cards.map((item) => item.id)).toEqual(['cn'])
  })

  it('excludes legacy tenantless projects from public wildcard reads', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-tenant-wildcard-legacy-')); dirs.push(dir); const file = join(dir, 'state.json'); const input = state()
    input.projects = [{ id: 'legacy', name: 'Legacy', status: 'active', owner: 'Kora', description: '' }]
    input.cards = [{ id: 'legacy-card', title: 'Legacy', project: 'legacy', status: 'ready', assignee: 'Kora', priority: 'normal', detail: '', acceptanceCriteria: [], updatedAt: '' }]
    await writeFile(file, JSON.stringify(input))
    const result = await getAggregatedSnapshot([{ tenantId: 'tenant-a', projectId: '*' }], file)
    expect(result.projects).toEqual([])
    expect(result.cards).toEqual([])
  })
})
