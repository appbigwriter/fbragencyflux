import { createHmac } from 'node:crypto'
import { copyFile, mkdtemp, readFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, afterEach } from 'vitest'
import { POST } from '../src/app/api/flux/hermes-events/route'
import { translateHermesEvent } from '../src/lib/hermes-webhook'

const secret = 'local-test-secret'

afterEach(() => {
  delete process.env.HERMES_FLUX_WEBHOOK_SECRET
  delete process.env.FLUX_DATA_FILE
})

describe('Hermes outbound webhook bridge', () => {
  it('maps the documented Kanban lifecycle event without inventing a heartbeat', () => {
    const event = translateHermesEvent({ hook_event_name: 'kanban_task_claimed', profile: 'worker', delivery_id: 'delivery-1', timestamp: '2026-09-14T12:00:00.000Z', extra: { task_id: 't_123', board: 'default', assignee: 'worker' } })
    expect(event).toMatchObject({ eventId: 'delivery-1', type: 'job', event: 'started', jobId: 'hermes-kanban-default-t_123' })
    expect(translateHermesEvent({ hook_event_name: 'on_kanban_dispatch_tick', extra: { task_id: 't_123' } })).toBeNull()
  })

  it('accepts a signed webhook end-to-end and persists the Flux job readback', async () => {
    const temp = await mkdtemp(path.join(os.tmpdir(), 'flux-hermes-e2e-'))
    const dataFile = path.join(temp, 'flux-state.json')
    await copyFile(path.join(process.cwd(), 'data', 'flux-state.json'), dataFile)
    process.env.FLUX_DATA_FILE = dataFile
    process.env.HERMES_FLUX_WEBHOOK_SECRET = secret
    const body = JSON.stringify({ hook_event_name: 'kanban_task_claimed', profile: 'worker', delivery_id: `e2e-${Date.now()}`, timestamp: '2026-09-14T12:00:00.000Z', extra: { task_id: 't_e2e', board: 'default', assignee: 'worker' } })
    const signature = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`
    const response = await POST(new Request('http://localhost/api/flux/hermes-events', { method: 'POST', headers: { 'content-type': 'application/json', 'x-hermes-signature-256': signature }, body }))
    expect(response.status).toBe(200)
    const state = JSON.parse(await readFile(dataFile, 'utf8'))
    expect(state.jobs.some((job: { jobId: string; lastEvent: string }) => job.jobId === 'hermes-kanban-default-t_e2e' && job.lastEvent === 'started')).toBe(true)
  })
})
