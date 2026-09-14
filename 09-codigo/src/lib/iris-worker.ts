import { createHash } from 'node:crypto'
import { configuredDispatcher, newDispatchEvent, type DispatcherAdapter } from './dispatcher'
import { getState, saveState, normalizeBlocker, type FluxState, type Handoff, type RequiredActionRecord } from './flux-repository'
import { buildDependencyGraph, triageOnEvent, type IrisTriageResult } from './iris-orchestrator'

export type WorkerOptions = { file?: string; dryRun?: boolean; now?: Date; idleMs?: number; dispatcher?: DispatcherAdapter }
export type IdleItem = { kind: 'job' | 'handoff'; id: string; cardId: string; owner: string; objective: string; reason: string }
export type WorkerReport = { correlationId: string; dryRun: boolean; idle: IdleItem[]; tracks: ReturnType<typeof buildDependencyGraph>; dispatched: string[]; holds: string[]; requiredActions: RequiredActionRecord[]; waitingReasons: string[]; result: 'completed' | 'dry_run' | 'failed' }

const activeStatuses = new Set(['planned', 'ready', 'in_progress', 'review', 'awaiting_owner', 'blocked'])
const iso = (value: unknown) => typeof value === 'string' && !Number.isNaN(Date.parse(value))
const keyFor = (kind: string, id: string, marker: string) => `iris-worker|${kind}|${id}|${marker || 'missing'}`
const idFor = (key: string) => `required-${createHash('sha256').update(key).digest('hex').slice(0, 20)}`

export function detectIdle(snapshot: FluxState, now = new Date(), idleMs = Number(process.env.IRIS_IDLE_MS || 30 * 60 * 1000)): IdleItem[] {
  const cutoff = now.getTime() - idleMs
  const idle: IdleItem[] = []
  for (const job of snapshot.jobs || []) {
    if (!activeStatuses.has(job.status) || job.historical) continue
    const marker = job.lastActivity || job.lastSeen || job.updatedAt
    const missing = !job.lastActivity && !job.nextCheck
    const due = !job.nextCheck || !iso(job.nextCheck) || Date.parse(job.nextCheck) <= now.getTime()
    const old = !iso(marker) || Date.parse(marker) <= cutoff
    if ((missing && due) || (old && due)) idle.push({ kind: 'job', id: job.jobId, cardId: job.cardId, owner: job.owner || job.agent, objective: job.objective, reason: missing ? 'missing_lastActivity_or_nextCheck' : 'nextCheck_due_and_idle' })
  }
  for (const handoff of snapshot.handoffs || []) {
    if (handoff.status === 'completed' || handoff.status === 'legacy' || handoff.historical) continue
    const marker = handoff.lastActivity || handoff.lastUpdate || handoff.createdAt
    const missing = !handoff.lastActivity && !handoff.nextCheck
    const due = !handoff.nextCheck || !iso(handoff.nextCheck) || Date.parse(handoff.nextCheck) <= now.getTime()
    const old = !iso(marker) || Date.parse(marker) <= cutoff
    if ((missing && due) || (old && due)) idle.push({ kind: 'handoff', id: handoff.id, cardId: handoff.cardId, owner: handoff.to, objective: handoff.summary, reason: missing ? 'missing_lastActivity_or_nextCheck' : 'nextCheck_due_and_idle' })
  }
  return idle
}

function addAction(state: FluxState, input: Omit<RequiredActionRecord, 'id' | 'createdAt' | 'updatedAt'>, now: string) {
  state.requiredActions ||= []
  const existing = state.requiredActions.find((item) => item.dedupeKey === input.dedupeKey)
  if (existing) return existing
  const action = { ...input, id: idFor(input.dedupeKey), createdAt: now, updatedAt: now }
  state.requiredActions.push(action)
  return action
}

function triageFor(item: IdleItem, state: FluxState, correlationId: string): IrisTriageResult {
  const card = state.cards.find((c) => c.id === item.cardId)
  const job = state.jobs?.find((j) => j.jobId === item.id)
  const handoff = state.handoffs.find((h) => h.id === item.id)
  const blockers = job?.blockers?.length ? [{ id: `worker-blocker-${item.id}`, cause: job.blockers[0], status: 'open' as const, owner: item.owner, nextAction: job.nextStep, resolutionPlan: job.nextStep, resolutionAction: { from: 'Íris', to: item.owner, objective: job.objective, deliverable: job.nextStep, acceptanceCriteria: 'Resultado verificável e evidência anexada.', evidenceRequired: 'Handoff/artefato do especialista', nextStep: job.nextStep } }] : undefined
  return triageOnEvent({ snapshot: state, correlationId, trigger: 'event', plan: item.objective, blocker: blockers?.[0] ? normalizeBlocker(blockers[0]) : undefined, handoff: { cardId: item.cardId, project: card?.project || handoff?.project || 'FBR Agency Flux', from: 'Íris', to: item.owner, owner: item.owner, summary: item.objective, done: job?.nextStep || handoff?.done || 'Resultado verificável', risks: job?.blockers?.join('; ') || handoff?.risks || '', nextStep: job?.nextStep || handoff?.nextStep || 'Registrar readback', acceptanceCriteria: card?.acceptanceCriteria?.join('; ') || handoff?.acceptanceCriteria || 'Resultado verificável', evidenceRef: job?.evidenceRefs?.join('; ') || handoff?.evidenceRef || 'readback local', blockers: [] } as Partial<Handoff> })
}

