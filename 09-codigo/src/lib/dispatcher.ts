import { createHash, timingSafeEqual } from 'node:crypto'
import { FluxError, mutateState, type AgentRun, type AgentRunEvent, type LocalActor } from './flux-repository'
import { createReceipt, sanitizeError, type Receipt } from './observability'

export type FluxDispatchEvent = { eventId: string; type: 'job' | 'agent_run' | 'heartbeat'; jobId: string; event?: AgentRunEvent; payload: Partial<AgentRun>; sentAt: string; correlationId: string }
export interface DispatcherAdapter { publish(event: FluxDispatchEvent): Promise<void>; receive(event: FluxDispatchEvent): Promise<{ duplicate: boolean; job?: AgentRun; receipt?: Receipt }> }
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
const statusMap: Partial<Record<AgentRunEvent, AgentRun['status']>> = { started: 'in_progress', progress: 'in_progress', waiting_input: 'blocked', blocked: 'blocked', review: 'review', completed: 'completed', failed: 'failed', cancelled: 'failed' }
function baseline(event: FluxDispatchEvent, now: string): AgentRun {
  if (!event.payload.cardId || !event.payload.agent || !event.payload.objective) throw new FluxError('INVALID_DISPATCH_EVENT', 'New dispatcher jobs require cardId, agent and objective', 400)
  const { jobId: _jobId, cardId: _cardId, agent: _agent, objective: _objective, updatedAt: _updatedAt, ...payload } = event.payload
  return { jobId: event.jobId, cardId: event.payload.cardId, project: event.payload.project || 'FBR Agency Flux', agent: event.payload.agent, role: event.payload.role || event.payload.agent, objective: event.payload.objective, status: 'planned', updatedAt: now, artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: event.payload.nextStep || 'Registrar evidência e readback', correlationId: event.correlationId, source: event.payload.source || 'local/dispatcher', sourceType: 'live', historical: false, activeBlocker: false, verification: 'not_verified', ...payload }
}
export async function dispatchIncoming(event: FluxDispatchEvent, actor: LocalActor, file?: string) {
  if (!event.eventId || !event.jobId || !event.type || !event.sentAt || !event.correlationId) throw new FluxError('INVALID_DISPATCH_EVENT', 'eventId, type, jobId, sentAt and correlationId are required', 400)
  if (!file && seen.has(event.eventId)) return { duplicate: true }
  try {
    return await mutateState((state) => {
      state.events ||= []; state.jobs ||= []; state.agentRuns = state.jobs
      if (state.events.some((item) => item.action === 'dispatcher event accepted' && item.reason === event.eventId)) { seen.add(event.eventId); return { duplicate: true } }
      const now = new Date().toISOString()
      const current = state.jobs.find((item) => item.jobId === event.jobId)
      const nextEvent = event.type === 'heartbeat' ? 'progress' : event.event
      if (event.type !== 'heartbeat' && !nextEvent) throw new FluxError('EVENT_REQUIRED', 'job and agent_run events require event', 400)
      const job = { ...(current || baseline(event, now)), ...event.payload, jobId: event.jobId, updatedAt: now, lastSeen: event.sentAt, sourceType: 'live' as const, historical: false, activeBlocker: event.payload.activeBlocker ?? current?.activeBlocker ?? false, status: event.payload.status || (nextEvent ? statusMap[nextEvent] : undefined) || current?.status || 'in_progress', lastEvent: nextEvent } as AgentRun
      if (job.status === 'completed' && !job.evidenceRefs.length && !job.artifactRefs.length) job.status = 'not_verified'
      if (current) state.jobs = state.jobs.map((item) => item.jobId === job.jobId ? job : item); else state.jobs.push(job)
      state.agentRuns = state.jobs
      const receipt = createReceipt({ correlationId: event.correlationId, operation: 'dispatcher.receive', status: 'completed', actor: actor.actor, jobId: job.jobId, startedAt: event.sentAt, completedAt: now, metadata: { eventId: event.eventId, type: event.type } })
      state.events.push({ id: `event-dispatch-${event.eventId}`, time: event.sentAt, actor: actor.actor, action: 'dispatcher event accepted', jobId: event.jobId, correlationId: event.correlationId, reason: event.eventId, receipt })
      seen.add(event.eventId)
      return { duplicate: false, job, receipt }
    }, file)
  } catch (error) {
    seen.delete(event.eventId)
    throw error instanceof FluxError ? error : new FluxError('DISPATCH_FAILED', sanitizeError(error), 503)
  }
}
export function verifyDispatcherToken(request: Request) {
  const expected = process.env.FLUX_DISPATCHER_TOKEN
  const received = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!expected || !received) throw new FluxError('DISPATCHER_NOT_CONFIGURED', 'Dispatcher endpoint is not configured in runtime', 503)
  const a = createHash('sha256').update(received).digest(); const b = createHash('sha256').update(expected).digest()
  if (!timingSafeEqual(a, b)) throw new FluxError('DISPATCHER_UNAUTHORIZED', 'Invalid dispatcher credentials', 401)
}
export function newDispatchEvent(input: Omit<FluxDispatchEvent, 'eventId' | 'sentAt'>): FluxDispatchEvent { return { ...input, eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`, sentAt: new Date().toISOString() } }
