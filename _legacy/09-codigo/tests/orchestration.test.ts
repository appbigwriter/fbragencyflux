import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getState, FluxError } from '../src/lib/flux-repository'
import { orchestrateLocal, retryLocalJob } from '../src/lib/orchestration'

const dirs: string[] = []
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

async function fixture(patch: Record<string, unknown> = {}) {
  const dir = await mkdtemp(join(process.cwd(), 'flux-orchestration-')); dirs.push(dir)
  const file = join(dir, 'state.json')
  await writeFile(file, JSON.stringify({ version: 1, projects: [{ id: 'p', name: 'P', status: 'active', owner: 'Kora', description: 'local' }], cards: [{ id: 'c', project: 'P', title: 'Card', status: 'ready', assignee: 'Kora', priority: 'normal', detail: 'local', acceptanceCriteria: ['readback'], updatedAt: '' }], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [{ jobId: 'j', cardId: 'c', project: 'P', agent: 'Kora', role: 'operator', objective: 'execute local job', status: 'ready', updatedAt: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'attach readback', correlationId: 'old', source: 'local', verification: 'not_verified' }], ...patch }))
  return file
}
const actor = { actor: 'Kora', scope: 'local' as const }

describe('durable local orchestration', () => {
  it('rejects invalid job transitions instead of silently executing', async () => {
    const file = await fixture({ jobs: [{ ...(await getState(await fixture())).jobs![0], status: 'completed' }] })
    await expect(orchestrateLocal({ action: 'start', jobId: 'j', correlationId: 'invalid', nextCheck: '2026-09-20T00:00:00Z' }, actor, file)).rejects.toMatchObject({ code: 'INVALID_JOB_TRANSITION' })
  })
  it('holds awaiting_approval cards and never executes their job', async () => {
    const file = await fixture({ cards: [{ id: 'c', project: 'P', title: 'Card', status: 'awaiting_approval', assignee: 'Kora', priority: 'normal', detail: 'local', acceptanceCriteria: ['readback'], updatedAt: '' }] })
    const result = await orchestrateLocal({ action: 'start', jobId: 'j', correlationId: 'approval-hold', nextCheck: '2026-09-20T00:00:00Z' }, actor, file)
    expect(result).toMatchObject({ held: true, executed: false, reasonCode: 'AWAITING_APPROVAL' })
    expect((await getState(file)).jobs?.[0]).toMatchObject({ status: 'blocked', lastEvent: 'waiting_input' })
  })
  it('requires evidence, artifact and readback before completing', async () => {
    const file = await fixture({ jobs: [{ ...(await getState(await fixture())).jobs![0], status: 'review' }] })
    await expect(orchestrateLocal({ action: 'complete', jobId: 'j', correlationId: 'missing-evidence', readback: 'readback', evidenceRefs: ['evidence'], nextCheck: '2026-09-20T00:00:00Z' }, actor, file)).rejects.toMatchObject({ code: 'COMPLETION_EVIDENCE_REQUIRED' })
    const result = await orchestrateLocal({ action: 'complete', jobId: 'j', correlationId: 'complete-ok', readback: 'readback verified', evidenceRefs: ['evidence'], artifactRefs: ['artifact'], nextCheck: '2026-09-20T00:00:00Z' }, actor, file)
    expect(result.readback).toMatchObject({ persisted: true, status: 'completed', evidenceRefs: ['evidence'], artifactRefs: ['artifact'] })
  })
  it('persists blocker ownership and nextAction as a durable hold', async () => {
    const file = await fixture({ blockers: [{ id: 'b', cardId: 'c', cause: 'missing input', status: 'open', owner: 'Gabe', nextAction: 'attach input', resolutionPlan: 'attach and read back' }] })
    const result = await orchestrateLocal({ action: 'start', jobId: 'j', correlationId: 'blocker-hold', nextCheck: '2026-09-20T00:00:00Z' }, actor, file)
    expect(result).toMatchObject({ held: true, reasonCode: 'BLOCKER_OPEN' })
    expect((await getState(file)).blockers?.[0]).toMatchObject({ owner: 'Gabe', nextAction: 'attach input' })
  })
  it('does not execute behind a pending Gate and retries idempotently', async () => {
    const file = await fixture({ gates: [{ id: 'g', cardId: 'c', project: 'P', title: 'Gate', requiredDecision: 'approve', status: 'pending', impact: 'local', cost: 'none', scope: 'local', reversibility: 'yes', rollback: 'none', evidence: [], owner: 'Sergio', requestedAt: '2026-09-19T00:00:00Z', externalActionAuthorized: false, blockers: [] }] })
    const first = await retryLocalJob('j', 'retry-same', actor, file, '2026-09-20T00:00:00Z')
    const second = await retryLocalJob('j', 'retry-same', actor, file, '2026-09-20T00:00:00Z')
    expect(first).toMatchObject({ held: true, reasonCode: 'GATE_PENDING', idempotent: false })
    expect(second).toMatchObject({ held: true, idempotent: true })
    expect((await getState(file)).events.filter((event) => event.correlationId === 'retry-same')).toHaveLength(1)
  })
  it('holds jobs whose dependency is not completed', async () => {
    const file = await fixture({ jobs: [{ ...(await getState(await fixture())).jobs![0], jobId: 'source', status: 'ready' }, { ...(await getState(await fixture())).jobs![0], jobId: 'dependent', objective: 'conteúdo comercial', status: 'ready', dependsOn: ['source'] }] })
    await expect(orchestrateLocal({ action: 'start', jobId: 'dependent', correlationId: 'dependency-hold', nextCheck: '2026-09-20T00:00:00Z' }, actor, file)).resolves.toMatchObject({ held: true })
    expect((await orchestrateLocal({ action: 'retry', jobId: 'dependent', correlationId: 'dependency-hold-2', nextCheck: '2026-09-20T00:00:00Z' }, actor, file)).reasonCode).toMatch(/^DEPENDENCY_NOT_READY:/)
  })
})
