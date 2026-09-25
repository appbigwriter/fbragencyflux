import { createHmac, timingSafeEqual } from 'node:crypto'
import type { AgentRunEvent } from './flux-repository'
import type { FluxDispatchEvent } from './dispatcher'

export type HermesWebhookEnvelope = {
  hook_event_name?: string
  profile?: string
  session_id?: string
  delivery_id?: string
  timestamp?: string
  extra?: Record<string, unknown>
}

const eventMap: Record<string, AgentRunEvent> = {
  kanban_task_claimed: 'started',
  on_kanban_worker_spawned: 'progress',
  kanban_task_completed: 'completed',
  kanban_task_blocked: 'blocked',
  on_kanban_worker_exited: 'failed',
  on_kanban_task_updated: 'progress',
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

export function verifyHermesSignature(body: string, signature: string | null, secret: string | undefined): void {
  if (!secret || !signature) throw new Error('Hermes webhook signature is not configured')
  const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
  const actual = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actual.length !== expectedBuffer.length || !timingSafeEqual(actual, expectedBuffer)) throw new Error('Invalid Hermes webhook signature')
}

export function translateHermesEvent(input: HermesWebhookEnvelope): FluxDispatchEvent | null {
  const kind = text(input.hook_event_name)
  const event = kind ? eventMap[kind] : undefined
  const extra = input.extra || {}
  const taskId = text(extra.task_id)
  if (!kind || !event || !taskId) return null
  const board = text(extra.board) || 'default'
  const jobId = `hermes-kanban-${board}-${taskId}`.replace(/[^a-z0-9_-]/gi, '-')
  const sentAt = text(input.timestamp) || new Date().toISOString()
  const profile = text(input.profile) || 'default'
  const correlationId = `${profile}:${board}:${taskId}`
  return {
    eventId: text(input.delivery_id) || `hermes-${kind}-${taskId}-${sentAt}`,
    type: 'job',
    jobId,
    event,
    sentAt,
    correlationId,
    payload: {
      cardId: process.env.HERMES_FLUX_CARD_ID || 'FLUX-001',
      agent: text(extra.profile_name) || profile,
      role: text(extra.assignee) || text(extra.profile_name) || profile,
      project: `Hermes Kanban/${board}`,
      objective: `Hermes Kanban task ${taskId}`,
      source: 'Hermes outbound webhook',
      currentStep: kind,
      nextStep: event === 'completed' ? 'Flux readback' : 'Awaiting Hermes lifecycle event',
      owner: text(extra.assignee) || profile,
      blockers: text(extra.reason) ? [text(extra.reason)!] : [],
      verification: 'not_verified',
    },
  }
}