export function runOperationalChecks(snapshot: FluxState, now = new Date()): { followUpDue: number; unanswered: number; backlogActionable: number; reasons: string[] } {
  const due = (value?: string) => !value || !iso(value) || Date.parse(value) <= now.getTime()
  const reasons: string[] = []
  const followUpDue = (snapshot.requiredActions || []).filter((a) => a.status !== 'completed' && due(a.dueCheck)).length
  const unanswered = (snapshot.handoffs || []).filter((h) => h.status === 'awaiting_owner' || (h.status !== 'completed' && due(h.nextCheck))).length
  const backlogActionable = (snapshot.requiredActions || []).filter((a) => a.status === 'ready' || a.status === 'hold').length
  if (followUpDue) reasons.push(`Íris FOLLOW UP: ${followUpDue} ação(ões) vencida(s)`)
  if (unanswered) reasons.push(`Kora WHERE YOU AT?: ${unanswered} item(ns) sem resposta/readback`)
  if ((snapshot.jobs || []).some((j) => !j.owner && activeStatuses.has(j.status))) reasons.push('Gestor do projeto: job sem owner')
  if (backlogActionable) reasons.push(`CLEAR THE BACKLOG: ${backlogActionable} ação(ões) acionável(is)`)
  return { followUpDue, unanswered, backlogActionable, reasons }
}

