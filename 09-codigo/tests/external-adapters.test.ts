import { afterEach, describe, expect, it, vi } from 'vitest'
import { FakeFluxRepository, SupabaseRestTransport } from '../src/lib/persistence'
import { FluxError, type FluxState } from '../src/lib/flux-repository'
import { FakeDispatcherAdapter, newDispatchEvent } from '../src/lib/dispatcher'

const state: FluxState = { version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [] }

afterEach(() => vi.restoreAllMocks())

describe('external persistence contract', () => {
  it('round-trips state through a fake repository without JSON files', async () => {
    const repository = new FakeFluxRepository({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [] })
    const state = await repository.load()
    expect(state?.version).toBe(1)
    await repository.save({ ...state!, version: 2 })
    expect((await repository.load())?.version).toBe(2)
  })
})

describe('Supabase relational RPC diagnostics', () => {
  for (const status of [401, 403, 404] as const) {
    it(`maps HTTP ${status} to a sanitized relational diagnostic`, async () => {
      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response('sensitive upstream body', { status }))))
      const secret = 'service-role-secret-that-must-not-leak'
      await expect(new SupabaseRestTransport('https://project.supabase.co', secret).read()).rejects.toMatchObject({ code: 'PERSISTENCE_UNAVAILABLE', status: 503 })
      try { await new SupabaseRestTransport('https://project.supabase.co', secret).read() } catch (error) {
        expect(error).toBeInstanceOf(FluxError)
        expect((error as Error).message).not.toContain(secret)
        expect((error as Error).message).not.toContain('project.supabase.co')
        expect((error as Error).message).not.toContain('sensitive upstream body')
      }
    })
  }

  it('maps 5xx responses to an unavailable relational diagnostic', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })))
    await expect(new SupabaseRestTransport('https://project.supabase.co', 'secret').read()).rejects.toMatchObject({ code: 'PERSISTENCE_UNAVAILABLE', status: 503 })
  })

  it('reads through flux_relational_read and keeps credentials only in request headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ version: state.version, flux_projects: [] }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const secret = 'service-role-secret-that-must-not-leak'
    await expect(new SupabaseRestTransport('https://project.supabase.co', secret).read()).resolves.toMatchObject({ version: state.version })
    expect(fetchMock.mock.calls[0][0]).toBe('https://project.supabase.co/rest/v1/rpc/flux_relational_read')
    expect(JSON.stringify(fetchMock.mock.calls[0][1])).toContain(secret)
  })

  it('commits through flux_relational_commit with explicit CAS arguments', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ version: 2 }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    await new SupabaseRestTransport('https://project.supabase.co', 'secret').commit(1, [{ table: 'flux_projects', operation: 'upsert', row: { id: 'project-id' } }], ['waiting'])
    expect(fetchMock.mock.calls[0][0]).toBe('https://project.supabase.co/rest/v1/rpc/flux_relational_commit')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ expected_version: 1, changes: [{ table: 'flux_projects', operation: 'upsert', row: { id: 'project-id' } }], waiting_reasons: ['waiting'] })
  })
})


describe('dispatcher contract', () => {
  it('emits a stable event and preserves replay payload', async () => {
    const adapter = new FakeDispatcherAdapter()
    const event = newDispatchEvent({ type: 'heartbeat', jobId: 'job-1', payload: { lastSeen: '2026-01-01T00:00:00.000Z' }, correlationId: 'corr-1' })
    await adapter.publish(event)
    await adapter.publish(event)
    expect(adapter.emitted).toHaveLength(2)
    expect(adapter.emitted[0]).toEqual(adapter.emitted[1])
    expect((await adapter.receive(event)).duplicate).toBe(false)
    expect((await adapter.receive(event)).duplicate).toBe(true)
  })
})
