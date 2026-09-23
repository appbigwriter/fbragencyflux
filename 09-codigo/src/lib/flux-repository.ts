import { readFile, stat } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { configuredRepository, type StateMutation } from './persistence'
import { isJobStale } from './jobs'
import { triageHandoff, buildDependencyGraph, type IrisTriageInput } from './iris-orchestrator'
import { createReceipt, type Receipt } from './observability'

export type ProjectStatus = 'active' | 'blocked' | 'planned'
export type CardStatus = 'planned' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'awaiting_owner' | 'awaiting_approval' | 'approved' | 'executing' | 'verifying' | 'completed' | 'failed'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested'
export type ApprovalDecision = Exclude<ApprovalStatus, 'pending'>
export type GateStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested'
export type GateDecision = Exclude<GateStatus, 'pending'>
export type Gate = {
  id: string; cardId: string; project: string; title: string; requiredDecision: string; status: GateStatus
  impact: string; cost: string; scope: string; reversibility: string; rollback: string; evidence: string[]
  owner: string; requestedAt: string; decidedAt?: string; decidedBy?: string; externalActionAuthorized: false; blockers: string[]
}
export type Project = { id: string; name: string; tenantId?: string; status: ProjectStatus; owner: string; description: string }
export type Card = { id: string; project: string; tenantId?: string; title: string; status: CardStatus; assignee: string; priority: 'high' | 'normal'; detail: string; acceptanceCriteria: string[]; updatedAt: string }
export type Approval = { id: string; cardId: string; tenantId?: string; projectId?: string; project?: string; persona?: string; blog?: string; type?: string; title: string; requestedBy: string; impact: string; scope: string; rollback: string; status: ApprovalStatus; packageVersion?: number; decisionReason?: string; decidedAt?: string; decidedBy?: string }
export type Event = { id: string; time: string; actor: string; action: string; cardId?: string; correlationId?: string; fromStatus?: string; toStatus?: string; reason?: string; blockerId?: string; jobId?: string; handoffId?: string; from?: string; to?: string; owner?: string; nextAction?: string; solution?: { cause: string; owner: string; nextAction: string; resolutionPlan: string; resolutionEvidence: string }; resolutionAction?: ResolutionAction; receipt?: import('./observability').Receipt }
export type ResolutionAction = { from: string; to: string; objective: string; deliverable: string; acceptanceCriteria: string; evidenceRequired: string; nextStep: string; fallback?: string }
export type BlockerStatus = 'open' | 'resolved' | 'legacy'
export type BlockerResolution = 'declared' | 'forwarded' | 'not_declared' | 'legacy'
export type Blocker = { id: string; sourceId?: string; cardId?: string; cause: string; status: BlockerStatus; owner: string; author?: string; nextAction: string; resolutionPlan: string; resolutionEvidence: string; resolution: BlockerResolution; verification: 'verified' | 'unverified'; resolutionAction: ResolutionAction }
export type BlockerInput = Partial<Blocker> & { id: string; cause: string }
export type Risk = { sourceId: string; cause: string }
export type HandoffStatus = 'received' | 'in_progress' | 'awaiting_owner' | 'blocked' | 'released' | 'completed' | 'legacy'
export type Handoff = { id: string; cardId: string; project: string; projectId?: string; tenantId?: string; personaId?: string; personaVersionId?: string; blogId?: string; from: string; to: string; summary: string; done: string; decisions?: string[]; risks: string; nextStep: string; nextCheck?: string; lastActivity?: string; acceptanceCriteria: string; evidenceRef: string; createdAt: string; status?: HandoffStatus; lastUpdate?: string; lastBlocker?: string; lastRelease?: string; lastError?: string; readbackStatus?: 'pending' | 'verified' | 'failed' | 'blocked'; blockers?: BlockerInput[]; blockerId?: string; jobId?: string; correlationId?: string; forwardingKey?: string; resolutionAction?: ResolutionAction; interaction?: ForwardInteraction; solution?: Pick<Blocker, 'cause' | 'owner' | 'nextAction' | 'resolutionPlan' | 'resolutionEvidence'>; sourceType?: 'local' | 'filesystem'; historical?: boolean; legacy?: boolean; source?: string; activeBlocker?: boolean }
export type Artifact = { id: string; cardId: string; name: string; kind: string; status: string; path: string; sourcePath: string; size: number }
export type JobStatus = 'planned' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'awaiting_owner' | 'completed' | 'failed' | 'not_verified'
export type AgentRunEvent = 'dispatched' | 'accepted' | 'started' | 'progress' | 'waiting_input' | 'blocked' | 'artifact_created' | 'handoff_sent' | 'review' | 'completed' | 'failed' | 'cancelled'
export type AgentRun = { jobId: string; cardId: string; project: string; projectId?: string; tenantId?: string; personaId?: string; personaVersionId?: string; blogId?: string; agent: string; role: string; objective: string; status: JobStatus; startedAt?: string; updatedAt: string; completedAt?: string; artifactRefs: string[]; handoffRefs: string[]; evidenceRefs: string[]; blockers: string[]; nextStep: string; correlationId: string; source: string; sourceType?: 'local' | 'filesystem' | 'live'; historical?: boolean; activeBlocker?: boolean; lastSeen?: string; lastActivity?: string; nextCheck?: string; progress?: number; currentStep?: string; owner?: string; lastEvent?: AgentRunEvent; verification?: 'verified' | 'not_verified'; readbackStatus?: 'pending' | 'verified' | 'failed' | 'blocked'; lastError?: string; dependsOn?: string[]; blocks?: string[]; canStart?: boolean; parallelGroup?: string; track?: string; dependencyReason?: string }
export type SprintStatus = 'planned' | 'active' | 'blocked' | 'completed' | 'cancelled'
export type Sprint = { id: string; projectId: string; tenantId?: string; name: string; objective: string; status: SprintStatus; owner: string; startsAt?: string; endsAt?: string; dependencies: string[]; nextCheck: string; createdAt: string; updatedAt: string }
export type StoryStatus = 'planned' | 'ready' | 'in_progress' | 'blocked' | 'review' | 'completed'
export type Story = { id: string; sprintId: string; projectId: string; tenantId?: string; title: string; objective: string; owner: string; acceptanceCriteria: string[]; status: StoryStatus; cardIds: string[]; jobIds: string[]; evidenceRefs: string[]; blockerIds: string[]; nextCheck: string; createdAt: string; updatedAt: string }
export type RequiredActionRecord = { id: string; dedupeKey: string; what: string; why: string; who: string; from: string; to: string; objective: string; deliverable: string; acceptanceCriteria: string; dueCheck: string; fallback: string; status: 'ready' | 'hold' | 'completed'; reasonCode?: string; correlationId: string; createdAt: string; updatedAt: string }
export type CoordinatorRun = { correlationId: string; startedAt: string; completedAt: string; heartbeat: string; lastActivity: string; idleDetected: number; dispatched: number; holds: number; requiredActions: number; waitingReasons: string[]; result: 'completed' | 'dry_run' | 'failed'; lastCheck?: string; nextFollowUp?: string; unanswered?: number; backlogActionable?: number }
export type Job = AgentRun
export type FluxState = { version: number; projects: Project[]; cards: Card[]; approvals: Approval[]; gates: Gate[]; events: Event[]; handoffs: Handoff[]; artifacts: Artifact[]; blockers?: BlockerInput[]; jobs?: Job[]; agentRuns?: AgentRun[]; requiredActions?: RequiredActionRecord[]; sprints?: Sprint[]; stories?: Story[]; coordinator?: { lastCoordinatorRun?: CoordinatorRun; waitingReasons?: string[] } }
export type DashboardSnapshot = Omit<FluxState, 'approvals' | 'events' | 'blockers'> & { approvals: { pending: number; items: Approval[] }; recentEvents: Event[]; activeCards: number; blockers: Blocker[]; risks: Risk[]; pendingGates: number; pendingCards: number; blockerCount: number; projectCards: Record<string, Card[]>; currentCounts: { handoffs: number; jobs: number; cards: number }; historicalCounts: { handoffs: number; jobs: number; cards: number } }
export type LocalActor = { actor: string; scope: 'local'; tenantId?: string }
export type FluxReadScopePair = { tenantId: string; projectId: string | '*' }
export type FluxReadScope = { scopes: FluxReadScopePair[]; visibility: 'private' | 'public' }

export function validateBlocker(input: BlockerInput): void {
  if (input.status === 'open') {
    const missing = (['owner', 'nextAction', 'resolutionPlan'] as const).filter((key) => !input[key]?.trim())
    if (missing.length) throw new FluxError('INVALID_BLOCKER', `Open blocker requires ${missing.join(', ')}`)
    if (isPassiveResolutionPlan(input.resolutionPlan || '')) throw new FluxError('INVALID_BLOCKER', 'Open blocker resolutionPlan must contain an executable action, not retention-only language')
  }
}

const passiveResolution = /^(?:manter|continuar|aguardar|esperar|não executar|nao executar|sem executar|não agir|nao agir|retener|retido|pendente)(?:\s|;|,|\.|$)/i
export function isPassiveResolutionPlan(plan: string) {
  const text = plan.trim()
  if (!passiveResolution.test(text)) return false
  if (/(?:manter pendente|aguardar|esperar|não executar|nao executar|sem executar|não agir|nao agir)/i.test(text)) return true
  return !/\b(?:executar|validar|registrar|entregar|anexar|fornecer|emitir|ler de volta|readback|produzir|pesquisar|comparar)\b/i.test(text)
}
function actionFromLegacy(input: BlockerInput): Partial<ResolutionAction> {
  return input.resolutionAction || { from: 'Flux', to: input.owner || '', objective: input.cause, deliverable: input.nextAction || '', acceptanceCriteria: input.resolutionPlan || '', evidenceRequired: input.resolutionEvidence || '', nextStep: input.nextAction || '' }
}

