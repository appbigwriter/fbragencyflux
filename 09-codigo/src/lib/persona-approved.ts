import { createHash } from 'node:crypto'
import { FluxError, type AgentRun, type FluxState, type Handoff, type LocalActor } from './flux-repository'
import { configuredRepository, type FluxStateRepository } from './persistence'
import { processInbox, type EventProcessingStatus, type EventReceipt } from './event-store'

export const PERSONA_APPROVED_CONSUMER = 'flux.persona-approved.provisioning'

export type PersonaApprovedPayload = {
  persona_id: string
  persona_version_id: string
  blog_id: string
  blog_name_version_id?: string
  tenant_id?: string
  project_id?: string
}
export type PersonaApprovedEnvelope = {
  event_id: string
  event_type: 'persona.approved'
  event_version: 1
  occurred_at: string
  source: string
  aggregate_type: 'persona'
  aggregate_id: string
  aggregate_version: number
  correlation_id: string
  causation_id: string | null
  payload: PersonaApprovedPayload
}

export type ProvisionReadback = { status: 'verified' | 'failed'; reference?: string; error?: string }
export type ProvisionResult = { status: 'accepted' | 'blocked' | 'failed'; readback?: ProvisionReadback; error?: string }
export interface PersonaProvisioningAdapter {
  provision(input: { event: PersonaApprovedEnvelope; job: AgentRun; handoff: Handoff }): Promise<ProvisionResult>
}

/** External Authority/Blogs contract is deliberately fail-closed until versioned. */
export class UnconfiguredPersonaProvisioningAdapter implements PersonaProvisioningAdapter {
  async provision(): Promise<ProvisionResult> {
    return { status: 'blocked', error: 'AUTHORITY_BLOGS_ADAPTER_CONTRACT_NOT_READY' }
  }
}

export type PersonaApprovedResult = {
  duplicate: boolean
  status: EventProcessingStatus
  attempts: number
  jobId: string
  handoffId: string
  receipt?: EventReceipt
  readback: { persisted: boolean; status: AgentRun['readbackStatus']; reference?: string }
}
type PersonaProcessingResult = { jobId: string; handoffId: string; readback: { persisted: true; status: 'verified' | 'blocked' | 'failed'; reference?: string } }

const now = () => new Date().toISOString()
const id = (prefix: string, value: string) => `${prefix}-${createHash('sha256').update(value).digest('hex').slice(0, 24)}`
const required = (value: unknown, name: string) => { if (typeof value !== 'string' || !value.trim()) throw new FluxError('INVALID_PERSONA_APPROVED_EVENT', `${name} is required`, 422); return value.trim() }

export function validatePersonaApprovedEnvelope(input: PersonaApprovedEnvelope): PersonaApprovedEnvelope {
  if (!input || input.event_type !== 'persona.approved' || input.event_version !== 1 || input.aggregate_type !== 'persona') throw new FluxError('INVALID_PERSONA_APPROVED_EVENT', 'Only event_version 1 persona.approved envelopes are accepted', 422)
  required(input.event_id, 'event_id'); required(input.occurred_at, 'occurred_at'); required(input.source, 'source'); required(input.aggregate_id, 'aggregate_id'); required(input.correlation_id, 'correlation_id')
  if (!Number.isInteger(input.aggregate_version) || input.aggregate_version < 1) throw new FluxError('INVALID_PERSONA_APPROVED_EVENT', 'aggregate_version must be a positive integer', 422)
  const payload = input.payload
  if (!payload) throw new FluxError('INVALID_PERSONA_APPROVED_EVENT', 'payload is required', 422)
  required(payload.persona_id, 'payload.persona_id'); required(payload.persona_version_id, 'payload.persona_version_id'); required(payload.blog_id, 'payload.blog_id')
  if (Number.isNaN(Date.parse(input.occurred_at))) throw new FluxError('INVALID_PERSONA_APPROVED_EVENT', 'occurred_at must be an ISO date', 422)
  return input
}

