import { describe, expect, it } from 'vitest'
import { FakeFluxRepository } from '../src/lib/persistence'
import { FakeDispatcherAdapter, newDispatchEvent } from '../src/lib/dispatcher'

describe('external persistence contract', () => {
  it('round-trips state through a fake repository without JSON files', async () => {
    const repository = new FakeFluxRepository({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [] })
    const state = await repository.load()
    expect(state?.version).toBe(1)
    await repository.save({ ...state!, version: 2 })
    expect((await repository.load())?.version).toBe(2)
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