export async function runIrisWorker(options: WorkerOptions = {}): Promise<WorkerReport> {
  const now = options.now || new Date(); const startedAt = now.toISOString(); const correlationId = `iris-worker-${createHash('sha256').update(`${startedAt}:${options.file || 'default'}`).digest('hex').slice(0, 20)}`
  const state = await getState(options.file); state.requiredActions ||= []; state.coordinator ||= {}
  const tracks = buildDependencyGraph(state); const idle = detectIdle(state, now, options.idleMs); const checks = runOperationalChecks(state, now)
  const report: WorkerReport = { correlationId, dryRun: Boolean(options.dryRun), idle, tracks, dispatched: [], holds: [], requiredActions: [], waitingReasons: [...checks.reasons], result: options.dryRun ? 'dry_run' : 'completed' }
  const existingCycle = state.events.find((e) => e.action === 'iris coordinator cycle' && e.correlationId === correlationId)
  if (existingCycle && !options.dryRun) return { ...report, result: 'completed' }
  const nowIso = now.toISOString()
  for (const item of idle) {
    const marker = item.kind === 'job' ? state.jobs?.find((j) => j.jobId === item.id)?.lastActivity || '' : state.handoffs.find((h) => h.id === item.id)?.lastActivity || ''
    const correlation = keyFor(item.kind, item.id, marker)
    const triage = triageFor(item, state, correlation)
    const risk = /publica|publicação|deploy|produção|gasto|pagar|apagar|irrevers/i.test(item.objective)
    const outside = /outside_plan|fora do plano|nova prioridade|escopo novo/i.test(item.objective)
    const graph = item.kind === 'job' ? tracks.find((t) => t.jobId === item.id) : undefined
    const canStart = graph?.canStart ?? true
    let status: RequiredActionRecord['status'] = 'ready'; let reasonCode: string | undefined
    if (triage.blockers.length || triage.decision === 'blocked') { status = 'hold'; reasonCode = 'BLOCKER_OPEN'; report.holds.push(item.id); report.waitingReasons.push(`${item.id}: blocker aberto`) }
    else if (outside) { status = 'hold'; reasonCode = 'OUTSIDE_PLAN_SERGIO'; report.holds.push(item.id); report.waitingReasons.push(`${item.id}: consulta Sergio necessária`) }
    else if (risk) { status = 'hold'; reasonCode = 'GATE_REQUIRED'; report.holds.push(item.id); report.waitingReasons.push(`${item.id}: Gate requerido antes de risco`) }
    else if (!canStart) { status = 'hold'; reasonCode = 'DEPENDENCY_NOT_READY'; report.holds.push(item.id); report.waitingReasons.push(`${item.id}: dependência não concluída`) }
    else if (item.kind === 'job' && triage.owner) {
      let dispatcher = options.dispatcher
      if (!dispatcher && !options.dryRun) { try { dispatcher = configuredDispatcher() } catch { reasonCode = 'DISPATCHER_OUTBOUND_NOT_CONFIGURED'; status = 'hold'; report.holds.push(item.id); report.waitingReasons.push(`${item.id}: dispatcher outbound não configurado`) } }
      if (dispatcher) {
        try { await dispatcher.publish(newDispatchEvent({ type: 'job', jobId: item.id, correlationId, payload: { status: 'ready', lastActivity: nowIso, nextCheck: new Date(now.getTime() + (options.idleMs || 30 * 60 * 1000)).toISOString(), owner: item.owner }, event: 'dispatched' })); report.dispatched.push(item.id) }
        catch { status = 'hold'; reasonCode = 'DISPATCH_FAILED'; report.holds.push(item.id); report.waitingReasons.push(`${item.id}: dispatcher rejeitou o encaminhamento`) }
      } else if (options.dryRun) report.waitingReasons.push(`${item.id}: dry-run não envia dispatcher`)
    }
    const targetOwner = item.owner || triage.owner || 'owner não declarado'
    const action = addAction(state, { dedupeKey: correlation, what: triage.instruction?.nextStep || item.objective, why: triage.reason, who: status === 'hold' && reasonCode === 'OUTSIDE_PLAN_SERGIO' ? 'Sergio' : targetOwner, from: 'Íris', to: targetOwner, objective: item.objective, deliverable: triage.instruction?.deliverable || 'Readback verificável', acceptanceCriteria: triage.instruction?.acceptanceCriteria || 'Resultado e evidência registrados', dueCheck: new Date(now.getTime() + (options.idleMs || 30 * 60 * 1000)).toISOString(), fallback: 'Reavaliar no próximo ciclo; escalar Sergio quando fora do plano.', status, reasonCode, correlationId }, nowIso)
    report.requiredActions.push(action)
    if (!options.dryRun && reasonCode === 'DISPATCHER_OUTBOUND_NOT_CONFIGURED' && !state.handoffs.some((h) => h.correlationId === correlation && h.to === 'Théo')) {
      state.handoffs.push({ id: `handoff-dispatcher-${idFor(correlation).slice(-16)}`, cardId: item.cardId, project: state.cards.find((c) => c.id === item.cardId)?.project || 'FBR Agency Flux', from: 'Íris', to: 'Théo', summary: 'Conectar emissor outbound Hermes/Flux', done: 'Nenhum agente foi acionado; conexão pendente', risks: 'Dispatcher outbound ausente', nextStep: 'Configurar e validar contrato do dispatcher com Gate', nextCheck: action.dueCheck, lastActivity: nowIso, acceptanceCriteria: 'Endpoint, autenticação e readback verificados', evidenceRef: 'DISPATCHER_OUTBOUND_NOT_CONFIGURED', createdAt: nowIso, status: 'blocked', correlationId: correlation, sourceType: 'local', source: 'iris-worker', activeBlocker: true })
    }
    if (item.kind === 'job') { const job = state.jobs?.find((j) => j.jobId === item.id); if (job && !options.dryRun) { job.lastActivity = nowIso; job.lastSeen = nowIso; job.nextCheck = action.dueCheck; job.correlationId = correlationId; job.lastEvent = report.dispatched.includes(item.id) ? 'dispatched' : 'waiting_input'; job.status = status === 'hold' ? 'blocked' : job.status } }
    else { const handoff = state.handoffs.find((h) => h.id === item.id); if (handoff && !options.dryRun) { handoff.lastActivity = nowIso; handoff.lastUpdate = nowIso; handoff.nextCheck = action.dueCheck; handoff.correlationId = correlationId; if (status === 'hold') handoff.status = 'blocked' } }
  }
  if (!options.dryRun) { const completedAt = new Date().toISOString(); state.coordinator.lastCoordinatorRun = { correlationId, startedAt, completedAt, heartbeat: completedAt, lastActivity: completedAt, idleDetected: idle.length, dispatched: report.dispatched.length, holds: report.holds.length, requiredActions: report.requiredActions.length, waitingReasons: report.waitingReasons, lastCheck: completedAt, nextFollowUp: new Date(now.getTime() + (options.idleMs || 30 * 60 * 1000)).toISOString(), unanswered: checks.unanswered, backlogActionable: state.requiredActions.filter((a) => a.status === 'ready' || a.status === 'hold').length, result: 'completed' }; state.coordinator.waitingReasons = report.waitingReasons; state.events.push({ id: `event-iris-worker-${correlationId}`, time: completedAt, actor: 'Íris', action: 'iris coordinator cycle', correlationId, reason: `${idle.length} idle; ${report.dispatched.length} dispatched; ${report.holds.length} holds` }); state.events.push({ id: `event-iris-followup-${correlationId}`, time: completedAt, actor: 'Íris', action: 'iris follow-up check', correlationId, reason: report.waitingReasons.join(' | ') || 'Nenhum item sem resposta' }); state.events.push({ id: `event-iris-keep-going-${correlationId}`, time: completedAt, actor: 'Íris', action: 'keep_going_action', correlationId, reason: idle.length ? 'Decompor gaps em ações, HOLDs ou encaminhamentos e reavaliar.' : 'Revisar backlog, dependências e nextCheck; nenhuma tarefa é encerrada por dificuldade.' }); await saveState(state, options.file) }
  return report
}
