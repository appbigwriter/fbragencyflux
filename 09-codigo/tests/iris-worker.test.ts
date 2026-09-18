import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { FakeDispatcherAdapter, type DispatcherAdapter, type FluxDispatchEvent } from '../src/lib/dispatcher'
import { getSnapshot, getState, forwardBlocker, resolveBlocker, runIrisTriage, saveState, type FluxState } from '../src/lib/flux-repository'
import { detectIdle, runIrisWorker, runOperationalChecks } from '../src/lib/iris-worker'
import { createProjectPlan, parseBriefing, persistIntake } from '../src/lib/intake'

const dirs: string[] = []
afterEach(async () => {
  const removed = dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))
  await Promise.all(removed)
})
function base(objective: string, patch: Record<string, unknown> = {}) {
  return { version: 1, projects: [{ id: 'p', name: 'P', status: 'active', owner: 'Sergio', description: 'p' }], cards: [{ id: 'C', title: 'C', project: 'P', status: 'ready', assignee: 'Íris', priority: 'normal', detail: objective, acceptanceCriteria: ['evidência'], updatedAt: '' }], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [{ jobId: 'j', cardId: 'C', project: 'P', agent: 'Rick / Amazon Research', role: 'researcher', objective, status: 'ready', updatedAt: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'entregar evidência', correlationId: 'old', source: 'test', owner: 'Rick / Amazon Research' }], ...patch }
}
async function fileFor(state: object) { const dir = await mkdtemp(join(process.cwd(), 'iris-worker-test-')); dirs.push(dir); const file = join(dir, 'state.json'); await writeFile(file, JSON.stringify(state)); return file }

