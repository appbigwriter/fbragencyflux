import { mkdir, readFile, rename, stat } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

export type ProjectStatus = 'active' | 'blocked' | 'planned'
export type CardStatus = 'planned' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'awaiting_approval' | 'approved' | 'executing' | 'verifying' | 'completed' | 'failed'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type GateStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'
export type GateDecision = Exclude<GateStatus, 'pending'>
export type Gate = {
  id: string; cardId: string; project: string; title: string; requiredDecision: string; status: GateStatus
  impact: string; cost: string; scope: string; reversibility: string; rollback: string; evidence: string[]
  owner: string; requestedAt: string; decidedAt?: string; decidedBy?: string; externalActionAuthorized: false; blockers: string[]
}
export type Project = { id: string; name: string; status: ProjectStatus; owner: string; description: string }
export type Card = { id: string; title: string; project: string; status: CardStatus; assignee: string; priority: 'high' | 'normal'; detail: string; acceptanceCriteria: string[]; updatedAt: string }
export type Approval = { id: string; cardId: string; title: string; requestedBy: string; impact: string; scope: string; rollback: string; status: ApprovalStatus; decidedAt?: string; decidedBy?: string }
export type Event = { id: string; time: string; actor: string; action: string; cardId?: string; correlationId?: string; fromStatus?: string; toStatus?: string; reason?: string }
export type BlockerStatus = 'open' | 'resolved' | 'legacy'
export type BlockerResolution = 'declared' | 'not_declared' | 'legacy'
export type Blocker = { id: string; sourceId?: string; cardId?: string; cause: string; status: BlockerStatus; owner: string; nextAction: string; resolutionPlan: string; resolutionEvidence: string; resolution: BlockerResolution; verification: 'verified' | 'unverified' }
export type BlockerInput = Partial<Blocker> & { id: string; cause: string }
export type Risk = { sourceId: string; cause: string }
export type Handoff = { id: string; cardId: string; project: string; from: string; to: string; summary: string; done: string; risks: string; nextStep: string; acceptanceCriteria: string; evidenceRef: string; createdAt: string; blockers?: BlockerInput[] }
export type Artifact = { id: string; cardId: string; name: string; kind: string; status: string; path: string; sourcePath: string; size: number }
export type JobStatus = 'planned' | 'in_progress' | 'review' | 'blocked' | 'completed' | 'failed' | 'not_verified'
export type AgentRunEvent = 'dispatched' | 'accepted' | 'started' | 'progress' | 'waiting_input' | 'blocked' | 'artifact_created' | 'handoff_sent' | 'review' | 'completed' | 'failed' | 'cancelled'
export type AgentRun = { jobId: string; cardId: string; project: string; agent: string; role: string; objective: string; status: JobStatus; startedAt?: string; updatedAt: string; completedAt?: string; artifactRefs: string[]; handoffRefs: string[]; evidenceRefs: string[]; blockers: string[]; nextStep: string; correlationId: string; source: string; lastSeen?: string; progress?: number; currentStep?: string; owner?: string; lastEvent?: AgentRunEvent; verification?: 'verified' | 'not_verified' }
export type Job = AgentRun
export type FluxState = { version: number; projects: Project[]; cards: Card[]; approvals: Approval[]; gates: Gate[]; events: Event[]; handoffs: Handoff[]; artifacts: Artifact[]; blockers?: BlockerInput[]; jobs?: Job[]; agentRuns?: AgentRun[] }
export type DashboardSnapshot = Omit<FluxState, 'approvals' | 'events' | 'blockers'> & { approvals: { pending: number; items: Approval[] }; recentEvents: Event[]; activeCards: number; blockers: Blocker[]; risks: Risk[]; pendingGates: number; pendingCards: number; blockerCount: number; projectCards: Record<string, Card[]> }
export type LocalActor = { actor: string; scope: 'local' }

export function validateBlocker(input: BlockerInput): void {
  if (input.status === 'open') {
    const missing = (['owner', 'nextAction', 'resolutionPlan'] as const).filter((key) => !input[key]?.trim())
    if (missing.length) throw new FluxError('INVALID_BLOCKER', `Open blocker requires ${missing.join(', ')}`)
  }
}

