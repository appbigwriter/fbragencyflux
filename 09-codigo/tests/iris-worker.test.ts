import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { FakeDispatcherAdapter } from '../src/lib/dispatcher'
import { getState } from '../src/lib/flux-repository'
import { detectIdle, runIrisWorker, runOperationalChecks } from '../src/lib/iris-worker'

const dirs: string[] = []
afterEach(async () => {
  const removed = dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  await Promise.all(removed)
})
function base(objective: string, patch: Record<string, unknown> = {}) {
  return { version: 1, projects: [{ id: 'p', name: 'P', status: 'active', owner: 'Sergio', description: 'p' }], cards: [{ id: 'C', title: 'C', project: 'P', status: 'ready', assignee: 'Íris', priority: 'normal', detail: objective, acceptanceCriteria: ['evidência'], updatedAt: '' }], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [{ jobId: 'j', cardId: 'C', project: 'P', agent: 'Rick / Amazon Research', role: 'researcher', objective, status: 'ready', updatedAt: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'entregar evidência', correlationId: 'old', source: 'test', owner: 'Rick / Amazon Research' }], ...patch }
}
async function fileFor(state: object) { const dir = await mkdtemp(join(process.cwd(), 'iris-worker-test-')); dirs.push(dir); const file = join(dir, 'state.json'); await (await import('node:fs/promises')).writeFile(file, JSON.stringify(state)); return file }

describe('Íris coordinator worker', () => {
  it('detects idle and converts missing dispatcher into a HOLD and Handoff without claiming dispatch', async () => {
    const file = await fileFor(base('pesquisar opções com fontes'))
    const report = await runIrisWorker({ file, now: new Date('2026-09-14T12:00:00Z'), idleMs: 1000 })
    expect(report.idle).toHaveLength(1); expect(report.dispatched).toEqual([]); expect(report.requiredActions[0].reasonCode).toBe('DISPATCHER_OUTBOUND_NOT_CONFIGURED')
    const state = await getState(file); expect(state.handoffs.some((h) => h.to === 'Théo' && h.evidenceRef === 'DISPATCHER_OUTBOUND_NOT_CONFIGURED')).toBe(true); expect(state.coordinator?.lastCoordinatorRun?.heartbeat).toBeTruthy()
  })
  it('dispatches a ready specialist through an explicit adapter and exposes parallel tracks', async () => {
    const file = await fileFor(base('pesquisar opções com fontes', { jobs: [{ ...base('x').jobs![0], jobId: 'research' }, { ...base('x').jobs![0], jobId: 'provision', agent: 'Théo', objective: 'preparar provisionamento' }] }))
    const dispatcher = new FakeDispatcherAdapter(); const report = await runIrisWorker({ file, dispatcher, now: new Date('2026-09-14T12:00:00Z'), idleMs: 1000 })
    expect(report.dispatched).toContain('research'); expect(report.tracks.find((t) => t.jobId === 'provision')?.canStart).toBe(true); expect(dispatcher.emitted[0].correlationId).toBe(report.correlationId)
  })
  it('keeps blockers in HOLD and routes outside-plan to Sergio', async () => {
    const blocked = await fileFor(base('pesquisar', { jobs: [{ ...base('x').jobs![0], blockers: ['evidência ausente'] }] }))
    expect((await runIrisWorker({ file: blocked, now: new Date('2026-09-14T12:00:00Z'), idleMs: 1000 })).requiredActions[0].reasonCode).toBe('BLOCKER_OPEN')
    const outside = await fileFor(base('fora do plano: nova prioridade'))
    expect((await runIrisWorker({ file: outside, now: new Date('2026-09-14T12:00:00Z'), idleMs: 1000 })).requiredActions[0]).toMatchObject({ reasonCode: 'OUTSIDE_PLAN_SERGIO', who: 'Sergio' })
  })
  it('is idle-safe and reports mantra checks', () => {
    const state = base('pesquisar') as any; expect(detectIdle(state, new Date('2026-09-14T12:00:00Z'), 1000)).toHaveLength(1); const checks = runOperationalChecks({ ...state, requiredActions: [{ status: 'hold', dueCheck: '2020-01-01', id: 'a' }] } as any, new Date('2026-09-14T12:00:00Z')); expect(checks.reasons.join(' ')).toContain('FOLLOW UP')
  })
})
