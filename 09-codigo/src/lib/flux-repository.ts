import { readFile, stat } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { configuredRepository } from './persistence'
import { isJobStale } from './jobs'

export type ProjectStatus = 'active' | 'blocked' | 'planned'
export type CardStatus = 'planned' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'awaiting_owner' | 'awaiting_approval' | 'approved' | 'executing' | 'verifying' | 'completed' | 'failed'
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
export type Event = { id: string; time: string; actor: string; action: string; cardId?: string; correlationId?: string; fromStatus?: string; toStatus?: string; reason?: string; blockerId?: string; jobId?: string; handoffId?: string; from?: string; to?: string; owner?: string; nextAction?: string; solution?: { cause: string; owner: string; nextAction: string; resolutionPlan: string; resolutionEvidence: string } }
export type BlockerStatus = 'open' | 'resolved' | 'legacy'
export type BlockerResolution = 'declared' | 'not_declared' | 'legacy'
export type Blocker = { id: string; sourceId?: string; cardId?: string; cause: string; status: BlockerStatus; owner: string; nextAction: string; resolutionPlan: string; resolutionEvidence: string; resolution: BlockerResolution; verification: 'verified' | 'unverified' }
export type BlockerInput = Partial<Blocker> & { id: string; cause: string }
export type Risk = { sourceId: string; cause: string }
export type HandoffStatus = 'received' | 'in_progress' | 'awaiting_owner' | 'blocked' | 'released' | 'completed' | 'legacy'
export type Handoff = { id: string; cardId: string; project: string; from: string; to: string; summary: string; done: string; decisions?: string[]; risks: string; nextStep: string; acceptanceCriteria: string; evidenceRef: string; createdAt: string; status?: HandoffStatus; lastUpdate?: string; lastBlocker?: string; lastRelease?: string; blockers?: BlockerInput[]; blockerId?: string; jobId?: string; correlationId?: string; solution?: Pick<Blocker, 'cause' | 'owner' | 'nextAction' | 'resolutionPlan' | 'resolutionEvidence'>; sourceType?: 'local' | 'filesystem'; historical?: boolean; legacy?: boolean; source?: string; activeBlocker?: boolean }
export type Artifact = { id: string; cardId: string; name: string; kind: string; status: string; path: string; sourcePath: string; size: number }
export type JobStatus = 'planned' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'awaiting_owner' | 'completed' | 'failed' | 'not_verified'
export type AgentRunEvent = 'dispatched' | 'accepted' | 'started' | 'progress' | 'waiting_input' | 'blocked' | 'artifact_created' | 'handoff_sent' | 'review' | 'completed' | 'failed' | 'cancelled'
export type AgentRun = { jobId: string; cardId: string; project: string; agent: string; role: string; objective: string; status: JobStatus; startedAt?: string; updatedAt: string; completedAt?: string; artifactRefs: string[]; handoffRefs: string[]; evidenceRefs: string[]; blockers: string[]; nextStep: string; correlationId: string; source: string; sourceType?: 'local' | 'filesystem' | 'live'; historical?: boolean; activeBlocker?: boolean; lastSeen?: string; progress?: number; currentStep?: string; owner?: string; lastEvent?: AgentRunEvent; verification?: 'verified' | 'not_verified' }
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

  const plan = input.resolutionPlan?.trim() || ''
  const owner = input.owner?.trim() || ''; const nextAction = input.nextAction?.trim() || ''
  return { id: input.id, sourceId: input.sourceId || sourceId, cardId: input.cardId, cause: input.cause, status, owner, nextAction, resolutionPlan: plan, resolutionEvidence: input.resolutionEvidence?.trim() || '', resolution: input.resolution || (owner && nextAction && plan ? 'declared' : 'not_declared'), verification: input.verification || (status === 'legacy' ? 'unverified' : 'verified') }
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
async function load(file?: string, importHistory = process.env.FLUX_IMPORT_HISTORY === '1'): Promise<FluxState> {
  const repository = configuredRepository(file)
  let state = await repository.load()
  if (!state) {
    if (!file && (process.env.FLUX_PERSISTENCE || process.env.NODE_ENV === 'production') === 'supabase') throw new FluxError('STATE_NOT_FOUND', 'External Flux state is not initialized; apply the local migration and seed state before starting', 503)
    const seedPath = path.join(process.cwd(), 'data', 'flux-state.json')
    state = JSON.parse(await readFile(seedPath, 'utf8')) as FluxState
  }
  state.projects = state.projects || []; state.cards = state.cards || []; state.artifacts = state.artifacts || []
  state.handoffs = state.handoffs || []; state.events = state.events || []; state.approvals = state.approvals || []
  // Historical filesystem data is an archive, not an implicit state source.
  // Import only through the explicit command or FLUX_IMPORT_HISTORY=1.
  if (importHistory) { await syncAgentRuns(state); await syncHandoffs(state) }
  state.artifacts = state.artifacts || []; state.handoffs = state.handoffs || []; state.events = state.events || []; state.approvals = state.approvals || []
  if (!state.gates) { state.gates = seededGates.map((gate) => ({ ...gate, evidence: [...gate.evidence], blockers: [...gate.blockers] })); await save(state, file) }
  if (state.artifacts.length || state.jobs) await save(state, file)
  return state
}
async function save(state: FluxState, file?: string): Promise<void> { await configuredRepository(file).save(state) }
export async function getState(file?: string) { return load(file) }
export async function importHistory(file?: string): Promise<FluxState> {
  const state = await load(file, false)
  await syncAgentRuns(state)
  await syncHandoffs(state)
  await save(state, file)
  return state
}
export async function getJobs(file?: string, filters: { agent?: string; status?: string; card?: string } = {}) { const jobs = (await load(file)).jobs || []; return jobs.filter((job) => (!filters.agent || job.agent === filters.agent) && (!filters.status || job.status === filters.status) && (!filters.card || job.cardId === filters.card)).map((job) => ({ ...job, stale: isJobStale(job) })) }
export async function getJob(id: string, file?: string) { const job = (await load(file)).jobs?.find((item) => item.jobId === id); if (!job) throw new FluxError('JOB_NOT_FOUND', `Job ${id} not found`, 404); return job }
const runFields = ['jobId','cardId','project','agent','role','objective','status','startedAt','updatedAt','completedAt','artifactRefs','handoffRefs','evidenceRefs','blockers','nextStep','correlationId','source','lastSeen','progress','currentStep','owner','lastEvent','verification'] as const
export async function upsertJob(input: Partial<AgentRun>, actor: LocalActor, file?: string) { validateLocal(actor); if (!input.jobId || !input.cardId || !input.agent || !input.objective) throw new FluxError('INVALID_JOB', 'jobId, cardId, agent and objective are required'); const state = await load(file); const now = new Date().toISOString(); const current = (state.jobs || []).find((item) => item.jobId === input.jobId); const job: AgentRun = { ...(current || { role: '', project: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: '', correlationId: `local-${Date.now()}`, source: 'local/dispatcher adapter', sourceType: 'local', historical: false, activeBlocker: false, updatedAt: now }), ...input, updatedAt: now, lastSeen: input.lastSeen || now, sourceType: input.sourceType || current?.sourceType || 'local', historical: input.historical ?? current?.historical ?? false, activeBlocker: input.activeBlocker ?? current?.activeBlocker ?? input.status === 'blocked', verification: input.verification || current?.verification || 'not_verified' } as AgentRun; if (job.status === 'completed' && !job.evidenceRefs.length && !job.artifactRefs.length) job.status = 'not_verified'; state.jobs = current ? state.jobs!.map((item) => item.jobId === job.jobId ? job : item) : [...(state.jobs || []), job]; state.agentRuns = state.jobs; await save(state, file); return job }
export async function updateJobEvent(id: string, event: AgentRunEvent, patch: Partial<AgentRun>, actor: LocalActor, file?: string) { const current = await getJob(id, file); const statusMap: Partial<Record<AgentRunEvent, JobStatus>> = { started: 'in_progress', progress: 'in_progress', waiting_input: 'blocked', blocked: 'blocked', review: 'review', completed: 'completed', failed: 'failed', cancelled: 'failed' }; return upsertJob({ ...current, ...patch, lastEvent: event, status: patch.status || statusMap[event] || current.status, completedAt: event === 'completed' ? new Date().toISOString() : patch.completedAt }, actor, file) }

