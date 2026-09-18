import { describe, expect, it } from 'vitest'
import { FakeFluxRepository } from '../src/lib/persistence'
import { receivePersonaApproved, type PersonaApprovedEnvelope, type PersonaProvisioningAdapter } from '../src/lib/persona-approved'
import type { FluxState } from '../src/lib/flux-repository'

const envelope: PersonaApprovedEnvelope = {
  event_id: 'evt-persona-approved-1', event_type: 'persona.approved', event_version: 1,
  occurred_at: '2026-09-18T12:00:00.000Z', source: 'authority-engine', aggregate_type: 'persona', aggregate_id: 'persona-1', aggregate_version: 3,
  correlation_id: 'corr-persona-1', causation_id: null,
  payload: { persona_id: 'persona-1', persona_version_id: 'persona-version-3', blog_id: 'blog-1', tenant_id: 'tenant-1', project_id: 'project-1' },
}
const initial = (): FluxState => ({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [] })
const actor = { actor: 'Íris', scope: 'local' as const }

describe('persona.approved local inbox boundary', () => {
  it('creates a blocked idempotent provisioning job and handoff without calling external systems', async () => {
    const repository = new FakeFluxRepository(initial())
    const first = await receivePersonaApproved(envelope, actor, undefined, undefined, repository)
    const second = await receivePersonaApproved(envelope, actor, undefined, undefined, repository)
    const state = (await repository.load())!
    expect(first).toMatchObject({ duplicate: false, status: 'blocked', readback: { persisted: true, status: 'blocked' } })
    expect(second).toMatchObject({ duplicate: true, status: 'blocked', jobId: first.jobId, handoffId: first.handoffId })
    expect(state.jobs).toHaveLength(1)
    expect(state.handoffs).toHaveLength(1)
    expect(state.jobs?.[0]).toMatchObject({ tenantId: 'tenant-1', projectId: 'project-1', personaId: 'persona-1', personaVersionId: 'persona-version-3', blogId: 'blog-1', readbackStatus: 'blocked', lastError: 'AUTHORITY_BLOGS_ADAPTER_CONTRACT_NOT_READY' })
    expect(state.handoffs?.[0]).toMatchObject({ jobId: first.jobId, correlationId: 'corr-persona-1', readbackStatus: 'blocked' })
    const inbox = (state as FluxState & { eventInbox?: Array<Record<string, unknown>> }).eventInbox?.[0]
    expect(inbox).toMatchObject({ eventId: 'evt-persona-approved-1', consumer: 'flux.persona-approved.provisioning', receivedAt: expect.any(String), processedAt: expect.any(String), attemptCount: 1, status: 'blocked' })
    expect(state.events.filter((event) => event.action === 'persona.approved accepted')).toHaveLength(0)
  })

  it('requires verified readback before advancing a fake adapter result', async () => {
    const repository = new FakeFluxRepository(initial())
    const adapter: PersonaProvisioningAdapter = { async provision() { return { status: 'accepted', readback: { status: 'verified', reference: 'fake-readback-1' } } } }
    const result = await receivePersonaApproved(envelope, actor, undefined, adapter, repository)
    const state = (await repository.load())!
    expect(result).toMatchObject({ status: 'completed', readback: { status: 'verified', reference: 'fake-readback-1' } })
    expect(state.jobs?.[0]).toMatchObject({ status: 'review', readbackStatus: 'verified', verification: 'verified' })
    expect(state.handoffs?.[0]).toMatchObject({ status: 'in_progress', readbackStatus: 'verified' })
  })

  it('rejects a different event shape before persistence', async () => {
    await expect(receivePersonaApproved({ ...envelope, event_type: 'persona.pending' } as never, actor, undefined, undefined, new FakeFluxRepository(initial()))).rejects.toMatchObject({ code: 'INVALID_PERSONA_APPROVED_EVENT' })
  })
})
