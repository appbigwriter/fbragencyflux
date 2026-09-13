import { mkdir, readFile, rename, stat } from 'node:fs/promises'
import { readdir } from 'node:fs/promises'
import path from 'node:path'

export type ProjectStatus = 'active' | 'blocked' | 'planned'
export type CardStatus = 'planned' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'awaiting_approval' | 'approved' | 'executing' | 'verifying' | 'completed' | 'failed'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type Project = { id: string; name: string; status: ProjectStatus; owner: string; description: string }
export type Card = { id: string; title: string; project: string; status: CardStatus; assignee: string; priority: 'high' | 'normal'; detail: string; acceptanceCriteria: string[]; updatedAt: string }
export type Approval = { id: string; cardId: string; title: string; requestedBy: string; impact: string; scope: string; rollback: string; status: ApprovalStatus; decidedAt?: string; decidedBy?: string }
export type Event = { id: string; time: string; actor: string; action: string; cardId?: string; correlationId?: string; fromStatus?: string; toStatus?: string; reason?: string }
export type Handoff = { id: string; cardId: string; project: string; from: string; to: string; summary: string; done: string; risks: string; nextStep: string; acceptanceCriteria: string; evidenceRef: string; createdAt: string }
export type Artifact = { id: string; cardId: string; name: string; kind: string; status: string; path: string; sourcePath: string; size: number }
export type FluxState = { version: number; projects: Project[]; cards: Card[]; approvals: Approval[]; events: Event[]; handoffs: Handoff[]; artifacts: Artifact[] }
export type DashboardSnapshot = Omit<FluxState, 'approvals' | 'events'> & { approvals: { pending: number; items: Approval[] }; recentEvents: Event[]; activeCards: number; blockers: Card[] }
export type LocalActor = { actor: string; scope: 'local' }

export class FluxError extends Error { constructor(public code: string, message: string, public status = 400) { super(message) } }
const transitions: Record<CardStatus, CardStatus[]> = { planned: ['ready'], ready: ['in_progress'], in_progress: ['review', 'blocked'], review: ['awaiting_approval', 'in_progress', 'blocked'], blocked: ['ready', 'in_progress'], awaiting_approval: ['approved', 'blocked'], approved: ['executing'], executing: ['verifying', 'failed'], verifying: ['completed', 'failed'], completed: [], failed: ['in_progress'] }
const allowedActors = new Set(['Sergio', 'Íris', 'Gabe', 'Kora', 'Théo', 'Bia', 'Lia', 'Caio', 'Vito', 'Rick', 'Rafa'])
const root = path.resolve(process.cwd(), '..')
const historyRoot = path.join(root, '08-historico', 'afterforty')

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
  state = await syncArtifacts(state)
  if (state.artifacts.length) await save(state, target)
  return state
}
async function save(state: FluxState, file?: string): Promise<void> { const target = dataFilePath(file); await mkdir(path.dirname(target), { recursive: true }); const temporary = `${target}.${process.pid}.tmp`; await (await import('node:fs/promises')).writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, 'utf8'); await rename(temporary, target) }
export async function getState(file?: string) { return load(file) }
export async function getSnapshot(file?: string): Promise<DashboardSnapshot> { const state = await load(file); return { ...state, approvals: { pending: state.approvals.filter((i) => i.status === 'pending').length, items: state.approvals }, recentEvents: state.events.slice(-50).reverse(), activeCards: state.cards.filter((c) => !['blocked', 'completed', 'failed'].includes(c.status)).length, blockers: state.cards.filter((c) => c.status === 'blocked') } }
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
export async function createApproval(input: Omit<Approval, 'id' | 'status' | 'decidedAt' | 'decidedBy'>, actor: LocalActor, file?: string) { validateLocal(actor); for (const key of ['cardId','title','requestedBy','impact','scope','rollback'] as const) if (!input[key]?.trim()) throw new FluxError('INVALID_APPROVAL', `Approval field ${key} is required`); const state = await load(file); if (!state.cards.some((c) => c.id === input.cardId)) throw new FluxError('CARD_NOT_FOUND', `Card ${input.cardId} not found`, 404); const approval = { ...input, id: `approval-${Date.now()}`, status: 'pending' as const }; state.approvals.push(approval); state.events.push({ id: `event-${Date.now()}`, time: new Date().toISOString(), actor: actor.actor, action: `criou Gate ${approval.id} (LOCAL)`, cardId: approval.cardId, correlationId: `local-${Date.now()}` }); await save(state, file); return approval }

export async function createHandoff(input: Omit<Handoff, 'id' | 'createdAt'>, actor: LocalActor, file?: string) { validateLocal(actor); for (const key of ['cardId','project','from','to','summary','done','risks','nextStep','acceptanceCriteria','evidenceRef'] as const) if (!input[key]?.trim()) throw new FluxError('INVALID_HANDOFF', `Handoff field ${key} is required`); const state = await load(file); const handoff = { ...input, id: `handoff-${Date.now()}`, createdAt: new Date().toISOString() }; state.handoffs.push(handoff); state.events.push({ id: `event-${Date.now()}`, time: handoff.createdAt, actor: actor.actor, action: `registrou Handoff ${handoff.id} (LOCAL)`, cardId: handoff.cardId, correlationId: `local-${Date.now()}` }); await save(state, file); return handoff }