export function normalizeBlocker(input: BlockerInput, sourceId?: string): Blocker {
  const explicitStatus = input.status === 'open' || input.status === 'resolved' || input.status === 'legacy'
  const status: BlockerStatus = explicitStatus ? input.status! : 'legacy'
  if (status === 'open') validateBlocker(input)
  const plan = input.resolutionPlan?.trim() || ''
  return { id: input.id, sourceId: input.sourceId || sourceId, cardId: input.cardId, cause: input.cause, status, owner: input.owner?.trim() || '', nextAction: input.nextAction?.trim() || '', resolutionPlan: plan, resolutionEvidence: input.resolutionEvidence?.trim() || '', resolution: input.resolution || (plan ? 'declared' : status === 'legacy' ? 'not_declared' : 'not_declared'), verification: input.verification || (status === 'legacy' ? 'unverified' : 'verified') }
}

export class FluxError extends Error { constructor(public code: string, message: string, public status = 400) { super(message) } }
const transitions: Record<CardStatus, CardStatus[]> = { planned: ['ready'], ready: ['in_progress'], in_progress: ['review', 'blocked'], review: ['awaiting_approval', 'in_progress', 'blocked'], blocked: ['ready', 'in_progress'], awaiting_approval: ['approved', 'blocked'], approved: ['executing'], executing: ['verifying', 'failed'], verifying: ['completed', 'failed'], completed: [], failed: ['in_progress'] }
const allowedActors = new Set(['Sergio', 'Íris', 'Gabe', 'Kora', 'Théo', 'Bia', 'Lia', 'Caio', 'Vito', 'Rick', 'Rafa'])
const root = path.resolve(process.cwd(), '..')
const historyRoot = path.join(root, '08-historico', 'afterforty')
const afterFortyPackage = path.resolve(root, '..', 'FBR Blogs', 'After Forty')