function ensureCard(state: FluxState, event: PersonaApprovedEnvelope) {
  const cardId = id('card-persona-approved', `${event.event_id}:${PERSONA_APPROVED_CONSUMER}`)
  if (!state.cards.some((card) => card.id === cardId)) state.cards.push({ id: cardId, project: event.payload.project_id || 'FBR Agency Flux', tenantId: event.payload.tenant_id, title: `Provision approved persona ${event.payload.persona_id}`, status: 'blocked', assignee: 'Théo', priority: 'normal', detail: 'Local provisioning boundary; no external side effects', acceptanceCriteria: ['Authority/Blogs adapter contract is versioned', 'Provisioning and readback are verified'], updatedAt: now() })
  return cardId
}

function buildRecords(state: FluxState, event: PersonaApprovedEnvelope) {
  state.jobs ||= []; state.handoffs ||= []; state.blockers ||= []; state.events ||= []
  const cardId = ensureCard(state, event)
  const jobId = id('job-persona-approved', `${event.event_id}:${PERSONA_APPROVED_CONSUMER}`)
  const handoffId = id('handoff-persona-approved', `${event.event_id}:${PERSONA_APPROVED_CONSUMER}`)
  const blockerId = id('blocker-persona-approved', `${event.event_id}:${PERSONA_APPROVED_CONSUMER}`)
  const timestamp = now()
  const existingJob = state.jobs.find((item) => item.jobId === jobId)
  const existingHandoff = state.handoffs.find((item) => item.id === handoffId)
  const job: AgentRun = { ...(existingJob || {}), jobId, cardId, project: event.payload.project_id || 'FBR Agency Flux', projectId: event.payload.project_id, tenantId: event.payload.tenant_id, personaId: event.payload.persona_id, personaVersionId: event.payload.persona_version_id, blogId: event.payload.blog_id, agent: 'Théo', role: 'integration boundary', objective: 'Provision the approved persona binding and confirm readback', status: existingJob?.status || 'blocked', updatedAt: timestamp, artifactRefs: existingJob?.artifactRefs || [], handoffRefs: existingJob?.handoffRefs || [handoffId], evidenceRefs: existingJob?.evidenceRefs || [], blockers: existingJob?.blockers || [blockerId], nextStep: 'Version the Authority/Blogs adapter contract and execute local fake readback', correlationId: event.correlation_id, source: 'local/persona-approved-inbox', sourceType: 'local', historical: false, activeBlocker: true, verification: 'not_verified', readbackStatus: existingJob?.readbackStatus || 'blocked', lastError: existingJob?.lastError || 'AUTHORITY_BLOGS_ADAPTER_CONTRACT_NOT_READY', lastEvent: 'blocked' }
  if (existingJob) state.jobs = state.jobs.map((item) => item.jobId === jobId ? job : item); else state.jobs.push(job)
  const handoff: Handoff = { ...(existingHandoff || {}), id: handoffId, cardId, project: event.payload.project_id || 'FBR Agency Flux', projectId: event.payload.project_id, tenantId: event.payload.tenant_id, personaId: event.payload.persona_id, personaVersionId: event.payload.persona_version_id, blogId: event.payload.blog_id, from: 'Authority Engine', to: 'Théo', summary: `Provision approved persona ${event.payload.persona_id} for blog ${event.payload.blog_id}`, done: 'Inbox accepted and idempotent local job created', risks: 'Authority/Blogs adapter contract and external readback are not available', nextStep: 'Provide the versioned adapter contract, then run the fake adapter/readback test', acceptanceCriteria: 'Provisioning result and readback reference are persisted before advancement', evidenceRef: 'docs/persona-approved-adapter-blocker.md', createdAt: existingHandoff?.createdAt || timestamp, status: 'blocked', lastUpdate: timestamp, lastBlocker: 'AUTHORITY_BLOGS_ADAPTER_CONTRACT_NOT_READY', lastError: existingHandoff?.lastError || 'AUTHORITY_BLOGS_ADAPTER_CONTRACT_NOT_READY', readbackStatus: existingHandoff?.readbackStatus || 'blocked', blockers: existingHandoff?.blockers || [{ id: blockerId, cardId, cause: 'No verified Authority/Blogs adapter contract is available', status: 'open', owner: 'Théo', nextAction: 'Publish the versioned local adapter contract and fake readback fixture', resolutionPlan: 'Define typed request/response and execute a local fake adapter test with persisted readback', resolutionEvidence: 'docs/persona-approved-adapter-blocker.md', resolution: 'declared', verification: 'verified', resolutionAction: { from: 'Théo', to: 'Théo', objective: 'Unblock persona provisioning', deliverable: 'Versioned adapter contract plus fake readback evidence', acceptanceCriteria: 'Tests prove provision, readback, dedupe and error persistence', evidenceRequired: 'Targeted Vitest output', nextStep: 'Run the targeted test after the external contract is supplied' } }], jobId, correlationId: event.correlation_id, sourceType: 'local', source: 'local/persona-approved-inbox' }
  if (existingHandoff) state.handoffs = state.handoffs.map((item) => item.id === handoffId ? handoff : item); else state.handoffs.push(handoff)
  return { job, handoff, blockerId }
}

