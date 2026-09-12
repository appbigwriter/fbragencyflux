import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type ProjectStatus = 'active' | 'blocked' | 'planned'
export type CardStatus = 'planned' | 'ready' | 'in_progress' | 'review' | 'blocked' | 'awaiting_approval' | 'approved' | 'executing' | 'verifying' | 'completed' | 'failed'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type Project = { id: string; name: string; status: ProjectStatus; owner: string; description: string }
export type Card = { id: string; title: string; project: string; status: CardStatus; assignee: string; priority: 'high' | 'normal'; detail: string; updatedAt: string }
export type Approval = { id: string; cardId: string; title: string; requestedBy: string; impact: string; status: ApprovalStatus; decidedAt?: string; decidedBy?: string }
export type Event = { id: string; time: string; actor: string; action: string; cardId?: string }
export type Handoff = { id: string; cardId: string; from: string; to: string; summary: string; createdAt: string }
export type Artifact = { id: string; cardId: string; name: string; kind: string; status: string; path: string }
export type FluxState = { version: number; projects: Project[]; cards: Card[]; approvals: Approval[]; events: Event[]; handoffs: Handoff[]; artifacts: Artifact[] }
export type DashboardSnapshot = Omit<FluxState, 'approvals' | 'events'> & { approvals: { pending: number; items: Approval[] }; recentEvents: Event[]; activeCards: number; blockers: Card[] }
export type LocalActor = { actor: string; scope: 'local' }

export class FluxError extends Error {
  constructor(public code: string, message: string, public status = 400) { super(message) }
}

const transitions: Record<CardStatus, CardStatus[]> = {
  planned: ['ready'], ready: ['in_progress'], in_progress: ['review', 'blocked'], review: ['awaiting_approval', 'in_progress', 'blocked'], blocked: ['ready', 'in_progress'], awaiting_approval: ['approved', 'blocked'], approved: ['executing'], executing: ['verifying', 'failed'], verifying: ['completed', 'failed'], completed: [], failed: ['in_progress']
}

export function dataFilePath(file = process.env.FLUX_DATA_FILE): string {
  return path.resolve(file || path.join(process.cwd(), 'data', 'flux-state.json'))
}

async function load(file?: string): Promise<FluxState> {
  const target = dataFilePath(file)
  try { return JSON.parse(await readFile(target, 'utf8')) as FluxState } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    const seedPath = path.join(process.cwd(), 'data', 'flux-state.json')
    if (target === dataFilePath() || target === seedPath) throw new FluxError('STATE_NOT_FOUND', `Flux state not found at ${target}`, 500)
    const seeded = JSON.parse(await readFile(seedPath, 'utf8')) as FluxState
    await save(seeded, target)
    return seeded
  }
}

async function save(state: FluxState, file?: string): Promise<void> {
  const target = dataFilePath(file)
  await mkdir(path.dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', flag: 'w' })
  await rename(temporary, target)
}

export async function getState(file?: string) { return load(file) }
export async function getSnapshot(file?: string): Promise<DashboardSnapshot> {
  const state = await load(file)
  return { ...state, approvals: { pending: state.approvals.filter((item) => item.status === 'pending').length, items: state.approvals }, recentEvents: state.events.slice(-20).reverse(), activeCards: state.cards.filter((card) => !['blocked', 'completed', 'failed'].includes(card.status)).length, blockers: state.cards.filter((card) => card.status === 'blocked') }
}

function validateLocal(actor: LocalActor) {
  if (!actor || typeof actor.actor !== 'string' || actor.scope !== 'local') throw new FluxError('INVALID_SCOPE', 'Only local operations are allowed')
}

export async function transitionCard(cardId: string, status: CardStatus, actor: LocalActor, file?: string) {
  validateLocal(actor)
  if (!status || !Object.hasOwn(transitions, status)) throw new FluxError('INVALID_ACTION', 'Unknown card status')
  const state = await load(file)
  const card = state.cards.find((item) => item.id === cardId)
  if (!card) throw new FluxError('CARD_NOT_FOUND', `Card ${cardId} not found`, 404)
  if (!transitions[card.status].includes(status)) throw new FluxError('INVALID_TRANSITION', `${card.status} cannot transition to ${status}`)
  const now = new Date().toISOString()
  card.status = status; card.updatedAt = now
  const event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `transicionou ${cardId} para ${status} (LOCAL)`, cardId }
  state.events.push(event)
  await save(state, file)
  return { card, event }
}

export async function approveApproval(approvalId: string, decision: Exclude<ApprovalStatus, 'pending'>, actor: LocalActor, file?: string) {
  validateLocal(actor)
  if (actor.actor !== 'Sergio') throw new FluxError('SERGIO_REQUIRED', 'Approval decisions require actor Sergio')
  if (!['approved', 'rejected'].includes(decision)) throw new FluxError('INVALID_ACTION', 'Decision must be approved or rejected')
  const state = await load(file)
  const approval = state.approvals.find((item) => item.id === approvalId)
  if (!approval) throw new FluxError('APPROVAL_NOT_FOUND', `Approval ${approvalId} not found`, 404)
  if (approval.status !== 'pending') throw new FluxError('APPROVAL_ALREADY_DECIDED', 'Approval is not pending')
  const now = new Date().toISOString(); approval.status = decision; approval.decidedAt = now; approval.decidedBy = actor.actor
  const event = { id: `event-${Date.now()}`, time: now, actor: actor.actor, action: `registrou decisão ${decision} para ${approvalId} (LOCAL/NO EXTERNAL EFFECT)`, cardId: approval.cardId }
  state.events.push(event)
  await save(state, file)
  return { approval, event }
}
