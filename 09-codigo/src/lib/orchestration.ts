import { createHash } from 'node:crypto'
import { buildDependencyGraph } from './iris-orchestrator'
import { createReceipt } from './observability'
import { FluxError, mutateState, type AgentRun, type CardStatus, type Event, type FluxState, type LocalActor } from './flux-repository'

export type OrchestrationAction = 'start' | 'retry' | 'complete'
export type OrchestrationInput = {
  correlationId: string
  action: OrchestrationAction
  jobId: string
  nextCheck?: string
  evidenceRefs?: string[]
  artifactRefs?: string[]
  readback?: string
  reason?: string
}
export type OrchestrationResult = {
  idempotent: boolean
  executed: boolean
  held: boolean
  reasonCode?: string
  job: AgentRun
  event: Event
  readback: { persisted: boolean; correlationId: string; jobId: string; status: AgentRun['status']; nextCheck?: string; evidenceRefs: string[]; artifactRefs: string[] }
}

const jobTransitions: Record<AgentRun['status'], AgentRun['status'][]> = {
  planned: ['ready', 'blocked', 'failed'], ready: ['in_progress', 'blocked', 'failed'], in_progress: ['review', 'blocked', 'failed'],
  review: ['in_progress', 'completed', 'blocked', 'failed'], blocked: ['ready', 'in_progress', 'failed'], awaiting_owner: ['ready', 'in_progress', 'blocked'],
  completed: [], failed: ['ready', 'in_progress'], not_verified: ['ready', 'in_progress', 'review', 'completed', 'failed'],
}
const cardFor = (state: FluxState, job: AgentRun) => state.cards.find((card) => card.id === job.cardId)
const idFor = (correlationId: string) => `event-orchestration-${createHash('sha256').update(correlationId).digest('hex').slice(0, 20)}`
const validCheck = (value?: string) => value === undefined || (!Number.isNaN(Date.parse(value)) && value.trim().length > 0)
const statusForStart = (job: AgentRun): AgentRun['status'] => job.status === 'planned' ? 'ready' : 'in_progress'

function actorRequired(actor: LocalActor) {
  if (!actor || actor.scope !== 'local' || !actor.actor.trim()) throw new FluxError('UNAUTHORIZED_ACTOR', 'Local actor is required', 403)
}
function evidenceFor(input: OrchestrationInput, job: AgentRun) {
  return { evidenceRefs: [...new Set([...(job.evidenceRefs || []), ...(input.evidenceRefs || [])].filter(Boolean))], artifactRefs: [...new Set([...(job.artifactRefs || []), ...(input.artifactRefs || [])].filter(Boolean))] }
}
function openBlocker(state: FluxState, job: AgentRun) {
  const direct = (state.blockers || []).find((item) => item.id && item.cardId === job.cardId && item.status === 'open')
  const handoff = state.handoffs.find((item) => item.cardId === job.cardId && (item.blockers || []).some((blocker) => blocker.status === 'open'))
  return direct || handoff?.blockers?.find((blocker) => blocker.status === 'open')
}
function pendingGate(state: FluxState, cardId: string) {
  return state.gates.find((gate) => gate.cardId === cardId && gate.status !== 'approved')
}
function dependencyReason(state: FluxState, job: AgentRun) {
  const graph = buildDependencyGraph(state).find((item) => item.jobId === job.jobId)
  const dependencyIds = job.dependsOn?.length ? job.dependsOn : graph?.dependsOn || []
  const dependency = dependencyIds.find((id) => state.jobs?.find((candidate) => candidate.jobId === id)?.status !== 'completed')
  return dependency ? `DEPENDENCY_NOT_READY:${dependency}` : undefined
}
function appendEvent(state: FluxState, input: OrchestrationInput, actor: LocalActor, job: AgentRun, fromStatus: string, toStatus: string, reason?: string) {
  const receipt = createReceipt({ correlationId: input.correlationId, operation: 'orchestration.transition', status: 'completed', actor: actor.actor, jobId: job.jobId, metadata: { fromStatus, toStatus, reason } })
  const event: Event = { id: idFor(input.correlationId), time: new Date().toISOString(), actor: actor.actor, action: 'orchestration transition', jobId: job.jobId, cardId: job.cardId, correlationId: input.correlationId, fromStatus, toStatus, reason, receipt }
  state.events.push(event)
  return event
}

