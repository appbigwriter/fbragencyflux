import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { dispatchIncoming } from '../src/lib/dispatcher'
import { JsonFluxRepository } from '../src/lib/persistence'
import { enqueueEvent, markEventPublished, processInbox, readEventRecord, type EventState } from '../src/lib/event-store'
import type { FluxState } from '../src/lib/flux-repository'

const dirs: string[] = []
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

async function fixture() {
  const dir = await mkdtemp(join(process.cwd(), 'event-persistence-')); dirs.push(dir)
  const file = join(dir, 'state.json')
  const state: FluxState = { version: 1, projects: [], cards: [{ id: 'card-1', title: 'test', project: 'atlas', status: 'ready', assignee: 'Kora', priority: 'normal', detail: 'test', acceptanceCriteria: ['evidence'], updatedAt: '' }], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [{ jobId: 'job-1', cardId: 'card-1', project: 'atlas', agent: 'Kora', role: 'Kora', objective: 'test', status: 'ready', updatedAt: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'done', correlationId: 'old', source: 'test' }] }
  await writeFile(file, JSON.stringify(state)); return { file, state }
}

const event = { eventId: 'evt-durable', type: 'job' as const, jobId: 'job-1', event: 'started' as const, sentAt: '2026-09-15T12:00:00.000Z', correlationId: 'corr-durable', payload: { cardId: 'card-1', agent: 'Kora', objective: 'test' } }

describe('durable local event inbox/outbox contract', () => {
  it('deduplicates replay before and after a repository restart simulation without duplicate mutation', async () => {
    const { file } = await fixture()
    expect((await dispatchIncoming(event, { actor: 'Hermes', scope: 'local' }, file)).duplicate).toBe(false)
    expect((await dispatchIncoming(event, { actor: 'Hermes', scope: 'local' }, file)).duplicate).toBe(true)
    const restarted = new JsonFluxRepository(file)
    expect((await restarted.load())?.events.filter((item) => item.reason === event.eventId)).toHaveLength(1)
    expect((await dispatchIncoming(event, { actor: 'Hermes', scope: 'local' }, file)).duplicate).toBe(true)
    const state = await restarted.load() as EventState
    expect(state?.eventInbox?.find((item) => item.eventId === event.eventId && item.consumer === 'dispatcher')).toMatchObject({ status: 'completed', attempts: 1 })
    expect(state?.eventReceipts?.find((item) => item.eventId === event.eventId && item.consumer === 'dispatcher')?.eventId).toBe(event.eventId)
  })

  it('persists failed attempts and retries after backoff without replaying a successful mutation', async () => {
    const { file } = await fixture(); const repo = new JsonFluxRepository(file); let mutations = 0
    await expect(processInbox(repo, 'evt-retry', 'worker', () => { throw new Error('temporary') })).rejects.toThrow('temporary')
    expect((await repo.load() as EventState)?.eventInbox?.[0]).toMatchObject({ status: 'failed', attempts: 1, lastError: 'temporary', backoffMs: 1000 })
    await repo.update((state) => { (state as EventState).eventInbox![0].nextRetryAt = new Date(0).toISOString() })
    const retried = await processInbox(repo, 'evt-retry', 'worker', (state) => { mutations += 1; state.events.push({ id: 'mutation-once', time: new Date().toISOString(), actor: 'Hermes', action: 'mutation' }); return { result: 'ok' } })
    expect(retried).toMatchObject({ duplicate: false, status: 'completed', attempts: 2, result: 'ok' })
    expect((await processInbox(repo, 'evt-retry', 'worker', () => { mutations += 1; return { result: 'duplicate-mutation' } })).duplicate).toBe(true)
    expect(mutations).toBe(1)
  })

  it('records heartbeat while processing and sanitizes timeout failures for replay', async () => {
    const { file } = await fixture(); const repo = new JsonFluxRepository(file)
    const running = processInbox(repo, 'evt-timeout', 'consumer', async () => { await new Promise((resolve) => setTimeout(resolve, 150)); return { result: 'late' } }, { timeoutMs: 80, heartbeatMs: 10, retryBaseMs: 1 })
    await new Promise((resolve) => setTimeout(resolve, 35))
    const processing = (await repo.load() as EventState).eventInbox?.find((item) => item.eventId === 'evt-timeout')
    expect(processing).toMatchObject({ status: 'processing', attempts: 1, heartbeatAt: expect.any(String), timeoutMs: 80 })
    await expect(running).rejects.toThrow('timed out')
    const failed = (await repo.load() as EventState).eventInbox?.find((item) => item.eventId === 'evt-timeout')
    expect(failed).toMatchObject({ status: 'failed', attempts: 1, lastError: 'Event evt-timeout processing timed out after 80ms' })
    expect(failed?.lastError).not.toContain('token=')
  })

  it('keeps blocked and explicitly failed events readable with attempts and receipts', async () => {
    const { file } = await fixture(); const repo = new JsonFluxRepository(file)
    const blocked = await processInbox(repo, 'evt-blocked', 'consumer', () => ({ status: 'blocked' as const, result: 'needs-owner' }))
    expect(blocked.status).toBe('blocked')
    const failed = await processInbox(repo, 'evt-failed', 'consumer', () => ({ status: 'failed' as const, result: 'permanent' }))
    expect(failed.status).toBe('failed')
    const readback = await repo.load()
    expect(readEventRecord(readback!, 'evt-blocked', 'consumer')).toMatchObject({ inbox: { status: 'blocked', attempts: 1 }, receipt: { status: 'blocked', eventId: 'evt-blocked' } })
    expect(readEventRecord(readback!, 'evt-failed', 'consumer')).toMatchObject({ inbox: { status: 'failed', attempts: 1 }, receipt: { status: 'failed', eventId: 'evt-failed' } })
  })

  it('persists outbox readback and one receipt per event and consumer', async () => {
    const { file } = await fixture(); const repo = new JsonFluxRepository(file)
    await enqueueEvent(repo, 'evt-out', 'dispatcher'); await enqueueEvent(repo, 'evt-out', 'dispatcher'); await markEventPublished(repo, 'evt-out', 'dispatcher', { type: 'job' }); await markEventPublished(repo, 'evt-out', 'dispatcher', { type: 'job' })
    const state = await repo.load() as EventState; const readback = readEventRecord(state!, 'evt-out', 'dispatcher')
    expect(readback.outbox).toMatchObject({ status: 'published', attempts: 1, eventId: 'evt-out', consumer: 'dispatcher' })
    expect(state?.eventReceipts?.filter((item) => item.eventId === 'evt-out' && item.consumer === 'dispatcher')).toHaveLength(1)
  })
})