export function normalizeBlocker(input: BlockerInput, sourceId?: string): Blocker {
  const explicitStatus = input.status === 'open' || input.status === 'resolved' || input.status === 'legacy'
  const status: BlockerStatus = explicitStatus ? input.status! : 'legacy'

  const plan = input.resolutionPlan?.trim() || ''
  const owner = input.owner?.trim() || ''; const nextAction = input.nextAction?.trim() || ''
  const resolutionAction = actionFromLegacy({ ...input, owner, nextAction, resolutionPlan: plan }) as ResolutionAction
  return { id: input.id, sourceId: input.sourceId || sourceId, cardId: input.cardId, cause: input.cause, status, owner, author: input.author?.trim() || undefined, nextAction, resolutionPlan: plan, resolutionEvidence: input.resolutionEvidence?.trim() || '', resolution: input.resolution || (owner && nextAction && plan && !isPassiveResolutionPlan(plan) ? 'declared' : 'not_declared'), verification: input.verification || (status === 'legacy' ? 'unverified' : 'verified'), resolutionAction }
}

export class FluxError extends Error { constructor(public code: string, message: string, public status = 400) { super(message) } }
const transitions: Record<CardStatus, CardStatus[]> = { planned: ['ready'], ready: ['in_progress'], in_progress: ['review', 'blocked', 'awaiting_owner'], review: ['awaiting_approval', 'in_progress', 'blocked', 'awaiting_owner'], blocked: ['ready', 'in_progress', 'awaiting_owner'], awaiting_owner: ['in_progress', 'review'], awaiting_approval: ['approved', 'blocked'], approved: ['executing'], executing: ['verifying', 'failed'], verifying: ['completed', 'failed'], completed: [], failed: ['in_progress'] }
const allowedActors = new Set(['Sergio', 'Íris', 'Gabe', 'Kora', 'Théo', 'Bia', 'Lia', 'Caio', 'Vito', 'Rick', 'Rafa', 'Hermes'])
const root = path.resolve(process.cwd(), '..')
const historyRoot = path.join(root, '08-historico', 'afterforty')
const afterFortyPackage = path.resolve(root, '..', 'FBR Blogs', 'After Forty')

