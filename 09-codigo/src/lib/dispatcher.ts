import { createHash, timingSafeEqual } from 'node:crypto'
import { FluxError, updateJobEvent, type AgentRun, type AgentRunEvent, type LocalActor } from './flux-repository'

export type FluxDispatchEvent = { eventId: string; type: 'job' | 'agent_run' | 'heartbeat'; jobId: string; event?: AgentRunEvent; payload: Partial<AgentRun>; sentAt: string; correlationId: string }
export interface DispatcherAdapter { publish(event: FluxDispatchEvent): Promise<void>; receive(event: FluxDispatchEvent): Promise<{ duplicate: boolean; job?: AgentRun }> }
const seen = new Set<string>()
export class FakeDispatcherAdapter implements DispatcherAdapter {
  readonly emitted: FluxDispatchEvent[] = []
  private readonly received = new Set<string>()
  async publish(event: FluxDispatchEvent) { this.emitted.push(structuredClone(event)) }
  async receive(event: FluxDispatchEvent) { if (this.received.has(event.eventId)) return { duplicate: true }; this.received.add(event.eventId); return { duplicate: false } }
}
export class HttpDispatcherAdapter implements DispatcherAdapter {
  constructor(private readonly endpoint: string, private readonly token: string) {}
  async publish(event: FluxDispatchEvent) { const response = await fetch(this.endpoint, { method: 'POST', headers: { authorization: `Bearer ${this.token}`, 'content-type': 'application/json', 'idempotency-key': event.eventId }, body: JSON.stringify(event) }); if (!response.ok) throw new FluxError('DISPATCH_FAILED', `Dispatcher rejected event (${response.status})`, 503) }
  async receive(event: FluxDispatchEvent) { return dispatchIncoming(event, { actor: 'Hermes', scope: 'local' }) }
}
export function configuredDispatcher(): DispatcherAdapter {
  const endpoint = process.env.FLUX_DISPATCHER_URL
  const token = process.env.FLUX_DISPATCHER_TOKEN
  if (!endpoint || !token) throw new FluxError('DISPATCHER_NOT_CONFIGURED', 'Dispatcher requires FLUX_DISPATCHER_URL and FLUX_DISPATCHER_TOKEN in runtime', 503)
  return new HttpDispatcherAdapter(endpoint, token)
}
export async function dispatchIncoming(event: FluxDispatchEvent, actor: LocalActor) {
  if (!event.eventId || !event.jobId || !event.type || !event.sentAt || !event.correlationId) throw new FluxError('INVALID_DISPATCH_EVENT', 'eventId, type, jobId, sentAt and correlationId are required', 400)
  if (seen.has(event.eventId)) return { duplicate: true }
  seen.add(event.eventId)
  if (event.type === 'heartbeat') {
    const job = await updateJobEvent(event.jobId, 'progress', { ...event.payload, sourceType: 'live', historical: false, lastSeen: event.sentAt }, actor)
    return { duplicate: false, job }
  }
  if (!event.event) throw new FluxError('EVENT_REQUIRED', 'job and agent_run events require event', 400)
  const job = await updateJobEvent(event.jobId, event.event, { ...event.payload, sourceType: 'live', historical: false }, actor)
  return { duplicate: false, job }
}
export function verifyDispatcherToken(request: Request) {
  const expected = process.env.FLUX_DISPATCHER_TOKEN
  const received = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!expected || !received) throw new FluxError('DISPATCHER_NOT_CONFIGURED', 'Dispatcher endpoint is not configured in runtime', 503)
  const a = createHash('sha256').update(received).digest(); const b = createHash('sha256').update(expected).digest()
  if (!timingSafeEqual(a, b)) throw new FluxError('DISPATCHER_UNAUTHORIZED', 'Invalid dispatcher credentials', 401)
}
export function newDispatchEvent(input: Omit<FluxDispatchEvent, 'eventId' | 'sentAt'>): FluxDispatchEvent { return { ...input, eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, sentAt: new Date().toISOString() } }
