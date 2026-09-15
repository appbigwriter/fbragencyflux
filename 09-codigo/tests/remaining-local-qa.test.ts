import { afterEach, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { JsonFluxRepository, SupabaseFluxRepository } from '../src/lib/persistence'
import { parseBriefing, createProjectPlan, persistIntake } from '../src/lib/intake'
import { getSnapshot, getState, type FluxState } from '../src/lib/flux-repository'
import { GET as snapshotGET } from '../src/app/api/flux/snapshot/route'
import { GET as cardsGET } from '../src/app/api/flux/cards/route'

const dirs: string[] = []
const empty = (): FluxState => ({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [] })
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })) ) })

describe('remaining local QA regressions', () => {
  it('keeps one lock owner through a mutation longer than the old five-second threshold', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-long-lock-')); dirs.push(dir); const file = join(dir, 'state.json'); await writeFile(file, JSON.stringify(empty()))
    const first = new JsonFluxRepository(file); const second = new JsonFluxRepository(file); const order: string[] = []
    const one = first.update(async (state) => { order.push('first-start'); await new Promise((resolve) => setTimeout(resolve, 5200)); state.version += 1; order.push('first-end') })
    await new Promise((resolve) => setTimeout(resolve, 100)); const two = second.update((state) => { order.push('second'); state.version += 1 })
    await Promise.all([one, two]); expect(order).toEqual(['first-start', 'first-end', 'second']); expect(JSON.parse(await (await import('node:fs/promises')).readFile(file, 'utf8')).version).toBe(3)
  }, 15000)

  it('rejects a briefing without explicit scope, acceptance, input context and next step', () => {
    expect(() => parseBriefing('# Projeto X\n\nowner: Kora\ntenant: t\nobjective: fazer')).toThrowError(expect.objectContaining({ code: 'BRIEFING_INCOMPLETE', status: 422 }))
  })

  it('keys dashboard cards by project id even when display name differs', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-card-key-')); dirs.push(dir); const file = join(dir, 'state.json'); const state = empty(); state.projects = [{ id: 'p-1', name: 'Nome exibido', tenantId: 't-1', status: 'planned', owner: 'Kora', description: 'x' }]; state.cards = [{ id: 'c-1', title: 'x', project: 'p-1', tenantId: 't-1', status: 'planned', assignee: 'Kora', priority: 'normal', detail: 'x', acceptanceCriteria: [], updatedAt: '' }]; await writeFile(file, JSON.stringify(state)); const snapshot = await getSnapshot(file); expect(snapshot.projectCards['p-1']).toHaveLength(1); expect(snapshot.projectCards['Nome exibido']).toBeUndefined()
  })

  it('fails closed when Supabase does not return a matching version', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([{ state: empty() }]), { status: 200 })))
    await expect(new SupabaseFluxRepository('https://project.supabase.co', 'key').load()).rejects.toMatchObject({ code: 'PERSISTENCE_VERSION_REQUIRED' })
  })

  it('rejects intake and mutation actors crossing tenant boundaries without partial writes', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-tenant-')); dirs.push(dir); const file = join(dir, 'state.json'); await writeFile(file, JSON.stringify(empty()))
    const input = parseBriefing('# Tenant A\n\nowner: Kora\ntenant: tenant-a\nobjective: intake\ninput: local\nscope: local\nnextStep: validar\n\n## Acceptance\n- evidência')
    const plan = createProjectPlan(input, 'tenant-corr')
    await expect(persistIntake(plan, { actor: 'Kora', scope: 'local', tenantId: 'tenant-b' }, file)).rejects.toMatchObject({ code: 'TENANT_MISMATCH' })
    expect((await getState(file)).projects).toHaveLength(0)
  })

  it('treats an empty Supabase PATCH response as a conflict', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ state: empty(), version: 1 }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    vi.stubGlobal('fetch', fetchMock)
    const repository = new SupabaseFluxRepository('https://project.supabase.co', 'key')
    await expect(repository.update((state) => { state.events.push({ id: 'e', time: '', actor: 'Kora', action: 'test' }) })).rejects.toMatchObject({ code: 'PERSISTENCE_CONFLICT' })
  })

  it('requires an explicit tenant/project read scope instead of returning the complete snapshot', async () => {
    const response = await snapshotGET(new Request('http://localhost/api/flux/snapshot'))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({ error: 'READ_SCOPE_REQUIRED' })
  })

  it('filters snapshot and cards server-side so a tenant cannot read another tenant project', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-read-scope-')); dirs.push(dir); const file = join(dir, 'state.json')
    const state = empty()
    state.projects = [
      { id: 'project-a', name: 'A', tenantId: 'tenant-a', status: 'active', owner: 'Kora', description: 'A' },
      { id: 'project-b', name: 'B', tenantId: 'tenant-b', status: 'active', owner: 'Kora', description: 'B' },
    ]
    state.cards = [
      { id: 'card-a', title: 'A', project: 'project-a', tenantId: 'tenant-a', status: 'ready', assignee: 'Kora', priority: 'normal', detail: 'A', acceptanceCriteria: [], updatedAt: '' },
      { id: 'card-b', title: 'B', project: 'project-b', tenantId: 'tenant-b', status: 'ready', assignee: 'Kora', priority: 'normal', detail: 'B', acceptanceCriteria: [], updatedAt: '' },
    ]
    state.events = [{ id: 'event-a', time: '', actor: 'Kora', action: 'A', cardId: 'card-a' }, { id: 'event-b', time: '', actor: 'Kora', action: 'B', cardId: 'card-b' }]
    await writeFile(file, JSON.stringify(state)); process.env.FLUX_DATA_FILE = file
    const request = new Request('http://localhost/api/flux/snapshot?tenantId=tenant-a&projectId=project-a')
    const snapshotResponse = await snapshotGET(request); const cardsResponse = await cardsGET(new Request(request))
    expect(snapshotResponse.status).toBe(200); expect(cardsResponse.status).toBe(200)
    await expect(snapshotResponse.json()).resolves.toMatchObject({ projects: [{ id: 'project-a' }], cards: [{ id: 'card-a' }], recentEvents: [{ id: 'event-a' }] })
    await expect(cardsResponse.json()).resolves.toEqual([expect.objectContaining({ id: 'card-a' })])
  })

  it('allows public reading only for the explicitly configured public scope', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-public-scope-')); dirs.push(dir); const file = join(dir, 'state.json'); const state = empty()
    state.projects = [{ id: 'public-project', name: 'Public', status: 'active', owner: 'Kora', description: 'public' }]
    state.cards = [{ id: 'public-card', title: 'public', project: 'public-project', status: 'ready', assignee: 'Kora', priority: 'normal', detail: 'public', acceptanceCriteria: [], updatedAt: '' }]
    await writeFile(file, JSON.stringify(state)); process.env.FLUX_DATA_FILE = file
    const denied = await cardsGET(new Request('http://localhost/api/flux/cards?scope=public&tenantId=tenant-a&projectId=public-project'))
    expect(denied.status).toBe(403)
    process.env.FLUX_PUBLIC_READ_SCOPE = 'tenant-a/public-project'
    const allowed = await cardsGET(new Request('http://localhost/api/flux/cards?scope=public&tenantId=tenant-a&projectId=public-project'))
    expect(allowed.status).toBe(200); await expect(allowed.json()).resolves.toEqual([expect.objectContaining({ id: 'public-card' })])
  })
})