function scalar(value: string) { return value.trim().replace(/^['\"]|['\"]$/g, '') }
function extractField(text: string, names: string[]) { const re = new RegExp('(?:^|\\n)\\s*(?:' + names.join('|') + ')\\s*:\\s*(.*)', 'i'); const match = re.exec(text); return match ? scalar(match[1]) : '' }
function extractList(text: string, names: string[]) { const match = new RegExp('(?:^|\\n)\\s*(?:' + names.join('|') + ')\\s*:\\s*([\\s\\S]*?)(?=\\n\\s*[A-Za-zÀ-ÿ][^\\n:]{0,80}:|$)', 'i').exec(text); return match ? [...match[1].matchAll(/(?:^|\n)\s*[-*]\s*["']?(.+?)["']?\s*$/gm)].map((m) => scalar(m[1])) : [] }
function hasStructuredOpenBlocker(text: string) {
  return /(?:blocker|bloqueador|pend[êe]ncia)[^\n]{0,120}:?[^\n]{0,300}\bstatus\s*:\s*open\b/i.test(text) || /\bstatus\s*:\s*open\b[\s\S]{0,500}\b(?:blocker|bloqueador|pend[êe]ncia)\s*:/i.test(text)
}
function blockerCause(text: string) {
  return extractField(text, ['blocker', 'bloqueador', 'causa do blocker', 'causa do bloqueio'])
}
function derivedStatus(raw: string, blockers: string[], source: string, activeBlocker: boolean): JobStatus {
  const s = raw.toLowerCase()
  if (!source) return 'not_verified'
  if (activeBlocker) return 'blocked'
  if (s.includes('complete') || s.includes('validated') || s.includes('pass') || blockers.some((item) => /conclu[ií]d|validad|pass/i.test(item))) return 'completed'
  return 'review'
}
export function classifyFilesystemRun(text: string, sourcePath: string): AgentRun {
  const rawStatus = extractField(text, ['status'])
  const activeBlocker = hasStructuredOpenBlocker(text)
  const cause = blockerCause(text)
  const historicalBlockers = extractList(text, ['pend[êe]ncias(?:\\/|_)blockers', 'blockers'])
  const blockers = activeBlocker && cause ? [cause, ...historicalBlockers] : historicalBlockers
  const updatedAt = new Date().toISOString()
  return { jobId: `filesystem-${path.basename(sourcePath)}`, cardId: extractField(text, ['card']), project: 'FBR Agency Flux', agent: extractField(text, ['de']).split('/')[0].trim(), role: extractField(text, ['de']), objective: extractField(text, ['objetivo(?: do job|_do_job)?']), status: derivedStatus(rawStatus, blockers, sourcePath, activeBlocker), updatedAt, lastSeen: updatedAt, artifactRefs: [], handoffRefs: [sourcePath], evidenceRefs: [sourcePath], blockers, nextStep: extractField(text, ['próximo passo', 'next step']) || 'Aguardando próxima instrução registrada', correlationId: `filesystem-${path.basename(sourcePath)}`, source: 'filesystem/Handoff readback', sourceType: 'filesystem', historical: true, activeBlocker, verification: 'verified', lastEvent: 'handoff_sent' }
}
function parseHandoff(text: string, sourcePath: string, index: number): AgentRun | null { const agent = extractField(text, ['de']); const objective = extractField(text, ['objetivo(?: do job|_do_job)?']); const cardId = extractField(text, ['card']); if (!agent || !objective || !cardId) return null; const blockers = extractList(text, ['pend[êe]ncias(?:\\/|_)blockers', 'blockers']); const criteria = extractList(text, ['critérios de aceite(?:\\/|_)evidência', 'criterios de aceite(?:\\/|_)evidencia']); const deliverable = extractField(text, ['entreg[aá]vel', 'entregavel']); const rawStatus = extractField(text, ['status']); const activeBlocker = hasStructuredOpenBlocker(text); const cause = blockerCause(text); const parsedBlockers = activeBlocker && cause ? [cause, ...blockers] : blockers; const updatedAt = new Date().toISOString(); const agentName = agent.split('/')[0].trim(); const jobId = `job-${cardId}-${agentName}-${path.basename(sourcePath, path.extname(sourcePath))}-${index}`.replace(/[^a-z0-9-]/gi, '-').toLowerCase(); return { jobId, cardId, project: cardId.startsWith('AF-') ? 'After Forty' : 'FBR Agency Flux', agent: agentName, role: agent, objective, status: derivedStatus(rawStatus, parsedBlockers, sourcePath, activeBlocker), updatedAt, lastSeen: updatedAt, artifactRefs: deliverable ? [deliverable] : [], handoffRefs: [sourcePath], evidenceRefs: [sourcePath, ...criteria], blockers: parsedBlockers, nextStep: extractField(text, ['próximo passo', 'next step']) || (criteria[0] || 'Aguardando próxima instrução registrada'), correlationId: `filesystem-${path.basename(sourcePath)}-${index}`, source: 'filesystem/Handoff readback', sourceType: 'filesystem', historical: true, activeBlocker, verification: 'verified', lastEvent: 'handoff_sent' } }
function declaredOrNot(value: string) { return value.trim() || 'not_declared' }
function deterministicHandoffId(text: string) { return `handoff-${createHash('sha256').update(text.trim().replace(/\\r/g, '').replace(/\\s+/g, ' ')).digest('hex').slice(0, 20)}` }
function handoffKey(handoff: Pick<Handoff, 'cardId' | 'from' | 'summary'>) { return [handoff.cardId, handoff.from, handoff.summary].map((value) => value.trim().toLowerCase()).join('|') }
function handoffBlocks(text: string) { const candidates = [...text.matchAll(/```(?:yaml|yml)?\s*\n([\s\S]*?)```/gi)].flatMap((m) => m[1].split(/(?=^\s*(?:[-*]\s*)?de\s*:)/im)); if (!candidates.length) candidates.push(...text.split(/(?=^\s*(?:[-*]\s*)?de\s*:)/im)); return candidates.filter((block) => /^\s*(?:[-*]\s*)?de\s*:/im.test(block) && /^\s*(?:[-*]\s*)?(?:para|to)\s*:/im.test(block) && /^\s*(?:[-*]\s*)?card\s*:/im.test(block)) }
function parseHistoricalHandoff(text: string, sourcePath: string): Handoff | null {
  const normalized = text.replace(/^\\s*[-*]\\s+(?=(?:de|para|to|card)\\s*:)/gim, '')
  const from = extractField(normalized, ['de']); const summary = extractField(normalized, ['objetivo(?: do job|_do_job)?', 'summary', 'resumo']); const cardId = extractField(normalized, ['card'])
  if (!from || !summary || !cardId) return null
  const blockers = extractList(normalized, ['pend[êe]ncias(?:\\/|_)blockers', 'blockers']); const cause = blockerCause(normalized); const active = hasStructuredOpenBlocker(normalized)
  const parsedBlockers = (active && cause ? [cause, ...blockers] : blockers).map((cause, i) => ({ id: `blocker-${createHash('sha256').update(`${deterministicHandoffId(normalized)}:${i}:${cause}`).digest('hex').slice(0, 16)}`, cause, status: active && i === 0 ? 'open' as const : 'legacy' as const }))
  const createdAt = declaredOrNot(extractField(normalized, ['createdAt', 'created at', 'criado em', 'data'])); const decisions = extractList(normalized, ['decisões(?:\\/|_)suposições', 'decisions(?:\\/|_)assumptions', 'decisions'])
  const evidence = declaredOrNot(extractField(normalized, ['evidenceRef', 'evidence', 'evidência', 'evidencia']))
  return { id: deterministicHandoffId(normalized), cardId, project: cardId.startsWith('AF-') ? 'After Forty' : 'FBR Agency Flux', from: declaredOrNot(from), to: declaredOrNot(extractField(normalized, ['para', 'to'])), summary: declaredOrNot(summary), done: declaredOrNot(extractField(normalized, ['done', 'conclu[ií]do', 'entreg[aá]vel', 'entregavel'])), decisions, risks: declaredOrNot(extractField(normalized, ['riscos?', 'risks?'])), nextStep: declaredOrNot(extractField(normalized, ['próximo passo', 'next step'])), acceptanceCriteria: declaredOrNot(extractList(normalized, ['critérios de aceite(?:\\/|_)evidência', 'criterios de aceite(?:\\/|_)evidencia']).join(' · ')), evidenceRef: evidence === 'not_declared' ? sourcePath : evidence, createdAt, status: 'legacy', lastUpdate: createdAt, lastBlocker: parsedBlockers[0]?.cause, blockers: parsedBlockers, sourceType: 'filesystem', source: sourcePath, historical: true, legacy: true, activeBlocker: active }
}
export function normalizeHandoff(input: Handoff, events: Event[] = []): Handoff {
  const blockers = input.blockers || []; const active = blockers.map((b) => normalizeBlocker(b, input.id)).find((b) => b.status === 'open')
  const release = [...events].reverse().find((e) => e.correlationId && e.action === 'released handoff' && e.correlationId === input.correlationId)
  const status = input.status === 'released' ? 'awaiting_owner' : input.status || (input.historical ? 'legacy' : active ? 'blocked' : 'received')
  return { ...input, status, lastUpdate: input.lastUpdate || input.createdAt, lastBlocker: input.lastBlocker || active?.cause, lastRelease: input.lastRelease || release?.time, activeBlocker: Boolean(active) }
}
export async function syncHandoffs(state: FluxState, roots: string[] = [historyRoot, afterFortyPackage]): Promise<Handoff[]> {
  const found = new Map<string, Handoff>()
  for (const base of roots) {
    let files: string[] = []
    try { const walk = async (dir: string): Promise<void> => { for (const entry of await readdir(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) await walk(full); else if (/\.(md|yaml|yml)$/i.test(entry.name)) files.push(full) } }; await walk(base) } catch { continue }
    for (const sourcePath of files.sort()) { let text = ''; try { text = await readFile(sourcePath, 'utf8') } catch { continue }; for (const block of handoffBlocks(text)) { const handoff = parseHistoricalHandoff(block, sourcePath); if (handoff && ![...found.values()].some((item) => handoffKey(item) === handoffKey(handoff))) found.set(handoff.id, handoff) } }
  }
  const current = (state.handoffs || []).map((h) => normalizeHandoff(h, state.events)); const keys = new Set(current.map(handoffKey)); const alreadyImported = current.some((handoff) => handoff.historical || handoff.sourceType === 'filesystem'); if (!alreadyImported) for (const handoff of found.values()) if (!keys.has(handoffKey(handoff))) { current.push(handoff); keys.add(handoffKey(handoff)) } state.handoffs = current.map((h) => normalizeHandoff(h, state.events)); return state.handoffs
}
export async function syncAgentRuns(state: FluxState, roots: string[] = [historyRoot, afterFortyPackage]): Promise<AgentRun[]> { const found = new Map<string, AgentRun>(); for (const base of roots) { let files: string[] = []; try { const walk = async (dir: string): Promise<void> => { for (const entry of await readdir(dir, { withFileTypes: true })) { const full = path.join(dir, entry.name); if (entry.isDirectory()) await walk(full); else if (/\.(md|yaml|yml)$/i.test(entry.name)) files.push(full) } }; await walk(base) } catch { continue }; for (const sourcePath of files.sort()) { let text = ''; try { text = await readFile(sourcePath, 'utf8') } catch { continue }; const chunks = text.split(/(?=\n\s*(?:[-*]\s*)?de\s*:)/i); chunks.forEach((chunk, index) => { const parsed = parseHandoff(chunk, sourcePath, index); if (parsed && !found.has(parsed.jobId)) found.set(parsed.jobId, parsed) }) } } const unique = new Map([...(state.jobs || []), ...found.values()].map((run) => [run.jobId, run])); state.jobs = [...unique.values()]; state.agentRuns = state.jobs; return state.jobs }
const seededGates: Gate[] = [
  { id: 'FLUX-GATE-01', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Concepção e escopo do Flux', requiredDecision: 'Confirmar concepção, escopo, critérios de aceite e ownership do ciclo atual', status: 'pending', impact: 'Define a base transversal; não executa jobs nem integrações', cost: 'Nenhum custo local; custo externo não autorizado', scope: 'FBR Agency Flux · concepção, escopo, critérios e ownership · decisão local', reversibility: 'Reversível antes de iniciar execução', rollback: 'Retornar o escopo ao último registro aprovado e reabrir revisão', evidence: ['resultado-esperado-do-flux.md', 'ACCEPTANCE-MATRIX.md'], owner: 'Íris', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Concepção exige revisão e decisão explícita de Sergio'] },
  { id: 'FLUX-GATE-02', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Sincronização de agentes, jobs, skills e workflows', requiredDecision: 'Confirmar mapa de agentes, jobs, skills e workflows e sua sincronização no estado do Flux', status: 'pending', impact: 'Coordena execução transversal; não dispara agent ou job externo', cost: 'Nenhum custo local; custo de execução não autorizado', scope: 'Agentes · jobs · skills · workflows · versões e ownership · estado local', reversibility: 'Reversível alterando o mapa/versionamento local', rollback: 'Restaurar o mapa anterior e registrar divergências', evidence: ['fbr-agency-flux.md: Controle em tempo real da concepção'], owner: 'Kora', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Eventos e Handoffs de agentes/jobs ainda precisam de sincronização contínua'] },
  { id: 'FLUX-GATE-03', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Dependências, Handoffs e evidências', requiredDecision: 'Confirmar dependências, próximo responsável, Handoffs e evidências suficientes para avançar', status: 'pending', impact: 'Impede avanço sem rastreabilidade; não altera projeto externo', cost: 'Nenhum custo local', scope: 'Cards · dependências · Handoffs · artefatos · evidências · blockers', reversibility: 'Reversível reabrindo revisão ou devolvendo Handoff', rollback: 'Bloquear o card, registrar risco e devolver ao owner anterior', evidence: ['overnight-delivery-readiness.md', 'artifacts e Handoffs persistidos localmente'], owner: 'Gabe', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Toda conclusão exige artefato/evidência verificável'] },
  { id: 'FLUX-GATE-04', cardId: 'FLUX-001', project: 'FBR Agency Flux', title: 'Status em tempo real e decisões de Sergio', requiredDecision: 'Confirmar que status, decisões, eventos e readbacks estão visíveis e separados de execução externa', status: 'pending', impact: 'Governa decisões transversais; aprovação local não é execução', cost: 'Nenhum custo local; gasto/publicação/deploy continuam bloqueados', scope: 'Dashboard · API · repositório local · eventos · readback · decisões de Sergio', reversibility: 'Reversível corrigindo estado local e reabrindo decisão', rollback: 'Preservar histórico, marcar changes_requested e retornar ao owner', evidence: ['README.md', 'tests/gates.test.ts', 'LOCAL DECISION / NO EXTERNAL EFFECT'], owner: 'Sergio', requestedAt: '2026-09-12T10:00:00-03:00', externalActionAuthorized: false, blockers: ['Auth remoto e integrações permanecem fora deste gate local'] }
]

export function dataFilePath(file = process.env.FLUX_DATA_FILE): string { return path.resolve(/* turbopackIgnore: true */ file || path.join(process.cwd(), 'data', 'flux-state.json')) }
function validateLocal(actor: LocalActor) { if (!actor || actor.scope !== 'local' || !allowedActors.has(actor.actor)) throw new FluxError('UNAUTHORIZED_ACTOR', 'Actor is not authorized for local Flux operations', 403) }
function validateTenant(actor: LocalActor, tenantId?: string) { if (actor.tenantId && tenantId && actor.tenantId !== tenantId) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403) }
function validateEntityTenants(actor: LocalActor, tenantId: string | undefined, entities: Array<{ tenantId?: string }>) { validateTenant(actor, tenantId); for (const entity of entities) validateTenant(actor, entity.tenantId); if (tenantId && entities.some((entity) => entity.tenantId && entity.tenantId !== tenantId)) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403) }
async function syncArtifacts(state: FluxState): Promise<FluxState> {
  const draftDir = path.join(historyRoot, 'drafts'); let names: string[] = []
  try { names = (await readdir(draftDir)).filter((n) => n.endsWith('.md')).sort() } catch { return state }
  const cardId = state.cards.some((c) => c.id === 'AF-001') ? 'AF-001' : state.cards[0]?.id
  if (!cardId) return state
  const existing = new Map(state.artifacts.map((a) => [a.sourcePath, a]))
  for (const name of names) { const sourcePath = path.join(draftDir, name); const info = await stat(sourcePath); if (!existing.has(sourcePath)) state.artifacts.push({ id: `artifact-${name.replace(/[^a-z0-9]/gi, '-')}`, cardId, name, kind: 'real-filesystem-article', status: 'available', path: sourcePath, sourcePath, size: info.size }) }
  return state
}
async function syncDiscoveredProjects(state: FluxState): Promise<boolean> {
  let changed = false
  const standardProjects = [
    { id: 'agency-flux', tenantId: '00000000-0000-0000-0000-000000000001', name: 'FBR Agency Flux', description: 'Camada transversal de governança e orquestração da FBR' },
    { id: 'after-forty', tenantId: '00000000-0000-0000-0000-000000000002', name: 'After Forty', description: 'Blog de Longevidade & Vitalidade 40+ assinado por Heidi Braun' },
    { id: 'talk-to-your-crowd', tenantId: '00000000-0000-0000-0000-000000000030', name: 'Talk to Your Crowd', description: 'Publisher de marketing e conversão para varejo local nos EUA assinado por Marcus Cole' }
  ]

  for (const sp of standardProjects) {
    const existing = state.projects.find(p => p.id === sp.id || p.name === sp.name)
    if (!existing) {
      state.projects.push({
        id: sp.id,
        tenantId: sp.tenantId,
        name: sp.name,
        description: sp.description,
        status: 'active',
        owner: sp.id === 'talk-to-your-crowd' ? 'Marcus Cole' : 'Sergio'
      })
      changed = true
    } else if (!existing.tenantId) {
      existing.tenantId = sp.tenantId
      changed = true
    }
  }

  // Garante que os cards canônicos estejam registrados na esteira
  if (!state.cards.some(c => c.project === 'After Forty' || c.id === 'AF-001')) {
    state.cards.push({
      id: 'AF-001',
      title: '[Authority Engine] After Forty · Heidi Braun',
      project: 'After Forty',
      tenantId: '00000000-0000-0000-0000-000000000002',
      status: 'ready',
      assignee: 'Heidi Braun',
      priority: 'high',
      detail: 'Pautas editoriais e pesquisa de suplementos 40+ na Amazon US',
      acceptanceCriteria: ['12 artigos editoriais com disclaimers e links validados'],
      updatedAt: new Date().toISOString()
    })
    changed = true
  }

  if (!state.cards.some(c => c.project === 'Talk to Your Crowd' || c.id === 'CARD-TALK-001')) {
    state.cards.push({
      id: 'CARD-TALK-001',
      title: '[Authority Engine] Talk to Your Crowd · Marcus Cole',
      project: 'Talk to Your Crowd',
      tenantId: '00000000-0000-0000-0000-000000000030',
      status: 'ready',
      assignee: 'Marcus Cole',
      priority: 'high',
      detail: 'Nicho: Store Signs & Displays. Persona: Marcus Cole. Objetivo: Produção dos 8 artigos-pilar em inglês e mapeamento de ASINs na Amazon US.',
      acceptanceCriteria: ['8 Artigos-Pilar com disclaimers FTC', 'Links de afiliados Amazon.com validados'],
      updatedAt: new Date().toISOString()
    })
    state.events.push({
      id: `EVT-AUTO-${Date.now().toString().slice(-5)}`,
      time: new Date().toISOString(),
      actor: 'Íris',
      action: 'Projeto Talk to Your Crowd e card inicial registrados automaticamente na esteira do Authority Engine',
      cardId: 'CARD-TALK-001'
    })
    changed = true
  }

  // Garante o Gate G1 para aprovação formal da persona Marcus Cole
  if (!state.approvals.some(a => a.id === 'APP-MARCUS-001' || a.cardId === 'CARD-TALK-001')) {
    state.approvals.push({
      id: 'APP-MARCUS-001',
      cardId: 'CARD-TALK-001',
      tenantId: '00000000-0000-0000-0000-000000000030',
      projectId: 'talk-to-your-crowd',
      project: 'Talk to Your Crowd',
      persona: 'Marcus Cole',
      blog: 'Talk to Your Crowd',
      type: 'persona_approval',
      title: 'Gate G1: Aprovação Formal da Persona Marcus Cole e Identidade Visual (Talk to Your Crowd)',
      requestedBy: 'Íris',
      impact: 'Autoriza a produção dos 8 artigos-pilar em inglês com a voz e imagem de Marcus Cole',
      scope: 'Gate G1 / Authority Engine',
      rollback: 'Revisar o Character Profile em 02-prd/MarcusCole.md',
      status: 'pending'
    })
    changed = true
  }

  return changed
}

async function load(file?: string, importHistory = process.env.FLUX_IMPORT_HISTORY === '1'): Promise<FluxState> {
  const repository = configuredRepository(file)
  let state = await repository.load()
  if (!state) {
    if (!file && (process.env.FLUX_PERSISTENCE || process.env.NODE_ENV === 'production') === 'supabase') throw new FluxError('STATE_NOT_FOUND', 'External Flux state is not initialized; apply the local migration and seed state before starting', 503)
    const seedPath = path.join(process.cwd(), 'data', 'flux-state.json')
    state = JSON.parse(await readFile(seedPath, 'utf8')) as FluxState
  }
  state.projects = state.projects || []; state.cards = state.cards || []; state.artifacts = state.artifacts || []
  state.handoffs = state.handoffs || []; state.events = state.events || []; state.approvals = state.approvals || []; state.requiredActions = state.requiredActions || []; state.sprints = state.sprints || []; state.stories = state.stories || []; state.coordinator = state.coordinator || {}
  
  // Auto-sincronização implícita de novos projetos descobertos no runtime real (fora de testes)
  const shouldAutoSync = !file && process.env.NODE_ENV !== 'test' && !process.env.VITEST
  const autoSynced = shouldAutoSync ? await syncDiscoveredProjects(state) : false

  // Historical filesystem data is an archive, not an implicit state source.
  // Import only through the explicit command or FLUX_IMPORT_HISTORY=1.
  if (importHistory) { await syncAgentRuns(state); await syncHandoffs(state) }
  state.artifacts = state.artifacts || []; state.handoffs = state.handoffs || []; state.events = state.events || []; state.approvals = state.approvals || []
  if (!state.gates) { state.gates = seededGates.map((gate) => ({ ...gate, evidence: [...gate.evidence], blockers: [...gate.blockers] })); await save(state, file) }
  if (state.artifacts.length || state.jobs || (autoSynced && shouldAutoSync)) await save(state, file)
  return state
}


async function save(state: FluxState, file?: string): Promise<void> { await configuredRepository(file).save(state) }
export async function saveState(state: FluxState, file?: string): Promise<void> { await save(state, file) }
export async function mutateState<T>(mutation: StateMutation<T>, file?: string): Promise<T> { return configuredRepository(file).update(mutation) }
export async function getState(file?: string) { return load(file) }
export async function importHistory(file?: string): Promise<FluxState> {
  const state = await load(file, false)
  await syncAgentRuns(state)
  await syncHandoffs(state)
  await save(state, file)
  return state
}
export async function getJobs(file?: string, filters: { agent?: string; status?: string; card?: string } = {}) { const state = await load(file); const graph = new Map(buildDependencyGraph(state).map((item) => [item.jobId, item])); const jobs = (state.jobs || []).map((job) => ({ ...job, ...graph.get(job.jobId) })); return jobs.filter((job) => (!filters.agent || job.agent === filters.agent) && (!filters.status || job.status === filters.status) && (!filters.card || job.cardId === filters.card)).map((job) => ({ ...job, stale: isJobStale(job) })) }
export async function getJob(id: string, file?: string) { const job = (await load(file)).jobs?.find((item) => item.jobId === id); if (!job) throw new FluxError('JOB_NOT_FOUND', `Job ${id} not found`, 404); return job }
const runFields = ['jobId','cardId','project','agent','role','objective','status','startedAt','updatedAt','completedAt','artifactRefs','handoffRefs','evidenceRefs','blockers','nextStep','correlationId','source','lastSeen','progress','currentStep','owner','lastEvent','verification'] as const
export async function upsertJob(input: Partial<AgentRun>, actor: LocalActor, file?: string) {
  validateLocal(actor); if (!input.jobId || !input.cardId || !input.agent || !input.objective) throw new FluxError('INVALID_JOB', 'jobId, cardId, agent and objective are required')
  return mutateState((state) => { const now = new Date().toISOString(); const current = (state.jobs || []).find((item) => item.jobId === input.jobId); const job: AgentRun = { ...(current || { role: '', project: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: '', correlationId: `local-${Date.now()}`, source: 'local/dispatcher adapter', sourceType: 'local', historical: false, activeBlocker: false, updatedAt: now }), ...input, updatedAt: now, lastSeen: input.lastSeen || now, sourceType: input.sourceType || current?.sourceType || 'local', historical: input.historical ?? current?.historical ?? false, activeBlocker: input.activeBlocker ?? current?.activeBlocker ?? input.status === 'blocked', verification: input.verification || current?.verification || 'not_verified' } as AgentRun; if (job.status === 'completed' && !job.evidenceRefs.length && !job.artifactRefs.length) job.status = 'not_verified'; state.jobs = current ? state.jobs!.map((item) => item.jobId === job.jobId ? job : item) : [...(state.jobs || []), job]; state.agentRuns = state.jobs; const receipt = createReceipt({ correlationId: job.correlationId, operation: 'job.upsert', status: 'completed', actor: actor.actor, jobId: job.jobId }); state.events.push({ id: `event-job-${job.jobId}-${now}`, time: now, actor: actor.actor, action: 'upserted job', jobId: job.jobId, cardId: job.cardId, correlationId: job.correlationId, receipt }); return { job, receipt } }
  , file)
}
export async function updateJobEvent(id: string, event: AgentRunEvent, patch: Partial<AgentRun>, actor: LocalActor, file?: string) { const current = await getJob(id, file); const statusMap: Partial<Record<AgentRunEvent, JobStatus>> = { started: 'in_progress', progress: 'in_progress', waiting_input: 'blocked', blocked: 'blocked', review: 'review', completed: 'completed', failed: 'failed', cancelled: 'failed' }; return upsertJob({ ...current, ...patch, lastEvent: event, status: patch.status || statusMap[event] || current.status, completedAt: event === 'completed' ? new Date().toISOString() : patch.completedAt }, actor, file) }

export async function getGates(file?: string): Promise<Gate[]> { return (await load(file)).gates.filter((gate) => gate.project === 'FBR Agency Flux') }
export async function getSnapshot(file?: string): Promise<DashboardSnapshot> {
  return buildSnapshot(await load(file))
}

/** Build a read-only aggregate from the explicitly allowed tenant/project pairs. */
export async function getAggregatedSnapshot(scopes: FluxReadScopePair[], file?: string, allowTenantless = false): Promise<DashboardSnapshot> {
  if (!scopes.length) throw new FluxError('READ_SCOPE_REQUIRED', 'At least one tenant/project scope is required', 400)
  const state = await load(file)
  const allowsProject = (tenantId: string | undefined, projectId: string) => Boolean(tenantId && scopes.some((scope) => (scope.tenantId === tenantId || scope.tenantId === projectId) && (scope.projectId === '*' || scope.projectId === projectId)))
  const hasTenantWildcard = scopes.some((scope) => scope.projectId === '*')
  const projects = state.projects.filter((project) => project.tenantId ? allowsProject(project.tenantId, project.id) : allowTenantless && !hasTenantWildcard && scopes.some((scope) => scope.projectId === project.id))

  const projectNames = new Set(projects.flatMap((project) => [project.id, project.name]))
  const allowedTenant = (tenantId?: string, projectId?: string) => {
    if (tenantId) return scopes.some((scope) => scope.tenantId === tenantId || (projectId && scope.tenantId === projectId))
    return allowTenantless && !hasTenantWildcard
  }
  const cards = state.cards.filter((card) => projectNames.has(card.project) && projects.some((project) => (project.id === card.project || project.name === card.project) && allowedTenant(card.tenantId || project.tenantId, project.id)))
  const cardIds = new Set(cards.map((card) => card.id))
  const handoffs = state.handoffs.filter((item) => cardIds.has(item.cardId))
  const jobs = (state.jobs || []).filter((item) => cardIds.has(item.cardId) && allowedTenant(item.tenantId, item.projectId))
  const filtered: FluxState = {
    ...state, projects, cards,
    approvals: state.approvals.filter((item) => cardIds.has(item.cardId) && allowedTenant(item.tenantId, item.projectId)),
    gates: state.gates.filter((item) => cardIds.has(item.cardId)),
    handoffs, artifacts: state.artifacts.filter((item) => cardIds.has(item.cardId)),
    blockers: (state.blockers || []).filter((item) => Boolean(item.cardId && cardIds.has(item.cardId))),
    jobs,
    events: state.events.filter((item) => Boolean(item.cardId && cardIds.has(item.cardId))),
  }
  return buildSnapshot(filtered)
}

export async function getScopedSnapshot(scope: FluxReadScope, file?: string): Promise<DashboardSnapshot> {
  return getAggregatedSnapshot(scope.scopes, file, scope.visibility === 'public' && !scope.scopes.some((item) => item.projectId === '*'))
}

async function buildSnapshot(state: FluxState): Promise<DashboardSnapshot> {
  const graph = new Map(buildDependencyGraph(state).map((item) => [item.jobId, item]))
  const jobs = (state.jobs || []).map((job) => ({ ...job, ...graph.get(job.jobId) }))
  const approvals = state.approvals.map((approval) => { const { card, project } = approvalProject(state, approval); return { ...approval, packageVersion: approval.packageVersion || 1, projectId: approval.projectId || project?.id, project: approval.project || project?.name || card?.project } })
  const snapshotState: FluxState = { ...state, approvals, jobs, agentRuns: jobs }
  const projectCards = Object.fromEntries(snapshotState.projects.map((project) => [project.id, snapshotState.cards.filter((card) => (card.project === project.id || card.project === project.name) && (!project.tenantId || card.tenantId === project.tenantId))]))
  const handoffs = snapshotState.handoffs.map((handoff) => ({ ...handoff, activeBlocker: (handoff.blockers || []).some((item) => normalizeBlocker(item, handoff.id).status === 'open') }))
  const blockers = [...(snapshotState.blockers || []), ...handoffs.flatMap((handoff) => (handoff.blockers || []).map((blocker) => ({ ...blocker, author: blocker.author || handoff.from, sourceId: handoff.id, cardId: blocker.cardId || handoff.cardId })))]
    .map((blocker) => normalizeBlocker(blocker, blocker.sourceId)).filter((blocker) => blocker.status === 'open')
  const risks = handoffs.filter((handoff) => handoff.risks?.trim()).map((handoff) => ({ sourceId: handoff.id, cause: handoff.risks }))
  const currentHandoffs = handoffs.filter((item) => !item.historical && !item.legacy)
  const currentJobs = jobs.filter((item) => !item.historical)
  const currentCards = snapshotState.cards.filter((item) => !item.status || item.status !== 'completed')
  return { ...snapshotState, handoffs, blockers, risks, approvals: { pending: snapshotState.approvals.filter((i) => i.status === 'pending').length, items: snapshotState.approvals }, recentEvents: snapshotState.events.slice(-50).reverse(), activeCards: currentCards.filter((c) => !['blocked', 'completed', 'failed'].includes(c.status)).length, pendingGates: snapshotState.gates.filter((gate) => gate.status === 'pending').length, pendingCards: currentCards.filter((card) => !['completed', 'failed'].includes(card.status)).length, blockerCount: blockers.filter((blocker) => blocker.status === 'open').length, projectCards, currentCounts: { handoffs: currentHandoffs.length, jobs: currentJobs.length, cards: currentCards.length }, historicalCounts: { handoffs: handoffs.length - currentHandoffs.length, jobs: jobs.length - currentJobs.length, cards: snapshotState.cards.filter((card) => card.status === 'completed').length } }
}
export function validNextStatuses(status: CardStatus) { return transitions[status] }
export async function transitionCard(cardId: string, status: CardStatus, actor: LocalActor, file?: string, reason = 'operational transition') {
  validateLocal(actor); if (!status || !Object.hasOwn(transitions, status)) throw new FluxError('INVALID_ACTION', 'Unknown card status')
  return mutateState((state) => { const card = state.cards.find((i) => i.id === cardId); if (!card) throw new FluxError('CARD_NOT_FOUND', `Card ${cardId} not found`, 404); if (!transitions[card.status].includes(status)) throw new FluxError('INVALID_TRANSITION', `${card.status} cannot transition to ${status}`); if (status === 'completed' && !state.artifacts.some((a) => a.cardId === cardId && a.status === 'available')) throw new FluxError('MISSING_EVIDENCE', 'Completion requires an available artifact/evidence'); const now = new Date().toISOString(); const correlationId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; const fromStatus = card.status; card.status = status; card.updatedAt = now; const receipt = createReceipt({ correlationId, operation: 'card.transition', status: 'completed', actor: actor.actor, metadata: { cardId, fromStatus, status } }); const event: Event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `transicionou ${cardId} para ${status} (LOCAL)`, cardId, correlationId, fromStatus, toStatus: status, reason, receipt }; state.events.push(event); return { card, event, receipt } }, file)
}
export type ApprovalDecisionOptions = { reason?: string; packageVersion?: number; version?: number; tenantId?: string }
export type ApprovalIndex = { project?: string; projectId?: string; persona?: string; blog?: string; type?: string; status?: ApprovalStatus }

function approvalProject(state: FluxState, approval: Approval) {
  const card = state.cards.find((item) => item.id === approval.cardId)
  const project = state.projects.find((item) => item.id === approval.projectId || item.name === approval.project || item.id === card?.project || item.name === card?.project)
  return { card, project }
}

export async function getApprovals(index: ApprovalIndex = {}, file?: string): Promise<Approval[]> {
  const state = await load(file)
  return state.approvals.filter((approval) => {
    const { card, project } = approvalProject(state, approval)
    const value = { ...approval, projectId: approval.projectId || project?.id, project: approval.project || project?.name || card?.project }
    return (!index.project || value.project === index.project || value.projectId === index.project) && (!index.projectId || value.projectId === index.projectId) && (!index.persona || approval.persona === index.persona) && (!index.blog || approval.blog === index.blog) && (!index.type || approval.type === index.type) && (!index.status || approval.status === index.status)
  }).map((approval) => {
    const { card, project } = approvalProject(state, approval)
    return { ...approval, packageVersion: approval.packageVersion || 1, projectId: approval.projectId || project?.id, project: approval.project || project?.name || card?.project }
  })
}

export async function approveApproval(approvalId: string, decision: ApprovalDecision, actor: LocalActor, file?: string, options: ApprovalDecisionOptions = {}) {
  validateLocal(actor); if (actor.actor !== 'Sergio') throw new FluxError('SERGIO_REQUIRED', 'Approval decisions require actor Sergio', 403); if (!['approved', 'rejected', 'revision_requested'].includes(decision)) throw new FluxError('INVALID_ACTION', 'Decision must be approved, rejected or revision_requested')
  const reason = options.reason?.trim() || ''
  if ((decision === 'rejected' || decision === 'revision_requested') && !reason) throw new FluxError('REASON_REQUIRED', 'A reason is required for rejection or revision request', 422)
  return mutateState((state) => { const approval = state.approvals.find((i) => i.id === approvalId); if (!approval) throw new FluxError('APPROVAL_NOT_FOUND', `Approval ${approvalId} not found`, 404); const currentVersion = approval.packageVersion || 1; const requestedVersion = options.packageVersion ?? options.version; if (requestedVersion !== undefined && requestedVersion !== currentVersion) throw new FluxError('STALE_APPROVAL_PACKAGE', `Approval package version ${requestedVersion} is stale; current version is ${currentVersion}`, 409); if (approval.status !== 'pending') throw new FluxError('APPROVAL_ALREADY_DECIDED', 'Approval is not pending', 409); const { card } = approvalProject(state, approval); validateEntityTenants(actor, approval.tenantId, [card || {}]); if (options.tenantId && card?.tenantId && options.tenantId !== card.tenantId) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403); const now = new Date().toISOString(); approval.packageVersion = currentVersion; approval.status = decision; approval.decisionReason = reason || undefined; approval.decidedAt = now; approval.decidedBy = actor.actor; const correlationId = `local-${Date.now()}`; const receipt = createReceipt({ correlationId, operation: 'approval.decide', status: 'completed', actor: actor.actor, metadata: { approvalId, decision, packageVersion: currentVersion } }); const event: Event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `registrou decisão ${decision} para ${approvalId} (LOCAL/NO EXTERNAL EFFECT)`, cardId: approval.cardId, correlationId, reason: reason || undefined, receipt }; state.events.push(event); return { approval, event, receipt, readback: { approvalId, packageVersion: currentVersion, persisted: true } } }, file)
}

