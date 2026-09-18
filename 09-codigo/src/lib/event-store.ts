import { createHash } from 'node:crypto'
import type { FluxState } from './flux-repository'
import type { FluxStateRepository } from './persistence'
import { createReceipt, sanitizeError, type Receipt } from './observability'

export type EventProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'blocked'
export type EventConsumer = string
export type EventInboxRecord = {
  eventId: string
  consumer: EventConsumer
  status: EventProcessingStatus
  attempts: number
  attemptCount: number
  lastError?: string
  nextRetryAt?: string
  backoffMs: number
  receivedAt: string
  processedAt?: string
  updatedAt: string
  heartbeatAt?: string
  leaseUntil?: string
  timeoutMs?: number
  receiptId?: string
  result?: unknown
}
export type EventOutboxRecord = {
  eventId: string
  consumer: EventConsumer
  status: 'pending' | 'published' | 'failed'
  attempts: number
  lastError?: string
  nextRetryAt?: string
  backoffMs: number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  receiptId?: string
}
export type EventReceipt = Receipt & { id: string; eventId: string; consumer: EventConsumer }
export type EventState = FluxState & { eventInbox?: EventInboxRecord[]; eventOutbox?: EventOutboxRecord[]; eventReceipts?: EventReceipt[] }

type HandlerResult<T> = { status?: EventProcessingStatus; result?: T }
type ProcessInboxOptions = { timeoutMs?: number; heartbeatMs?: number; retryBaseMs?: number }

const inbox = (state: FluxState) => { const target = state as EventState; target.eventInbox ||= []; return target.eventInbox }
const outbox = (state: FluxState) => { const target = state as EventState; target.eventOutbox ||= []; return target.eventOutbox }
const receipts = (state: FluxState) => { const target = state as EventState; target.eventReceipts ||= []; return target.eventReceipts }
const receiptId = (eventId: string, consumer: string, operation: string) => `receipt-event-${createHash('sha256').update(`${operation}:${consumer}:${eventId}`).digest('hex').slice(0, 24)}`
const now = () => new Date().toISOString()
const retryDelay = (attempts: number, base: number) => Math.min(base * 2 ** Math.max(0, attempts - 1), 60_000)
const sameKey = (item: { eventId: string; consumer: string }, eventId: string, consumer: string) => item.eventId === eventId && item.consumer === consumer
const isActiveLease = (record: EventInboxRecord) => record.status === 'processing' && Boolean(record.leaseUntil && Date.parse(record.leaseUntil) > Date.now())

function addReceipt(state: FluxState, eventId: string, consumer: string, status: Receipt['status'], attempts: number, metadata: Record<string, unknown> = {}) {
  const receipt: EventReceipt = {
    ...createReceipt({ correlationId: `event:${eventId}`, operation: 'event.consume', status, metadata: { eventId, consumer, attempts, ...metadata } }),
    id: receiptId(eventId, consumer, 'consume'), eventId, consumer,
  }
  const list = receipts(state); const index = list.findIndex((item) => item.id === receipt.id)
  if (index >= 0) list[index] = receipt; else list.push(receipt)
  return receipt
}

export function readEventRecord(state: FluxState, eventId: string, consumer: EventConsumer): { inbox?: EventInboxRecord; outbox?: EventOutboxRecord; receipt?: EventReceipt } {
  const target = state as EventState
  return { inbox: target.eventInbox?.find((item) => sameKey(item, eventId, consumer)), outbox: target.eventOutbox?.find((item) => sameKey(item, eventId, consumer)), receipt: target.eventReceipts?.find((item) => sameKey(item, eventId, consumer)) }
}
export function readEventReceipt(state: FluxState, eventId: string, consumer: EventConsumer) { return readEventRecord(state, eventId, consumer).receipt }

export async function enqueueEvent(repository: FluxStateRepository, eventId: string, consumer: EventConsumer): Promise<EventOutboxRecord> {
  return repository.update((state) => {
    const list = outbox(state); const stamp = now(); const existing = list.find((item) => sameKey(item, eventId, consumer))
    if (existing) return structuredClone(existing)
    const record: EventOutboxRecord = { eventId, consumer, status: 'pending', attempts: 0, backoffMs: 0, createdAt: stamp, updatedAt: stamp }
    list.push(record); return structuredClone(record)
  })
}

export async function markEventPublished(repository: FluxStateRepository, eventId: string, consumer: EventConsumer, metadata: Record<string, unknown> = {}): Promise<EventOutboxRecord> {
  return repository.update((state) => {
    const record = outbox(state).find((item) => sameKey(item, eventId, consumer))
    if (!record) throw new Error(`Outbox event ${eventId} for ${consumer} was not enqueued`)
    if (record.status === 'published') return structuredClone(record)
    const stamp = now(); record.status = 'published'; record.attempts += 1; record.updatedAt = stamp; record.publishedAt = stamp
    const receipt = { ...createReceipt({ correlationId: `event:${eventId}`, operation: 'event.publish', status: 'completed', metadata: { eventId, consumer, ...metadata } }), id: receiptId(eventId, consumer, 'publish'), eventId, consumer }
    record.receiptId = receipt.id; const existing = receipts(state).findIndex((item) => item.id === receipt.id)
    if (existing >= 0) receipts(state)[existing] = receipt; else receipts(state).push(receipt)
    return structuredClone(record)
  })
}

/**
 * Claims an inbox key durably, executes the handler outside the repository lock,
 * and commits the result/receipt. A lease makes a crashed worker replayable.
 */