class FlakyDispatcher implements DispatcherAdapter {
  attempts = 0
  emitted: unknown[] = []
  async publish(event: FluxDispatchEvent) {
    this.attempts += 1
    if (this.attempts === 1) throw new Error('temporary dispatcher failure')
    this.emitted.push(event)
  }
  async receive() { return { duplicate: false } }
}

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
  it('retries a transient dispatch failure on the next due cycle and keeps dispatcher claims local', async () => {
    const file = await fileFor(base('pesquisar opções com fontes'))
    const dispatcher = new FlakyDispatcher()
    const first = await runIrisWorker({ file, dispatcher, now: new Date('2026-09-14T12:00:00.000Z'), idleMs: 1 })
    expect(first.dispatched).toEqual([])
    expect(first.requiredActions[0]).toMatchObject({ status: 'hold', reasonCode: 'DISPATCH_FAILED' })
    const retry = await runIrisWorker({ file, dispatcher, now: new Date('2026-09-14T12:00:00.010Z'), idleMs: 1 })
    expect(retry.dispatched).toEqual(['j'])
    const state = await getState(file)
    expect(state.jobs?.find((job) => job.jobId === 'j')).toMatchObject({ lastEvent: 'dispatched', status: 'in_progress' })
    expect(state.handoffs.some((handoff) => handoff.evidenceRef === 'DISPATCHER_OUTBOUND_NOT_CONFIGURED')).toBe(false)
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
  it('is idempotent for the same persisted coordinator cycle', async () => {
    const file = await fileFor(base('pesquisar opções com fontes'))
    const now = new Date('2026-09-14T12:00:00Z')
    await runIrisWorker({ file, now, idleMs: 1000 })
    await runIrisWorker({ file, now, idleMs: 1000 })
    const state = await getState(file)
    expect(state.events.filter((event) => event.action === 'iris coordinator cycle')).toHaveLength(1)
    expect(state.requiredActions).toHaveLength(1)
  })
  it('executes local E2E intake→triage→job→handoff→blocker→readback without external dispatch claims', async () => {
    const file = await fileFor({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [], requiredActions: [] })
    const briefing = `# Projeto Worker E2E\nowner: Kora\ntenant: tenant-e2e\nobjective: Validar intake, triagem, job, handoff, blocker e readback local\ninput: Briefing local para FLUX-023\nscope: Local somente; sem dispatcher outbound real\nnextStep: Registrar evidência local\n\n## Acceptance\n- Readback local persistido\n\n## Persona\n- Operação FBR local`
    const plan = createProjectPlan(parseBriefing(briefing), 'corr-intake-e2e')
    await persistIntake(plan, { actor: 'Íris', scope: 'local', tenantId: 'tenant-e2e' }, file)
    const triage = await runIrisTriage({ correlationId: 'corr-triage-e2e', trigger: 'intake', plan: 'kanban estado intake', handoff: { cardId: 'worker-e2e-foundation', project: 'worker-e2e', from: 'Íris', to: 'Kora', owner: 'Kora', summary: 'kanban intake estado', done: 'Briefing normalizado', risks: 'Sem risco externo', nextStep: 'Kora registrar job operacional', acceptanceCriteria: 'Readback local persistido', evidenceRef: 'briefing.md' } }, { actor: 'Íris', scope: 'local', tenantId: 'tenant-e2e' }, file)
    expect(triage.readback.persisted).toBe(true)

    const beforeWorker = await getState(file)
    const triagedJob = beforeWorker.jobs?.find((job) => job.correlationId === 'corr-triage-e2e')
    expect(triagedJob?.jobId).toBeTruthy()
    triagedJob!.status = 'ready'; triagedJob!.lastActivity = '2026-09-14T11:00:00.000Z'; triagedJob!.nextCheck = '2026-09-14T11:30:00.000Z'
    await saveState(beforeWorker, file)
    const dispatcher = new FakeDispatcherAdapter()
    const worker = await runIrisWorker({ file, dispatcher, now: new Date('2026-09-14T12:00:00Z'), idleMs: 1000 })
    expect(worker.dispatched).toContain(triagedJob!.jobId)

    const state = await getState(file)
    state.handoffs.push({ id: 'handoff-e2e-blocker', cardId: 'worker-e2e-foundation', project: 'worker-e2e', from: 'Kora', to: 'Gabe', summary: 'Readback bloqueado', done: 'Job encaminhado localmente', risks: 'Evidência ainda ausente', nextStep: 'Gabe revisar evidência', acceptanceCriteria: 'Artefato de readback disponível', evidenceRef: 'artifact:readback.md', createdAt: '2026-09-14T12:01:00.000Z', status: 'blocked', blockers: [{ id: 'blocker-e2e', cardId: 'worker-e2e-foundation', cause: 'Readback local ausente', status: 'open', owner: 'Gabe', nextAction: 'Criar readback local', resolutionPlan: 'Produzir artefato de readback e anexar ao card', resolutionEvidence: 'artifact:readback.md' }] })
    await saveState(state, file)
    const forwarded = await forwardBlocker('blocker-e2e', { cardId: 'worker-e2e-foundation', jobId: triagedJob!.jobId, correlationId: 'corr-forward-e2e', resolutionAction: { to: 'Gabe', objective: 'Revisar blocker com evidência local', deliverable: 'Readback local anexado', acceptanceCriteria: 'Snapshot mostra blocker resolvido por artefato persistido', evidenceRequired: 'artifact:readback.md', nextStep: 'Gabe anexar readback local' } }, { actor: 'Íris', scope: 'local', tenantId: 'tenant-e2e' }, file)
    expect(forwarded.handoff).toMatchObject({ blockerId: 'blocker-e2e', to: 'Gabe' })

    const withArtifact = await getState(file)
    withArtifact.artifacts.push({ id: 'artifact-readback-e2e', cardId: 'worker-e2e-foundation', name: 'artifact:readback.md', kind: 'readback', status: 'available', path: 'artifact:readback.md', sourcePath: 'artifact:readback.md', size: 128 })
    await saveState(withArtifact, file)
    const resolved = await resolveBlocker('blocker-e2e', { cardId: 'worker-e2e-foundation', artifactId: 'artifact-readback-e2e', evidenceRef: 'artifact:readback.md', correlationId: 'corr-resolve-e2e', tenantId: 'tenant-e2e' }, { actor: 'Gabe', scope: 'local', tenantId: 'tenant-e2e' }, file)
    expect(resolved.blocker.status).toBe('resolved')
    const readback = await getSnapshot(file)
    expect(readback.blockers.find((blocker) => blocker.id === 'blocker-e2e')).toBeUndefined()
    expect(readback.recentEvents.map((event) => event.correlationId)).toEqual(expect.arrayContaining(['corr-intake-e2e', 'corr-triage-e2e', 'corr-forward-e2e', 'corr-resolve-e2e']))
  })
  it('runs the official worker wrapper in dry-run mode with local JSON persistence', () => {
    const result = spawnSync('npm run worker:iris -- --once --dry-run', { cwd: process.cwd(), encoding: 'utf8', shell: true, env: { ...process.env, FLUX_PERSISTENCE: 'supabase', FLUX_SUPABASE_URL: 'https://invalid.local', FLUX_SUPABASE_SERVICE_ROLE_KEY: 'invalid' } })
    expect(result.status).toBe(0)
    expect(`${result.stdout}\n${result.stderr}`).toContain('"result": "dry_run"')
  })
})