export async function decideApproval(input: { approvalId: string; decision: ApprovalDecision; reason?: string; packageVersion?: number; version?: number; tenantId?: string }, actor: LocalActor, file?: string) {
  return approveApproval(input.approvalId, input.decision, actor, file, input)
}
export async function decideGate(gateId: string, decision: GateDecision, actor: LocalActor, file?: string) {
  if (!actor || actor.scope !== 'local') throw new FluxError('LOCAL_SCOPE_REQUIRED', 'Gate decisions require local scope', 400); if (actor.actor !== 'Sergio') throw new FluxError('SERGIO_REQUIRED', 'Gate decisions require actor Sergio', 403); if (!['approved', 'rejected', 'changes_requested'].includes(decision)) throw new FluxError('INVALID_GATE_DECISION', 'Invalid gate decision')
  return mutateState((state) => { const gate = state.gates.find((item) => item.id === gateId && item.project === 'FBR Agency Flux'); if (!gate) throw new FluxError('GATE_NOT_FOUND', `Gate ${gateId} not found`, 404); if (gate.status !== 'pending') throw new FluxError('GATE_ALREADY_DECIDED', 'Gate is not pending', 409); const now = new Date().toISOString(); gate.status = decision; gate.decidedAt = now; gate.decidedBy = actor.actor; gate.externalActionAuthorized = false; const correlationId = `local-${Date.now()}`; const receipt = createReceipt({ correlationId, operation: 'gate.decide', status: 'completed', actor: actor.actor, metadata: { gateId, decision } }); const event: Event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `registrou decisão ${decision} para ${gateId} (LOCAL DECISION / NO EXTERNAL EFFECT)`, cardId: gate.cardId, correlationId, reason: 'Decisão conceitual local não autoriza execução externa', receipt }; state.events.push(event); return { gate, event, receipt } }, file)
}
export async function createApproval(input: Omit<Approval, 'id' | 'status' | 'decidedAt' | 'decidedBy'>, actor: LocalActor, file?: string) { validateLocal(actor); for (const key of ['cardId','title','requestedBy','impact','scope','rollback'] as const) if (!input[key]?.trim()) throw new FluxError('INVALID_APPROVAL', `Approval field ${key} is required`); return mutateState((state) => { if (!state.cards.some((c) => c.id === input.cardId)) throw new FluxError('CARD_NOT_FOUND', `Card ${input.cardId} not found`, 404); const approval = { ...input, packageVersion: input.packageVersion || 1, id: `approval-${Date.now()}`, status: 'pending' as const }; state.approvals.push(approval); const correlationId = `local-${Date.now()}`; const receipt = createReceipt({ correlationId, operation: 'approval.create', status: 'completed', actor: actor.actor, metadata: { approvalId: approval.id } }); state.events.push({ id: `event-${Date.now()}`, time: new Date().toISOString(), actor: actor.actor, action: `criou Gate ${approval.id} (LOCAL)`, cardId: approval.cardId, correlationId, receipt }); return { approval, receipt } }, file) }