export async function processInbox<T>(repository: FluxStateRepository, eventId: string, consumer: EventConsumer, handler: (state: FluxState, attempt: number) => HandlerResult<T> | Promise<HandlerResult<T>>, options: ProcessInboxOptions = {}): Promise<{ duplicate: boolean; status: EventProcessingStatus; attempts: number; result?: T; receipt?: EventReceipt; record: EventInboxRecord }> {
  const timeoutMs = Math.max(1, options.timeoutMs ?? 5_000)
  const heartbeatMs = Math.max(1, Math.min(options.heartbeatMs ?? Math.floor(timeoutMs / 3), timeoutMs))
  const retryBaseMs = Math.max(1, options.retryBaseMs ?? 1_000)
  const stamp = now()
  const claim = await repository.update((state) => {
    const list = inbox(state); let record = list.find((item) => sameKey(item, eventId, consumer))
    if (record && (record.status === 'completed' || record.status === 'blocked')) return { claimed: false, duplicate: true, record: structuredClone(record), receipt: readEventReceipt(state, eventId, consumer) }
    if (record && record.status === 'processing' && isActiveLease(record)) return { claimed: false, duplicate: true, record: structuredClone(record), receipt: readEventReceipt(state, eventId, consumer) }
    if (record?.status === 'failed' && record.nextRetryAt && Date.parse(record.nextRetryAt) > Date.now()) return { claimed: false, duplicate: false, record: structuredClone(record), receipt: readEventReceipt(state, eventId, consumer) }
    const attempts = (record?.attempts || 0) + 1
    if (!record) { record = { eventId, consumer, status: 'processing', attempts, attemptCount: attempts, backoffMs: 0, receivedAt: stamp, updatedAt: stamp }; list.push(record) }
        else { record.status = 'processing'; record.attempts = attempts; record.attemptCount = attempts; record.updatedAt = stamp; record.lastError = undefined }
    record.timeoutMs = timeoutMs; record.heartbeatAt = stamp; record.leaseUntil = new Date(Date.now() + timeoutMs).toISOString()
    return { claimed: true, duplicate: false, record: structuredClone(record) }
  })
  if (!claim.claimed) {
    if (claim.record.status === 'failed' && claim.record.nextRetryAt && Date.parse(claim.record.nextRetryAt) > Date.now()) throw new Error(`Event ${eventId} is in retry backoff until ${claim.record.nextRetryAt}`)
    return { duplicate: claim.duplicate, status: claim.record.status, attempts: claim.record.attempts, receipt: claim.receipt, result: claim.record.result as T | undefined, record: claim.record }
  }

  let heartbeat: ReturnType<typeof setInterval> | undefined
  const beat = async () => {
    await repository.update((state) => {
      const record = inbox(state).find((item) => sameKey(item, eventId, consumer)); if (!record || record.status !== 'processing') return
      const heartbeatAt = now(); record.heartbeatAt = heartbeatAt; record.updatedAt = heartbeatAt; record.leaseUntil = new Date(Date.now() + timeoutMs).toISOString()
    })
  }
  heartbeat = setInterval(() => { void beat().catch(() => undefined) }, heartbeatMs); heartbeat.unref?.()
  try {
    const draft = await repository.load()
    if (!draft) throw new Error('State not initialized')
    const work = Promise.resolve().then(() => handler(draft, claim.record.attempts))
    const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Event ${eventId} processing timed out after ${timeoutMs}ms`)), timeoutMs))
    const result = await Promise.race([work, timeout])
    clearInterval(heartbeat); heartbeat = undefined
    return await repository.update((state) => {
      Object.assign(state, draft)
      const record = inbox(state).find((item) => sameKey(item, eventId, consumer))!
      const completedAt = now(); record.status = result.status || 'completed'; record.result = result.result; record.updatedAt = completedAt; record.processedAt = completedAt; record.heartbeatAt = completedAt; record.attemptCount = record.attempts; delete record.leaseUntil; record.backoffMs = 0; delete record.nextRetryAt
      const receiptStatus: Receipt['status'] = record.status === 'completed' ? 'completed' : record.status === 'failed' ? 'failed' : 'blocked'
      const receipt = addReceipt(state, eventId, consumer, receiptStatus, record.attempts)
      record.receiptId = receipt.id
      return { duplicate: false, status: record.status, attempts: record.attempts, result: result.result, receipt, record: structuredClone(record) }
    })
  } catch (error) {
    if (heartbeat) clearInterval(heartbeat)
    const safe = sanitizeError(error); const delay = retryDelay(claim.record.attempts, retryBaseMs)
    const failed = await repository.update((state) => {
      const record = inbox(state).find((item) => sameKey(item, eventId, consumer))!
      record.status = 'failed'; record.lastError = safe; record.backoffMs = delay; record.nextRetryAt = new Date(Date.now() + delay).toISOString(); record.updatedAt = now(); record.attemptCount = record.attempts; record.heartbeatAt = record.updatedAt; delete record.leaseUntil
      const receipt = addReceipt(state, eventId, consumer, 'failed', record.attempts, { error: safe, nextRetryAt: record.nextRetryAt })
      record.receiptId = receipt.id
      return { duplicate: false, status: record.status, attempts: record.attempts, receipt, record: structuredClone(record) }
    })
    throw Object.assign(new Error(safe), { code: 'EVENT_PROCESSING_FAILED', receipt: failed.receipt })
  }
}

export const processInboxAsync = processInbox