export async function orchestrateLocal(input: OrchestrationInput, actor: LocalActor, file?: string): Promise<OrchestrationResult> {
  actorRequired(actor)
  if (!input.jobId?.trim() || !input.correlationId?.trim()) throw new FluxError('INVALID_ORCHESTRATION', 'jobId and correlationId are required', 422)
  if (!validCheck(input.nextCheck)) throw new FluxError('INVALID_NEXT_CHECK', 'nextCheck must be an ISO date', 422)
  if (!['start', 'retry', 'complete'].includes(input.action)) throw new FluxError('INVALID_ORCHESTRATION', 'Unsupported orchestration action', 422)
  return mutateState((state) => {
    state.jobs ||= []; state.events ||= []
    const prior = state.events.find((event) => event.action === 'orchestration transition' && event.correlationId === input.correlationId)
    const existing = state.jobs.find((job) => job.jobId === input.jobId)
    if (!existing) throw new FluxError('JOB_NOT_FOUND', `Job ${input.jobId} not found`, 404)
    if (prior) {
      const current = state.jobs.find((job) => job.jobId === input.jobId) || existing
      return { idempotent: true, executed: prior.toStatus === 'in_progress' || prior.toStatus === 'completed', held: prior.toStatus === 'blocked' || prior.toStatus === 'ready', reasonCode: prior.reason, job: current, event: prior, readback: { persisted: true, correlationId: input.correlationId, jobId: current.jobId, status: current.status, nextCheck: current.nextCheck, evidenceRefs: current.evidenceRefs || [], artifactRefs: current.artifactRefs || [] } }
    }
    const job = existing
    const card = cardFor(state, job)
    if (!card) throw new FluxError('CARD_NOT_FOUND', `Card ${job.cardId} not found`, 404)
    const fromStatus = job.status
    let target: AgentRun['status'] = job.status
    let reasonCode: string | undefined
    let executed = false
    let held = false
    const evidence = evidenceFor(input, job)
    if (input.action === 'complete') {
      if (!['review', 'in_progress', 'not_verified'].includes(job.status)) throw new FluxError('INVALID_JOB_TRANSITION', `${job.status} cannot complete`, 409)
      if (!evidence.evidenceRefs.length || !evidence.artifactRefs.length || !input.readback?.trim()) throw new FluxError('COMPLETION_EVIDENCE_REQUIRED', 'Completion requires evidenceRefs, artifactRefs and readback', 422)
      target = 'completed'; executed = true
    } else if (['awaiting_approval', 'blocked', 'awaiting_owner'].includes(card.status)) {
      target = 'blocked'; held = true; reasonCode = card.status === 'awaiting_approval' ? 'AWAITING_APPROVAL' : 'CARD_NOT_READY'
    } else if (input.action === 'retry' && !['failed', 'blocked', 'not_verified', 'ready', 'planned'].includes(job.status)) {
      throw new FluxError('INVALID_RETRY', `Cannot retry ${job.status}`, 409)
    } else {
      reasonCode = dependencyReason(state, job)
      const gate = pendingGate(state, card.id)
      const blocker = openBlocker(state, job)
      if (gate) reasonCode = reasonCode || (gate.status === 'pending' ? 'GATE_PENDING' : 'GATE_NOT_APPROVED')
      if (blocker) {
        if (!blocker.owner?.trim() || !blocker.nextAction?.trim()) throw new FluxError('BLOCKER_OWNER_REQUIRED', 'Open blocker requires owner and nextAction', 422)
        reasonCode = reasonCode || 'BLOCKER_OPEN'
      }
      if (reasonCode) { target = 'blocked'; held = true } else { target = statusForStart(job); executed = target === 'in_progress' }
    }
    const allowed = jobTransitions[job.status] || []
    if (target !== job.status && !allowed.includes(target)) throw new FluxError('INVALID_JOB_TRANSITION', `${job.status} cannot transition to ${target}`, 409)
    Object.assign(job, { status: target, updatedAt: new Date().toISOString(), nextCheck: input.nextCheck || job.nextCheck, evidenceRefs: evidence.evidenceRefs, artifactRefs: evidence.artifactRefs, verification: target === 'completed' ? 'verified' : job.verification || 'not_verified', lastEvent: target === 'completed' ? 'completed' : held ? 'waiting_input' : 'started' })
    if (target === 'completed') job.completedAt = new Date().toISOString()
    const event = appendEvent(state, input, actor, job, fromStatus, target, reasonCode || input.reason)
    return { idempotent: false, executed, held, reasonCode, job, event, readback: { persisted: true, correlationId: input.correlationId, jobId: job.jobId, status: job.status, nextCheck: job.nextCheck, evidenceRefs: job.evidenceRefs, artifactRefs: job.artifactRefs } }
  }, file)
}

export const runLocalOrchestration = orchestrateLocal
export const retryLocalJob = (jobId: string, correlationId: string, actor: LocalActor, file?: string, nextCheck?: string) => orchestrateLocal({ action: 'retry', jobId, correlationId, nextCheck }, actor, file)
export function validJobNextStatuses(status: AgentRun['status']) { return jobTransitions[status] || [] }
export function cardStatusCanExecute(status: CardStatus) { return status !== 'awaiting_approval' }