export async function createHandoff(input: Omit<Handoff, 'id' | 'createdAt'>, actor: LocalActor, file?: string) {
  validateLocal(actor); for (const key of ['cardId','project','from','to','summary','done','risks','nextStep','acceptanceCriteria','evidenceRef'] as const) if (!input[key]?.trim()) throw new FluxError('INVALID_HANDOFF', `Handoff field ${key} is required`)
  return mutateState((state) => { const now = new Date().toISOString(); const handoff = normalizeHandoff({ ...input, id: `handoff-${createHash('sha256').update(`${input.cardId}:${input.from}:${input.to}:${input.summary}:${now}`).digest('hex').slice(0, 20)}`, createdAt: now, status: input.status || 'received', sourceType: 'local', source: 'local/flux' }, state.events); state.handoffs.push(handoff); const correlationId = `local-${Date.now()}`; const receipt = createReceipt({ correlationId, operation: 'handoff.create', status: 'completed', actor: actor.actor, metadata: { handoffId: handoff.id } }); state.events.push({ id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `registrou Handoff ${handoff.id} (LOCAL)`, cardId: handoff.cardId, correlationId, receipt }); return { handoff, receipt } }, file)
}
export type HandoffActionInput = { action: 'resume' | 'release'; correlationId: string; cause: string; solution: string; nextAction: string; owner: string; tenantId?: string }
export async function resumeLegacyHandoff(id: string, input: Pick<HandoffActionInput, 'correlationId'> & Partial<Pick<HandoffActionInput, 'nextAction' | 'owner' | 'tenantId'>>, actor: LocalActor, file?: string) {
  validateLocal(actor); if (!input.correlationId?.trim()) throw new FluxError('CORRELATION_REQUIRED', 'correlationId is required')
  return mutateState((state) => { const prior = state.events.find((e) => e.action === 'resumed legacy handoff' && e.correlationId === input.correlationId)
  if (prior?.handoffId) return { handoff: state.handoffs.find((h) => h.id === prior.handoffId) || null, event: prior, receipt: prior.receipt, idempotent: true }
  const legacy = state.handoffs.find((h) => h.id === id); if (!legacy) throw new FluxError('HANDOFF_NOT_FOUND', `Handoff ${id} not found`, 404)
  validateTenant(actor, input.tenantId); validateTenant(actor, state.cards.find((card) => card.id === legacy.cardId)?.tenantId); if (input.tenantId && state.cards.find((card) => card.id === legacy.cardId)?.tenantId && input.tenantId !== state.cards.find((card) => card.id === legacy.cardId)?.tenantId) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403)
  if (!legacy.historical && !legacy.legacy && legacy.status !== 'legacy') throw new FluxError('NOT_LEGACY_HANDOFF', 'Only legacy Handoffs can be resumed with this action', 409)
  const nextAction = input.nextAction?.trim() || (legacy.nextStep !== 'not_declared' ? legacy.nextStep.trim() : '')
  const owner = input.owner?.trim() || (legacy.to !== 'not_declared' ? legacy.to.trim() : '')
  if (!nextAction || !owner) throw new FluxError('RESUME_DATA_REQUIRED', 'nextStep and owner must already be declared', 422)
  const now = new Date().toISOString(); const resumeId = `handoff-resume-${createHash('sha256').update(`${id}:${input.correlationId}`).digest('hex').slice(0, 20)}`
  const solution = { cause: 'Retomada de Handoff legacy', owner, nextAction, resolutionPlan: nextAction, resolutionEvidence: legacy.evidenceRef }
  const handoff: Handoff = { id: resumeId, cardId: legacy.cardId, project: legacy.project, from: actor.actor, to: owner, summary: `Retomada de ${legacy.id}`, done: 'not_declared', decisions: [], risks: legacy.risks, nextStep: nextAction, acceptanceCriteria: legacy.acceptanceCriteria, evidenceRef: legacy.evidenceRef, createdAt: now, status: 'in_progress', lastUpdate: now, sourceType: 'local', source: `resume:${legacy.id}`, historical: false, legacy: false, correlationId: input.correlationId, solution }
  const receipt = createReceipt({ correlationId: input.correlationId, operation: 'handoff.resume-legacy', status: 'completed', actor: actor.actor, metadata: { handoffId: resumeId } }); const event: Event = { id: `event-resume-${input.correlationId}`, time: now, actor: actor.actor, action: 'resumed legacy handoff', cardId: legacy.cardId, handoffId: resumeId, from: actor.actor, to: owner, owner, nextAction, correlationId: input.correlationId, reason: nextAction, solution, receipt }
  state.handoffs.push(handoff); state.events.push(event); return { handoff, event, receipt, idempotent: false } }, file)
}
export async function resumeHandoff(id: string, input: HandoffActionInput, actor: LocalActor, file?: string) {
  validateLocal(actor); if (!input.correlationId?.trim()) throw new FluxError('CORRELATION_REQUIRED', 'correlationId is required'); if (!input.cause?.trim() || !input.solution?.trim() || !input.nextAction?.trim() || !input.owner?.trim()) throw new FluxError('SOLUTION_REQUIRED', 'cause, solution, nextAction and owner are required', 422)
  return mutateState((state) => { const prior = state.events.find((e) => e.action === 'released handoff' && e.correlationId === input.correlationId)
  if (prior?.handoffId) return { handoff: state.handoffs.find((h) => h.id === prior.handoffId) || null, event: prior, receipt: prior.receipt, idempotent: true }
  const handoff = state.handoffs.find((h) => h.id === id); if (!handoff) throw new FluxError('HANDOFF_NOT_FOUND', `Handoff ${id} not found`, 404); if (handoff.status === 'legacy' || handoff.historical) throw new FluxError('LEGACY_HANDOFF', 'Legacy Handoffs are read-only', 409)
  validateTenant(actor, input.tenantId); validateTenant(actor, state.cards.find((card) => card.id === handoff.cardId)?.tenantId); if (input.tenantId && state.cards.find((card) => card.id === handoff.cardId)?.tenantId && input.tenantId !== state.cards.find((card) => card.id === handoff.cardId)?.tenantId) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403)
  const now = new Date().toISOString(); const solution = { cause: input.cause, owner: input.owner, nextAction: input.nextAction, resolutionPlan: input.solution, resolutionEvidence: handoff.evidenceRef }
  handoff.status = input.action === 'release' ? 'awaiting_owner' : 'in_progress'; handoff.lastUpdate = now; handoff.lastRelease = input.action === 'release' ? now : handoff.lastRelease; handoff.solution = solution; handoff.nextStep = input.nextAction; handoff.correlationId = input.correlationId
  const receipt = createReceipt({ correlationId: input.correlationId, operation: 'handoff.resume', status: 'completed', actor: actor.actor, metadata: { handoffId: handoff.id } }); const event: Event = { id: `event-release-${input.correlationId}`, time: now, actor: actor.actor, action: 'released handoff', cardId: handoff.cardId, handoffId: handoff.id, jobId: handoff.jobId, from: actor.actor, to: input.owner, owner: input.owner, nextAction: input.nextAction, correlationId: input.correlationId, reason: input.cause, solution, receipt }
  state.events.push(event); return { handoff, event, receipt, idempotent: false } }, file)
}
export type ForwardInteraction = Partial<ResolutionAction> & { actor?: string; type?: string; status?: string; decision?: string; message?: string }
export type ForwardBlockerInput = { cardId?: string; jobId?: string; correlationId: string; tenantId?: string; resolutionAction?: Partial<ResolutionAction>; interaction?: ForwardInteraction }
export async function forwardBlocker(blockerId: string, input: ForwardBlockerInput, actor: LocalActor, file?: string) {
  validateLocal(actor)
  if (!input.correlationId?.trim()) throw new FluxError('CORRELATION_REQUIRED', 'correlationId is required')
  return mutateState((state) => {
  const existing = state.events.find((event) => event.action === 'forwarded blocker' && event.correlationId === input.correlationId)
  if (existing) {
    const handoff = state.handoffs.find((item) => item.correlationId === input.correlationId)
    return { event: existing, handoff: handoff || null, idempotent: true }
  }
  const candidates: Array<{ raw: BlockerInput; source?: Handoff }> = []
  for (const raw of state.blockers || []) candidates.push({ raw })
  for (const source of state.handoffs) for (const raw of source.blockers || []) candidates.push({ raw, source })
  const candidate = candidates.find(({ raw, source }) => raw.id === blockerId && (!input.cardId || (raw.cardId || source?.cardId) === input.cardId))
  if (!candidate) throw new FluxError('BLOCKER_NOT_FOUND', `Blocker ${blockerId} not found`, 404)
  const blocker = normalizeBlocker(candidate.raw, candidate.source?.id)
  if (blocker.status !== 'open') throw new FluxError('BLOCKER_NOT_OPEN', 'Only open blockers can be forwarded', 409)
  // The response submitted by Sergio (or the editable form) is the declaration.
  // An old blocker is context only and must never make a valid new instruction fail.
  const interaction = input.interaction || {}
  const submittedAction = input.resolutionAction || input.interaction
  if (!submittedAction || Object.keys(submittedAction).length === 0) throw new FluxError('SOLUTION_NOT_DECLARED', 'solução executável não declarada', 422)
  const resolutionAction: ResolutionAction = { ...blocker.resolutionAction, ...interaction, ...input.resolutionAction, from: actor.actor } as ResolutionAction
  const requiredActionKeys: Array<keyof ResolutionAction> = ['to', 'objective', 'deliverable', 'acceptanceCriteria', 'evidenceRequired', 'nextStep']
  const missingAction = requiredActionKeys.filter((key) => !resolutionAction[key]?.trim())
  if (missingAction.length) throw new FluxError('INVALID_FORWARDING_INSTRUCTION', `Encaminhamento requer ${missingAction.join(', ')}`, 422)
  const actionText = [interaction.message, resolutionAction.objective, resolutionAction.deliverable, resolutionAction.acceptanceCriteria, resolutionAction.evidenceRequired, resolutionAction.nextStep].filter(Boolean).join(' ')
  if (!actionText.trim() || isPassiveResolutionPlan(actionText) || (typeof interaction.message === 'string' && isPassiveResolutionPlan(interaction.message))) throw new FluxError('INVALID_FORWARDING_INSTRUCTION', 'Interação deve declarar uma ação executável', 422)
  const cardId = input.cardId || blocker.cardId || candidate.source?.cardId
  if (!cardId) throw new FluxError('CARD_REQUIRED', 'cardId is required for blocker forwarding')
  const card = state.cards.find((item) => item.id === cardId)
  if (!card) throw new FluxError('CARD_NOT_FOUND', `Card ${cardId} not found`, 404)
  validateTenant(actor, input.tenantId); validateTenant(actor, card.tenantId); if (input.tenantId && card.tenantId && input.tenantId !== card.tenantId) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403)
  const triage = triageHandoff({ snapshot: state, handoff: { cardId, project: card.project, from: actor.actor, to: resolutionAction.to, owner: resolutionAction.to, summary: resolutionAction.objective, done: resolutionAction.deliverable, risks: blocker.cause, nextStep: resolutionAction.nextStep, acceptanceCriteria: resolutionAction.acceptanceCriteria, evidenceRef: resolutionAction.evidenceRequired, blockers: [blocker] }, blocker, plan: resolutionAction.objective, correlationId: input.correlationId, trigger: 'handoff' })
  if (triage.decision === 'needs_revision') throw new FluxError('INVALID_FORWARDING_INSTRUCTION', triage.reason, 422)
  const job = input.jobId ? state.jobs?.find((item) => item.jobId === input.jobId) : state.jobs?.find((item) => item.cardId === cardId && item.blockers.includes(blocker.cause))
  if (input.jobId && !job) throw new FluxError('JOB_NOT_FOUND', `Job ${input.jobId} not found`, 404)
  const forwardingKey = `${blockerId}|${cardId}|${resolutionAction.to}|${resolutionAction.objective}|${resolutionAction.deliverable}`.trim().toLowerCase()
  const repeated = state.handoffs.find((item) => item.forwardingKey === forwardingKey)
  if (repeated) {
    const event = state.events.find((item) => item.handoffId === repeated.id && item.action === 'forwarded blocker')
    return { event: event || null, handoff: repeated, idempotent: true }
  }
  const now = new Date().toISOString(); const solution = { cause: blocker.cause, owner: resolutionAction.to, nextAction: resolutionAction.nextStep, resolutionPlan: resolutionAction.objective, resolutionEvidence: resolutionAction.evidenceRequired }
  const started = interaction.status === 'in_progress' || interaction.status === 'started'
  const nextStatus = started ? 'in_progress' : 'awaiting_owner'
  const fromStatus = card.status; card.status = nextStatus; card.updatedAt = now
  let activeJob = job
  if (!activeJob) { activeJob = { jobId: `job-forward-${createHash('sha256').update(forwardingKey).digest('hex').slice(0, 16)}`, cardId, project: card.project, agent: resolutionAction.to, role: resolutionAction.to, objective: resolutionAction.objective, status: nextStatus, updatedAt: now, artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [blocker.cause], nextStep: resolutionAction.nextStep, correlationId: input.correlationId, source: 'local/blocker-forward', sourceType: 'local', historical: false, activeBlocker: true, owner: resolutionAction.to, verification: 'not_verified', lastEvent: 'handoff_sent' }; state.jobs = [...(state.jobs || []), activeJob]; state.agentRuns = state.jobs }
  if (activeJob) { activeJob.status = nextStatus; activeJob.nextStep = resolutionAction.nextStep; activeJob.owner = resolutionAction.to; activeJob.objective = resolutionAction.objective; activeJob.updatedAt = now; activeJob.lastSeen = now; activeJob.correlationId = input.correlationId }
  if (candidate.raw) { candidate.raw.resolution = 'forwarded'; candidate.raw.resolutionAction = resolutionAction; candidate.raw.resolutionEvidence = resolutionAction.evidenceRequired }
  const handoff: Handoff = { id: `handoff-forward-${input.correlationId}`, cardId, jobId: activeJob?.jobId, blockerId, correlationId: input.correlationId, forwardingKey, resolutionAction, interaction: Object.keys(interaction).length ? interaction : undefined, project: card.project, from: resolutionAction.from, to: resolutionAction.to, summary: `Encaminhamento do blocker ${blockerId}`, done: 'Encaminhamento criado; blocker permanece open', risks: blocker.cause, nextStep: resolutionAction.nextStep, acceptanceCriteria: resolutionAction.acceptanceCriteria, evidenceRef: resolutionAction.evidenceRequired, createdAt: now, status: nextStatus, solution }
  const isDecision = actor.actor === 'Sergio' && (interaction.type === 'decision' || interaction.type === 'gate' || Boolean(interaction.decision))
  const receipt = createReceipt({ correlationId: input.correlationId, operation: 'blocker.forward', status: 'completed', actor: actor.actor, jobId: activeJob?.jobId, metadata: { blockerId, handoffId: handoff.id } }); const event: Event = { id: `event-forward-${input.correlationId}`, time: now, actor: actor.actor, action: isDecision ? 'registered Sergio decision and forwarded blocker' : 'forwarded blocker', cardId, jobId: activeJob?.jobId, handoffId: handoff.id, blockerId, from: resolutionAction.from, to: resolutionAction.to, correlationId: input.correlationId, fromStatus, toStatus: nextStatus, reason: resolutionAction.nextStep, solution, resolutionAction, receipt }
  const requiredAction: RequiredActionRecord = { id: `required-action-forward-${input.correlationId}`, dedupeKey: `blocker-forward|${blockerId}|${input.correlationId}`, what: resolutionAction.nextStep, why: blocker.cause, who: resolutionAction.to, from: actor.actor, to: resolutionAction.to, objective: resolutionAction.objective, deliverable: resolutionAction.deliverable, acceptanceCriteria: resolutionAction.acceptanceCriteria, dueCheck: resolutionAction.nextStep, fallback: resolutionAction.fallback?.trim() || 'Escalar a Sergio se o owner não entregar a evidência.', status: 'hold', reasonCode: 'BLOCKER_OPEN', correlationId: input.correlationId, createdAt: now, updatedAt: now }
  state.requiredActions ||= []; state.requiredActions.push(requiredAction)
  state.handoffs.push(handoff); state.events.push(event)
  return { event, handoff, receipt, idempotent: false }
  }, file)
}