export async function receivePersonaApproved(input: PersonaApprovedEnvelope, actor: LocalActor, file?: string, adapter: PersonaProvisioningAdapter = new UnconfiguredPersonaProvisioningAdapter(), repository?: FluxStateRepository): Promise<PersonaApprovedResult> {
  if (!actor || actor.scope !== 'local' || !actor.actor.trim()) throw new FluxError('UNAUTHORIZED_ACTOR', 'A local actor is required', 403)
  const event = validatePersonaApprovedEnvelope(input)
  const repo = repository || configuredRepository(file)
  const result = await processInbox<PersonaProcessingResult>(repo, event.event_id, PERSONA_APPROVED_CONSUMER, async (state) => {
    const records = buildRecords(state, event)
    const provisioned = await adapter.provision({ event, job: records.job, handoff: records.handoff })
    const stamp = now()
    if (provisioned.status === 'accepted' && provisioned.readback?.status === 'verified') {
      records.job.status = 'review'; records.job.activeBlocker = false; records.job.readbackStatus = 'verified'; records.job.verification = 'verified'; records.job.lastError = undefined; records.job.lastEvent = 'review'; records.job.updatedAt = stamp
      records.handoff.status = 'in_progress'; records.handoff.activeBlocker = false; records.handoff.readbackStatus = 'verified'; records.handoff.lastError = undefined; records.handoff.lastUpdate = stamp
      state.blockers ||= []
      state.blockers = state.blockers.filter((blocker) => blocker.id !== records.blockerId)
      return { result: { jobId: records.job.jobId, handoffId: records.handoff.id, readback: { persisted: true, status: 'verified', reference: provisioned.readback.reference } } }
    }
    const error = provisioned.error || provisioned.readback?.error || (provisioned.status === 'accepted' ? 'READBACK_REQUIRED' : 'PERSONA_PROVISIONING_BLOCKED')
    records.job.status = provisioned.status === 'failed' ? 'failed' : 'blocked'; records.job.readbackStatus = provisioned.readback?.status || 'blocked'; records.job.lastError = error; records.job.updatedAt = stamp; records.job.lastEvent = provisioned.status === 'failed' ? 'failed' : 'blocked'
    records.handoff.status = provisioned.status === 'failed' ? 'blocked' : 'blocked'; records.handoff.readbackStatus = provisioned.readback?.status || 'blocked'; records.handoff.lastError = error; records.handoff.lastUpdate = stamp
    return { status: provisioned.status === 'failed' ? 'failed' : 'blocked', result: { jobId: records.job.jobId, handoffId: records.handoff.id, readback: { persisted: true, status: records.job.readbackStatus } } }
  })
  const payload = result.result
  return { duplicate: result.duplicate, status: result.status, attempts: result.attempts, jobId: payload?.jobId || id('job-persona-approved', `${event.event_id}:${PERSONA_APPROVED_CONSUMER}`), handoffId: payload?.handoffId || id('handoff-persona-approved', `${event.event_id}:${PERSONA_APPROVED_CONSUMER}`), receipt: result.receipt, readback: payload?.readback || { persisted: true, status: result.status === 'completed' ? 'verified' : result.status === 'failed' ? 'failed' : 'blocked' } }
}