export async function getGates(file?: string): Promise<Gate[]> { return (await load(file)).gates.filter((gate) => gate.project === 'FBR Agency Flux') }
export async function getSnapshot(file?: string): Promise<DashboardSnapshot> {
  const state = await load(file)
  const projectCards = Object.fromEntries(state.projects.map((project) => [project.name, state.cards.filter((card) => card.project === project.name)]))
  const handoffs = state.handoffs.map((handoff) => ({ ...handoff, activeBlocker: (handoff.blockers || []).some((item) => normalizeBlocker(item, handoff.id).status === 'open') }))
  const blockers = [...(state.blockers || []), ...handoffs.flatMap((handoff) => (handoff.blockers || []).map((blocker) => ({ ...blocker, sourceId: handoff.id, cardId: blocker.cardId || handoff.cardId })))]
    .map((blocker) => normalizeBlocker(blocker, blocker.sourceId)).filter((blocker) => blocker.status === 'open')
  const risks = handoffs.filter((handoff) => handoff.risks?.trim()).map((handoff) => ({ sourceId: handoff.id, cause: handoff.risks }))
  return { ...state, handoffs, blockers, risks, approvals: { pending: state.approvals.filter((i) => i.status === 'pending').length, items: state.approvals }, recentEvents: state.events.slice(-50).reverse(), activeCards: state.cards.filter((c) => !['blocked', 'completed', 'failed'].includes(c.status)).length, pendingGates: state.gates.filter((gate) => gate.status === 'pending').length, pendingCards: state.cards.filter((card) => !['completed', 'failed'].includes(card.status)).length, blockerCount: blockers.filter((blocker) => blocker.status === 'open').length, projectCards }
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

export async function createHandoff(input: Omit<Handoff, 'id' | 'createdAt'>, actor: LocalActor, file?: string) { validateLocal(actor); for (const key of ['cardId','project','from','to','summary','done','risks','nextStep','acceptanceCriteria','evidenceRef'] as const) if (!input[key]?.trim()) throw new FluxError('INVALID_HANDOFF', `Handoff field ${key} is required`); const state = await load(file); const now = new Date().toISOString(); const handoff = normalizeHandoff({ ...input, id: `handoff-${createHash('sha256').update(`${input.cardId}:${input.from}:${input.to}:${input.summary}:${now}`).digest('hex').slice(0, 20)}`, createdAt: now, status: input.status || 'received', sourceType: 'local', source: 'local/flux' }, state.events); state.handoffs.push(handoff); state.events.push({ id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `registrou Handoff ${handoff.id} (LOCAL)`, cardId: handoff.cardId, correlationId: `local-${Date.now()}` }); await save(state, file); return handoff }
export type HandoffActionInput = { action: 'resume' | 'release'; correlationId: string; cause: string; solution: string; nextAction: string; owner: string }
export async function resumeLegacyHandoff(id: string, input: Pick<HandoffActionInput, 'correlationId'> & Partial<Pick<HandoffActionInput, 'nextAction' | 'owner'>>, actor: LocalActor, file?: string) {
  validateLocal(actor); if (!input.correlationId?.trim()) throw new FluxError('CORRELATION_REQUIRED', 'correlationId is required')
  const state = await load(file); const prior = state.events.find((e) => e.action === 'resumed legacy handoff' && e.correlationId === input.correlationId)
  if (prior?.handoffId) return { handoff: state.handoffs.find((h) => h.id === prior.handoffId) || null, event: prior, idempotent: true }
  const legacy = state.handoffs.find((h) => h.id === id); if (!legacy) throw new FluxError('HANDOFF_NOT_FOUND', `Handoff ${id} not found`, 404)
  if (!legacy.historical && !legacy.legacy && legacy.status !== 'legacy') throw new FluxError('NOT_LEGACY_HANDOFF', 'Only legacy Handoffs can be resumed with this action', 409)
  const nextAction = input.nextAction?.trim() || (legacy.nextStep !== 'not_declared' ? legacy.nextStep.trim() : '')
  const owner = input.owner?.trim() || (legacy.to !== 'not_declared' ? legacy.to.trim() : '')
  if (!nextAction || !owner) throw new FluxError('RESUME_DATA_REQUIRED', 'nextStep and owner must already be declared', 422)
  const now = new Date().toISOString(); const resumeId = `handoff-resume-${createHash('sha256').update(`${id}:${input.correlationId}`).digest('hex').slice(0, 20)}`
  const solution = { cause: 'Retomada de Handoff legacy', owner, nextAction, resolutionPlan: nextAction, resolutionEvidence: legacy.evidenceRef }
  const handoff: Handoff = { id: resumeId, cardId: legacy.cardId, project: legacy.project, from: actor.actor, to: owner, summary: `Retomada de ${legacy.id}`, done: 'not_declared', decisions: [], risks: legacy.risks, nextStep: nextAction, acceptanceCriteria: legacy.acceptanceCriteria, evidenceRef: legacy.evidenceRef, createdAt: now, status: 'in_progress', lastUpdate: now, sourceType: 'local', source: `resume:${legacy.id}`, historical: false, legacy: false, correlationId: input.correlationId, solution }
  const event: Event = { id: `event-resume-${input.correlationId}`, time: now, actor: actor.actor, action: 'resumed legacy handoff', cardId: legacy.cardId, handoffId: resumeId, from: actor.actor, to: owner, owner, nextAction, correlationId: input.correlationId, reason: nextAction, solution }
  state.handoffs.push(handoff); state.events.push(event); await save(state, file); return { handoff, event, idempotent: false }
}
export async function resumeHandoff(id: string, input: HandoffActionInput, actor: LocalActor, file?: string) {
  validateLocal(actor); if (!input.correlationId?.trim()) throw new FluxError('CORRELATION_REQUIRED', 'correlationId is required'); if (!input.cause?.trim() || !input.solution?.trim() || !input.nextAction?.trim() || !input.owner?.trim()) throw new FluxError('SOLUTION_REQUIRED', 'cause, solution, nextAction and owner are required', 422)
  const state = await load(file); const prior = state.events.find((e) => e.action === 'released handoff' && e.correlationId === input.correlationId)
  if (prior?.handoffId) return { handoff: state.handoffs.find((h) => h.id === prior.handoffId) || null, event: prior, idempotent: true }
  const handoff = state.handoffs.find((h) => h.id === id); if (!handoff) throw new FluxError('HANDOFF_NOT_FOUND', `Handoff ${id} not found`, 404); if (handoff.status === 'legacy' || handoff.historical) throw new FluxError('LEGACY_HANDOFF', 'Legacy Handoffs are read-only', 409)
  const now = new Date().toISOString(); const solution = { cause: input.cause, owner: input.owner, nextAction: input.nextAction, resolutionPlan: input.solution, resolutionEvidence: handoff.evidenceRef }
  handoff.status = input.action === 'release' ? 'awaiting_owner' : 'in_progress'; handoff.lastUpdate = now; handoff.lastRelease = input.action === 'release' ? now : handoff.lastRelease; handoff.solution = solution; handoff.nextStep = input.nextAction; handoff.correlationId = input.correlationId
  const event: Event = { id: `event-release-${input.correlationId}`, time: now, actor: actor.actor, action: 'released handoff', cardId: handoff.cardId, handoffId: handoff.id, jobId: handoff.jobId, from: actor.actor, to: input.owner, owner: input.owner, nextAction: input.nextAction, correlationId: input.correlationId, reason: input.cause, solution }
  state.events.push(event); await save(state, file); return { handoff, event, idempotent: false }
}
export type ForwardBlockerInput = { cardId?: string; jobId?: string; correlationId: string }
export async function forwardBlocker(blockerId: string, input: ForwardBlockerInput, actor: LocalActor, file?: string) {
  validateLocal(actor)
  if (!input.correlationId?.trim()) throw new FluxError('CORRELATION_REQUIRED', 'correlationId is required')
  const state = await load(file)
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
  if (!blocker.owner || !blocker.nextAction || !blocker.resolutionPlan) throw new FluxError('SOLUTION_NOT_DECLARED', 'solução não declarada', 422)
  const cardId = input.cardId || blocker.cardId || candidate.source?.cardId
  if (!cardId) throw new FluxError('CARD_REQUIRED', 'cardId is required for blocker forwarding')
  const card = state.cards.find((item) => item.id === cardId)
  if (!card) throw new FluxError('CARD_NOT_FOUND', `Card ${cardId} not found`, 404)
  const job = input.jobId ? state.jobs?.find((item) => item.jobId === input.jobId) : state.jobs?.find((item) => item.cardId === cardId && item.blockers.includes(blocker.cause))
  if (input.jobId && !job) throw new FluxError('JOB_NOT_FOUND', `Job ${input.jobId} not found`, 404)
  const now = new Date().toISOString(); const solution = { cause: blocker.cause, owner: blocker.owner, nextAction: blocker.nextAction, resolutionPlan: blocker.resolutionPlan, resolutionEvidence: blocker.resolutionEvidence }
  const fromStatus = card.status; card.status = 'awaiting_owner'; card.updatedAt = now
  if (job) { job.status = 'awaiting_owner'; job.nextStep = blocker.nextAction; job.owner = blocker.owner; job.updatedAt = now; job.lastSeen = now }
  const handoff: Handoff = { id: `handoff-forward-${input.correlationId}`, cardId, jobId: job?.jobId || input.jobId, blockerId, correlationId: input.correlationId, project: card.project, from: actor.actor, to: blocker.owner, summary: `Encaminhamento do blocker ${blockerId}`, done: 'Solução declarada e encaminhada', risks: blocker.cause, nextStep: blocker.nextAction, acceptanceCriteria: blocker.resolutionPlan, evidenceRef: blocker.resolutionEvidence || 'não declarada', createdAt: now, solution }
  const event: Event = { id: `event-forward-${input.correlationId}`, time: now, actor: actor.actor, action: 'forwarded blocker', cardId, jobId: job?.jobId, blockerId, from: actor.actor, to: blocker.owner, correlationId: input.correlationId, fromStatus, toStatus: 'awaiting_owner', reason: blocker.nextAction, solution }
  state.handoffs.push(handoff); state.events.push(event); await save(state, file)
  return { event, handoff, idempotent: false }
}
