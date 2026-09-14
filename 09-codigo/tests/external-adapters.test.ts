import { afterEach, describe, expect, it, vi } from 'vitest'
import { FakeFluxRepository, SupabaseFluxRepository } from '../src/lib/persistence'
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

describe('Supabase persistence diagnostics', () => {
  for (const [status, code] of [[401, 'PERSISTENCE_UNAUTHORIZED'], [403, 'PERSISTENCE_FORBIDDEN'], [404, 'PERSISTENCE_NOT_FOUND']] as const) {
    it(`maps HTTP ${status} to an operational diagnostic without secrets`, async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('sensitive upstream body', { status })))
      const secret = 'service-role-secret-that-must-not-leak'
      await expect(new SupabaseFluxRepository('https://project.supabase.co', secret).load()).rejects.toMatchObject({ code, status })
      try { await new SupabaseFluxRepository('https://project.supabase.co', secret).load() } catch (error) {
        expect(error).toBeInstanceOf(FluxError)
        expect((error as Error).message).not.toContain(secret)
        expect((error as Error).message).not.toContain('project.supabase.co')
        expect((error as Error).message).not.toContain('sensitive upstream body')
      }
    })
  }

  it('loads state successfully and does not expose request credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([{ state }]), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const secret = 'service-role-secret-that-must-not-leak'
    await expect(new SupabaseFluxRepository('https://project.supabase.co', secret, 'smoke-key').load()).resolves.toEqual(state)
    expect(fetchMock.mock.calls[0][0]).toContain('/rest/v1/flux_state?state_key=eq.smoke-key')
    expect(JSON.stringify(fetchMock.mock.calls[0][1])).toContain(secret)
  })

  it('rejects malformed Supabase URLs before making a request', async () => {
    expect(() => new SupabaseFluxRepository('not-a-url', 'key')).toThrow(/URL/i)
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