export type IrisPersistInput = Omit<IrisTriageInput, 'snapshot' | 'blocker' | 'handoff'> & { blockerId?: string; tenantId?: string; handoff: NonNullable<IrisTriageInput['handoff']> }
export async function runIrisTriage(input: IrisPersistInput, actor: LocalActor, file?: string) {
  validateLocal(actor)
  if (!input.correlationId?.trim()) throw new FluxError('CORRELATION_REQUIRED', 'correlationId is required')
  return mutateState((state) => {
  const candidates = [...(state.blockers || []), ...state.handoffs.flatMap((item) => item.blockers || [])]
  const raw = input.blockerId ? candidates.find((item) => item.id === input.blockerId) : undefined
  if (input.blockerId && !raw) throw new FluxError('BLOCKER_NOT_FOUND', `Blocker ${input.blockerId} not found`, 404)
  const result = triageHandoff({ ...input, snapshot: state, blocker: raw ? normalizeBlocker(raw) : undefined })
  const prior = state.events.find((event) => event.action === 'iris triage' && event.correlationId === input.correlationId)
  if (prior) return { ...result, event: prior, idempotent: true, readback: { ...result.readback, persisted: true } }
  if (input.dryRun || result.decision === 'needs_revision') return { ...result, idempotent: false }
  const card = state.cards.find((item) => item.id === input.handoff.cardId)
  if (!card || !result.owner || !result.instruction) throw new FluxError('INVALID_HANDOFF', 'Triagem só persiste Handoff completo', 422)
  validateTenant(actor, input.tenantId); validateTenant(actor, card.tenantId); if (input.tenantId && card.tenantId && input.tenantId !== card.tenantId) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403)
  const now = new Date().toISOString(); const jobId = `job-iris-${createHash('sha256').update(input.correlationId).digest('hex').slice(0, 16)}`
  const action: ResolutionAction = { from: 'Íris', to: result.owner, objective: result.instruction.objective, deliverable: result.instruction.deliverable, acceptanceCriteria: result.instruction.acceptanceCriteria, evidenceRequired: result.instruction.evidence, nextStep: result.instruction.nextStep }
  const handoff: Handoff = { id: `handoff-iris-${input.correlationId}`, cardId: card.id, project: card.project, from: 'Íris', to: result.owner, summary: result.instruction.objective, done: 'Triagem registrada; execução não realizada', risks: raw?.cause || 'Nenhum blocker declarado', nextStep: result.instruction.nextStep, acceptanceCriteria: result.instruction.acceptanceCriteria, evidenceRef: result.instruction.evidence, createdAt: now, status: result.decision === 'ready' ? 'received' : result.decision === 'awaiting_owner' ? 'awaiting_owner' : 'blocked', correlationId: input.correlationId, blockerId: raw?.id, jobId, sourceType: 'local', source: 'iris-orchestrator', resolutionAction: action, activeBlocker: raw?.status === 'open' }
  const job: Job = { jobId, cardId: card.id, project: card.project, agent: result.owner, role: result.owner, objective: result.instruction.objective, status: result.decision === 'ready' ? 'ready' : result.decision === 'awaiting_owner' ? 'awaiting_owner' : 'blocked', updatedAt: now, artifactRefs: [], handoffRefs: [handoff.id], evidenceRefs: result.evidence, blockers: result.blockers, nextStep: result.instruction.nextStep, correlationId: input.correlationId, source: 'local/iris-orchestrator', sourceType: 'local', historical: false, activeBlocker: raw?.status === 'open', owner: result.owner, verification: 'not_verified', lastEvent: 'handoff_sent' }
  const receipt = createReceipt({ correlationId: input.correlationId, operation: 'iris.triage', status: 'completed', actor: actor.actor, jobId, metadata: { handoffId: handoff.id } }); const event: Event = { id: `event-iris-${input.correlationId}`, time: now, actor: actor.actor, action: 'iris triage', cardId: card.id, jobId, handoffId: handoff.id, correlationId: input.correlationId, from: 'Íris', to: result.owner, owner: result.owner, nextAction: result.instruction.nextStep, reason: result.reason, solution: { cause: result.reason, owner: result.owner, nextAction: result.instruction.nextStep, resolutionPlan: result.instruction.objective, resolutionEvidence: result.instruction.evidence }, resolutionAction: action, receipt }
  state.handoffs.push(handoff); state.jobs = [...(state.jobs || []), job]; state.agentRuns = state.jobs; state.events.push(event)
  const requiredActions: import('./iris-orchestrator').RequiredAction[] = [{ what: result.instruction.nextStep, why: result.reason, who: result.owner, from: 'Íris', to: result.owner, objective: result.instruction.objective, deliverable: result.instruction.deliverable, acceptanceCriteria: result.instruction.acceptanceCriteria, dueCheck: result.instruction.nextStep, fallback: 'Escalar a Sergio se o plano não cobrir a decisão.', status: result.decision === 'ready' ? 'ready' : 'hold' }]
  return { ...result, requiredActions, handoff, job, event, receipt, idempotent: false, readback: { blockerStatus: raw?.status, persisted: true } }
  }, file)
}