function scalar(value: string) { return value.trim().replace(/^['\"]|['\"]$/g, '') }
function extractField(text: string, names: string[]) { const re = new RegExp('(?:^|\\n)\\s*(?:' + names.join('|') + ')\\s*:\\s*(.*)', 'i'); const match = re.exec(text); return match ? scalar(match[1]) : '' }
function extractList(text: string, names: string[]) { const match = new RegExp('(?:^|\\n)\\s*(?:' + names.join('|') + ')\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*[A-Za-zÀ-ÿ][^\\n:]{0,80}:|$)', 'i').exec(text); return match ? [...match[1].matchAll(/(?:^|\n)\s*[-*]\s*["']?(.+?)["']?\s*$/gm)].map((m) => scalar(m[1])) : [] }
function derivedStatus(raw: string, blockers: string[], source: string): JobStatus { const s = raw.toLowerCase(); if (!source) return 'not_verified'; if (s.includes('block')) return 'blocked'; if (s.includes('review') || s.includes('pending') || s.includes('conditional')) return 'review'; if (s.includes('complete') || s.includes('validated') || s.includes('pass')) return 'completed'; return blockers.length ? 'blocked' : 'not_verified' }
function parseHandoff(text: string, sourcePath: string, index: number): AgentRun | null { const agent = extractField(text, ['de']); const objective = extractField(text, ['objetivo(?: do job|_do_job)?']); const cardId = extractField(text, ['card']); if (!agent || !objective || !cardId) return null; const blockers = extractList(text, ['pend[êe]ncias(?:\\/|_)blockers', 'blockers']); const criteria = extractList(text, ['critérios de aceite(?:\\/|_)evidência', 'criterios de aceite(?:\\/|_)evidencia']); const deliverable = extractField(text, ['entreg[aá]vel', 'entregavel']); const rawStatus = extractField(text, ['status']); const updatedAt = new Date().toISOString(); const agentName = agent.split('/')[0].trim(); const jobId = `job-${cardId}-${agentName}-${path.basename(sourcePath, path.extname(sourcePath))}-${index}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase(); return { jobId, cardId, project: cardId.startsWith('AF-') ? 'After Forty' : 'FBR Agency Flux', agent: agentName, role: agent, objective, status: derivedStatus(rawStatus, blockers, sourcePath), updatedAt, lastSeen: updatedAt, artifactRefs: deliverable ? [deliverable] : [], handoffRefs: [sourcePath], evidenceRefs: [sourcePath, ...criteria], blockers, nextStep: extractField(text, ['próximo passo', 'next step']) || (criteria[0] || 'Aguardando próxima instrução registrada'), correlationId: `filesystem-${path.basename(sourcePath)}-${index}`, source: 'filesystem/Handoff readback', verification: 'verified', lastEvent: 'handoff_sent' } }
export async function syncAgentRuns(state: FluxState, roots: string[] = [historyRoot, afterFortyPackage]): Promise<AgentRun[]> { const found = new Map<string, AgentRun>(); for (const base of roots) { let files: string[] = []; try { const walk = async (dir: string): Promise<void> => { for (const entry of await readdir(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) await walk(full); else if (/\.(md|yaml|yml)$/i.test(entry.name)) files.push(full) } }; await walk(base) } catch { continue }; for (const sourcePath of files.sort()) { let text = ''; try { text = await readFile(sourcePath, 'utf8') } catch { continue }; const chunks = text.split(/(?=\n\s*(?:[-*]\s*)?de\s*:)/i); chunks.forEach((chunk, index) => { const parsed = parseHandoff(chunk, sourcePath, index); if (parsed && !found.has(parsed.jobId)) found.set(parsed.jobId, parsed) }) } } const unique = new Map([...(state.jobs || []), ...found.values()].map((run) => [run.jobId, run])); state.jobs = [...unique.values()]; state.agentRuns = state.jobs; return state.jobs }
const seededGates: Gate[] = [
  { id: 'FLUX-GATE-01', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Concepção e escopo do Flux', requiredDecision: 'Confirmar concepção, escopo, critérios de aceite e ownership do ciclo atual', status: 'pending', impact: 'Define a base transversal; não executa jobs nem integrações', cost: 'Nenhum custo local; custo externo não autorizado', scope: 'FBR Agency Flux · concepção, escopo, critérios e ownership · decisão local', reversibility: 'Reversível antes de iniciar execução', rollback: 'Retornar o escopo ao último registro aprovado e reabrir revisão', evidence: ['resultado-esperado-do-flux.md', 'ACCEPTANCE-MATRIX.md'], owner: 'Íris', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Concepção exige revisão e decisão explícita de Sergio'] },
  { id: 'FLUX-GATE-02', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Sincronização de agentes, jobs, skills e workflows', requiredDecision: 'Confirmar mapa de agentes, jobs, skills e workflows e sua sincronização no estado do Flux', status: 'pending', impact: 'Coordena execução transversal; não dispara agent ou job externo', cost: 'Nenhum custo local; custo de execução não autorizado', scope: 'Agentes · jobs · skills · workflows · versões e ownership · estado local', reversibility: 'Reversível alterando o mapa/versionamento local', rollback: 'Restaurar o mapa anterior e registrar divergências', evidence: ['fbr-agency-flux.md: Controle em tempo real da concepção'], owner: 'Kora', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Eventos e Handoffs de agentes/jobs ainda precisam de sincronização contínua'] },
  { id: 'FLUX-GATE-03', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Dependências, Handoffs e evidências', requiredDecision: 'Confirmar dependências, próximo responsável, Handoffs e evidências suficientes para avançar', status: 'pending', impact: 'Impede avanço sem rastreabilidade; não altera projeto externo', cost: 'Nenhum custo local', scope: 'Cards · dependências · Handoffs · artefatos · evidências · blockers', reversibility: 'Reversível reabrindo revisão ou devolvendo Handoff', rollback: 'Bloquear o card, registrar risco e devolver ao owner anterior', evidence: ['overnight-delivery-readiness.md', 'artifacts e Handoffs persistidos localmente'], owner: 'Gabe', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Toda conclusão exige artefato/evidência verificável'] },
  { id: 'FLUX-GATE-04', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Status em tempo real e decisões de Sergio', requiredDecision: 'Confirmar que status, decisões, eventos e readbacks estão visíveis e separados de execução externa', status: 'pending', impact: 'Governa decisões transversais; aprovação local não é execução', cost: 'Nenhum custo local; gasto/publicação/deploy continuam bloqueados', scope: 'Dashboard · API · repositório local · eventos · readback · decisões de Sergio', reversibility: 'Reversível corrigindo estado local e reabrindo decisão', rollback: 'Preservar histórico, marcar changes_requested e retornar ao owner', evidence: ['README.md', 'tests/gates.test.ts', 'LOCAL DECISION / NO EXTERNAL EFFECT'], owner: 'Sergio', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Auth remoto e integrações permanecem fora deste gate local'] }
]

export function dataFilePath(file = process.env.FLUX_DATA_FILE): string { return path.resolve(file || path.join(process.cwd(), 'data', 'flux-state.json')) }
function validateLocal(actor: LocalActor) { if (!actor || actor.scope !== 'local' || !allowedActors.has(actor.actor)) throw new FluxError('UNAUTHORIZED_ACTOR', 'Actor is not authorized for local Flux operations', 403) }
async function syncArtifacts(state: FluxState): Promise<FluxState> {
  const draftDir = path.join(historyRoot, 'drafts'); let names: string[] = []
  try { names = (await readdir(draftDir)).filter((n) => n.endsWith('.md')).sort() } catch { return state }
  const cardId = state.cards.some((c) => c.id === 'AF-001') ? 'AF-001' : state.cards[0]?.id
  if (!cardId) return state
  const existing = new Map(state.artifacts.map((a) => [a.sourcePath, a]))
  for (const name of names) { const sourcePath = path.join(draftDir, name); const info = await stat(sourcePath); if (!existing.has(sourcePath)) state.artifacts.push({ id: `artifact-${name.replace(/[^a-z0-9]/gi, '-')}`, cardId, name, kind: 'real-filesystem-article', status: 'available', path: sourcePath, sourcePath, size: info.size }) }
  return state
}
async function load(file?: string): Promise<FluxState> {
  const target = dataFilePath(file)
  let state: FluxState
  try { state = JSON.parse(await readFile(target, 'utf8')) as FluxState } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    const seedPath = path.join(process.cwd(), 'data', 'flux-state.json')
    if (target === dataFilePath() || target === seedPath) throw new FluxError('STATE_NOT_FOUND', `Flux state not found at ${target}`, 500)
    state = JSON.parse(await readFile(seedPath, 'utf8')) as FluxState
  }
  state.projects = state.projects || []
  state.cards = state.cards || []
  state.artifacts = state.artifacts || []
  state.handoffs = state.handoffs || []
  state.events = state.events || []
  state.approvals = state.approvals || []
  state = await syncArtifacts(state)
  await syncAgentRuns(state)
  state.artifacts = state.artifacts || []
  state.handoffs = state.handoffs || []
  state.events = state.events || []
  state.approvals = state.approvals || []
  if (!state.gates) { state.gates = seededGates.map((gate) => ({ ...gate, evidence: [...gate.evidence], blockers: [...gate.blockers] })); await save(state, target) }
  if (state.artifacts.length || state.jobs) await save(state, target)
  return state
}
async function save(state: FluxState, file?: string): Promise<void> { const target = dataFilePath(file); await mkdir(path.dirname(target), { recursive: true }); const temporary = `${target}.${process.pid}.tmp`; await (await import('node:fs/promises')).writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8'); await rename(temporary, target) }
export async function getState(file?: string) { return load(file) }
export async function getJobs(file?: string, filters: { agent?: string; status?: string; card?: string } = {}) { const jobs = (await load(file)).jobs || []; return jobs.filter((job) => (!filters.agent || job.agent === filters.agent) && (!filters.status || job.status === filters.status) && (!filters.card || job.cardId === filters.card)).map((job) => ({ ...job, stale: Boolean(job.lastSeen && Date.now() - Date.parse(job.lastSeen) > 30000) })) }
export async function getJob(id: string, file?: string) { const job = (await load(file)).jobs?.find((item) => item.jobId === id); if (!job) throw new FluxError('JOB_NOT_FOUND', `Job ${id} not found`, 404); return job }
const runFields = ['jobId','cardId','project','agent','role','objective','status','startedAt','updatedAt','completedAt','artifactRefs','handoffRefs','evidenceRefs','blockers','nextStep','correlationId','source','lastSeen','progress','currentStep','owner','lastEvent','verification'] as const
export async function upsertJob(input: Partial<AgentRun>, actor: LocalActor, file?: string) { validateLocal(actor); if (!input.jobId || !input.cardId || !input.agent || !input.objective) throw new FluxError('INVALID_JOB', 'jobId, cardId, agent and objective are required'); const state = await load(file); const now = new Date().toISOString(); const current = (state.jobs || []).find((item) => item.jobId === input.jobId); const job: AgentRun = { ...(current || { role: '', project: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: '', correlationId: `local-${Date.now()}`, source: 'local/dispatcher adapter', updatedAt: now }), ...input, updatedAt: now, lastSeen: input.lastSeen || now, verification: input.verification || current?.verification || 'not_verified' } as AgentRun; if (job.status === 'completed' && !job.evidenceRefs.length && !job.artifactRefs.length) job.status = 'not_verified'; state.jobs = current ? state.jobs!.map((item) => item.jobId === job.jobId ? job : item) : [...(state.jobs || []), job]; state.agentRuns = state.jobs; await save(state, file); return job }
export async function updateJobEvent(id: string, event: AgentRunEvent, patch: Partial<AgentRun>, actor: LocalActor, file?: string) { const current = await getJob(id, file); const statusMap: Partial<Record<AgentRunEvent, JobStatus>> = { started: 'in_progress', progress: 'in_progress', waiting_input: 'blocked', blocked: 'blocked', review: 'review', completed: 'completed', failed: 'failed', cancelled: 'failed' }; return upsertJob({ ...current, ...patch, lastEvent: event, status: patch.status || statusMap[event] || current.status, completedAt: event === 'completed' ? new Date().toISOString() : patch.completedAt }, actor, file) }

export async function getGates(file?: string): Promise<Gate[]> { return (await load(file)).gates.filter((gate) => gate.project === 'FBR Agency Flux') }
export async function getSnapshot(file?: string): Promise<DashboardSnapshot> {
  const state = await load(file)
  const projectCards = Object.fromEntries(state.projects.map((project) => [project.name, state.cards.filter((card) => card.project === project.name)]))
  const blockers = [...(state.blockers || []), ...state.handoffs.flatMap((handoff) => (handoff.blockers || []).map((blocker) => ({ ...blocker, sourceId: handoff.id, cardId: blocker.cardId || handoff.cardId })))]
    .map((blocker) => normalizeBlocker(blocker, blocker.sourceId))
  const risks = state.handoffs.filter((handoff) => handoff.risks?.trim()).map((handoff) => ({ sourceId: handoff.id, cause: handoff.risks }))
  return { ...state, blockers, risks, approvals: { pending: state.approvals.filter((i) => i.status === 'pending').length, items: state.approvals }, recentEvents: state.events.slice(-50).reverse(), activeCards: state.cards.filter((c) => !['blocked', 'completed', 'failed'].includes(c.status)).length, pendingGates: state.gates.filter((gate) => gate.status === 'pending').length, pendingCards: state.cards.filter((card) => !['completed', 'failed'].includes(card.status)).length, blockerCount: blockers.filter((blocker) => blocker.status === 'open').length, projectCards }
}
export function validNextStatuses(status: CardStatus) { return transitions[status] }
export async function transitionCard(cardId: string, status: CardStatus, actor: LocalActor, file?: string, reason = 'operational transition') {
  validateLocal(actor); if (!status || !Object.hasOwn(transitions, status)) throw new FluxError('INVALID_ACTION', 'Unknown card status')
  const state = await load(file); const card = state.cards.find((i) => i.id === cardId); if (!card) throw new FluxError('CARD_NOT_FOUND', `Card ${cardId} not found`, 404)
  if (!transitions[card.status].includes(status)) throw new FluxError('INVALID_TRANSITION', `${card.status} cannot transition to ${status}`)
  if (status === 'completed' && !state.artifacts.some((a) => a.cardId === cardId && a.status === 'available')) throw new FluxError('MISSING_EVIDENCE', 'Completion requires an available artifact/evidence')
  const now = new Date().toISOString(); const correlationId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const fromStatus = card.status; card.status = status; card.updatedAt = now
  const event: Event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `transicionou ${cardId} para ${status} (LOCAL)`, cardId, correlationId, fromStatus, toStatus: status, reason }; state.events.push(event); await save(state, file); return { card, event }
}
export async function approveApproval(approvalId: string, decision: Exclude<ApprovalStatus, 'pending'>, actor: LocalActor, file?: string) {
  validateLocal(actor); if (actor.actor !== 'Sergio') throw new FluxError('SERGIO_REQUIRED', 'Approval decisions require actor Sergio', 403); if (!['approved', 'rejected'].includes(decision)) throw new FluxError('INVALID_ACTION', 'Decision must be approved or rejected')
  const state = await load(file); const approval = state.approvals.find((i) => i.id === approvalId); if (!approval) throw new FluxError('APPROVAL_NOT_FOUND', `Approval ${approvalId} not found`, 404); if (approval.status !== 'pending') throw new FluxError('APPROVAL_ALREADY_DECIDED', 'Approval is not pending')
  const now = new Date().toISOString(); approval.status = decision; approval.decidedAt = now; approval.decidedBy = actor.actor; const event: Event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `registrou decisão ${decision} para ${approvalId} (LOCAL/NO EXTERNAL EFFECT)`, cardId: approval.cardId, correlationId: `local-${Date.now()}` }; state.events.push(event); await save(state, file); return { approval, event }
}
export async function decideGate(gateId: string, decision: GateDecision, actor: LocalActor, file?: string) {
  if (!actor || actor.scope !== 'local') throw new FluxError('LOCAL_SCOPE_REQUIRED', 'Gate decisions require local scope', 400)
  if (actor.actor !== 'Sergio') throw new FluxError('SERGIO_REQUIRED', 'Gate decisions require actor Sergio', 403)
  if (!['approved', 'rejected', 'changes_requested'].includes(decision)) throw new FluxError('INVALID_GATE_DECISION', 'Decision must be approved, rejected or changes_requested')
  const state = await load(file); const gate = state.gates.find((item) => item.id === gateId && item.project === 'FBR Agency Flux')
  if (!gate) throw new FluxError('GATE_NOT_FOUND', `Gate ${gateId} not found`, 404)
  if (gate.status !== 'pending') throw new FluxError('GATE_ALREADY_DECIDED', 'Gate is not pending', 409)
  const now = new Date().toISOString(); gate.status = decision; gate.decidedAt = now; gate.decidedBy = actor.actor; gate.externalActionAuthorized = false
  const event: Event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `registrou decisão ${decision} para ${gateId} (LOCAL DECISION / NO EXTERNAL EFFECT)`, cardId: gate.cardId, correlationId: `local-${Date.now()}`, reason: 'Decisão conceitual local não autoriza execução externa' }
  state.events.push(event); await save(state, file); return { gate, event }
}

export async function createApproval(input: Omit<Approval, 'id' | 'status' | 'decidedAt' | 'decidedBy'>, actor: LocalActor, file?: string) { validateLocal(actor); for (const key of ['cardId','title','requestedBy','impact','scope','rollback'] as const) if (!input[key]?.trim()) throw new FluxError('INVALID_APPROVAL', `Approval field ${key} is required`); const state = await load(file); if (!state.cards.some((c) => c.id === input.cardId)) throw new FluxError('CARD_NOT_FOUND', `Card ${input.cardId} not found`, 404); const approval = { ...input, id: `approval-${Date.now()}`, status: 'pending' as const }; state.approvals.push(approval); state.events.push({ id: `event-${Date.now()}`, time: new Date().toISOString(), actor: actor.actor, action: `criou Gate ${approval.id} (LOCAL)`, cardId: approval.cardId, correlationId: `local-${Date.now()}` }); await save(state, file); return approval }

export async function createHandoff(input: Omit<Handoff, 'id' | 'createdAt'>, actor: LocalActor, file?: string) { validateLocal(actor); for (const key of ['cardId','project','from','to','summary','done','risks','nextStep','acceptanceCriteria','evidenceRef'] as const) if (!input[key]?.trim()) throw new FluxError('INVALID_HANDOFF', `Handoff field ${key} is required`); const state = await load(file); const handoff = { ...input, id: `handoff-${Date.now()}`, createdAt: new Date().toISOString() }; state.handoffs.push(handoff); state.events.push({ id: `event-${Date.now()}`, time: handoff.createdAt, actor: actor.actor, action: `registrou Handoff ${handoff.id} (LOCAL)`, cardId: handoff.cardId, correlationId: `local-${Date.now()}` }); await save(state, file); return handoff }