export async function resolveBlocker(blockerId: string, input: { cardId?: string; evidenceRef: string; artifactId?: string; correlationId: string; tenantId?: string }, actor: LocalActor, file?: string) {
  validateLocal(actor)
  if (!input.correlationId?.trim() || !input.evidenceRef?.trim()) throw new FluxError('EVIDENCE_REQUIRED', 'correlationId and evidenceRef are required', 422)
  return mutateState((state) => {
  const candidates: Array<{ raw: BlockerInput; source?: Handoff }> = [...(state.blockers || []).map((raw) => ({ raw })), ...state.handoffs.flatMap((source) => (source.blockers || []).map((raw) => ({ raw, source })))]
  const candidate = candidates.find(({ raw, source }) => raw.id === blockerId && (!input.cardId || (raw.cardId || source?.cardId) === input.cardId))
  if (!candidate) throw new FluxError('BLOCKER_NOT_FOUND', `Blocker ${blockerId} not found`, 404)
  const blocker = normalizeBlocker(candidate.raw, candidate.source?.id); const cardId = input.cardId || blocker.cardId || candidate.source?.cardId
  validateTenant(actor, input.tenantId); validateTenant(actor, state.cards.find((card) => card.id === cardId)?.tenantId)
  if (input.tenantId && state.cards.find((card) => card.id === cardId)?.tenantId && input.tenantId !== state.cards.find((card) => card.id === cardId)?.tenantId) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403)
  const evidence = state.artifacts.find((item) => item.status === 'available' && (!cardId || item.cardId === cardId) && (input.artifactId ? item.id === input.artifactId : item.path === input.evidenceRef || item.sourcePath === input.evidenceRef || item.name === input.evidenceRef))
  if (!evidence) throw new FluxError('MISSING_EVIDENCE', 'Resolution requires a persisted available artifact/readback', 422)
  if (blocker.status !== 'open') throw new FluxError('BLOCKER_NOT_OPEN', 'Only open blockers can be resolved', 409)
  if (candidate.source) { candidate.raw.status = 'resolved'; candidate.raw.resolution = 'declared'; candidate.raw.resolutionEvidence = input.evidenceRef }
  else { const original = state.blockers!.find((item) => item.id === blockerId)!; original.status = 'resolved'; original.resolution = 'declared'; original.resolutionEvidence = input.evidenceRef }
  const receipt = createReceipt({ correlationId: input.correlationId, operation: 'blocker.resolve', status: 'completed', actor: actor.actor, metadata: { blockerId, artifactId: evidence.id } }); const event: Event = { id: `event-resolve-${input.correlationId}`, time: new Date().toISOString(), actor: actor.actor, action: 'resolved blocker with evidence', cardId, blockerId, correlationId: input.correlationId, reason: input.evidenceRef, receipt }
  state.events.push(event); return { blocker: normalizeBlocker(candidate.raw, candidate.source?.id), event, receipt }
  }, file)
}
