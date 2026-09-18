import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import {
  approveApproval,
  createApproval,
  decideGate,
  getState,
  saveState,
  updateJobEvent,
  upsertJob,
  type Event,
  type FluxState,
} from './flux-repository'
import { createProjectPlan, parseBriefing, persistIntake } from './intake'
import { createReceipt } from './observability'

export type FluxQa016Options = { stateFile: string; fixtureFile?: string }
export type FluxQa016Result = {
  steps: string[]
  correlationId: string
  projectId: string
  cardId: string
  approvalId: string
  gateId: string
  publicationBeforeGate: { status: 'blocked'; code: string; externalActionAuthorized: false }
  provisioning: { story: string; projectId: string; blog: string; status: 'simulated'; externalActionAuthorized: false; adapter: string; readbackVersion: string; artifactPath: string }
  readback: { persisted: boolean; eventCount: number; artifactCount: number; jobStatus: string }
  publicationAfterGate: { status: 'simulated'; externalActionAuthorized: false }
  audit: { evidence: string[]; evidencePath: string }
}

type AuthorityFixture = { story: string; authoritySource: string; briefing: string }
const localActor = { actor: 'Íris', scope: 'local' as const, tenantId: 'tenant-qa-016' }
const sergio = { actor: 'Sergio', scope: 'local' as const, tenantId: 'tenant-qa-016' }
const hash = (value: string) => createHash('sha256').update(value).digest('hex')
const evidenceDir = path.resolve(process.cwd(), 'evidence')
const evidencePath = path.join(evidenceDir, 'FLUX-QA-016.json')

function initialState(): FluxState {
  return { version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [], requiredActions: [] }
}

async function addLocalRecord(file: string, mutate: (state: FluxState) => void) {
  const state = await getState(file)
  mutate(state)
  await saveState(state, file)
}

type PublicationBlocked = { status: 'blocked'; code: string; externalActionAuthorized: false }
type PublicationSimulated = { status: 'simulated'; externalActionAuthorized: false }

async function publication(file: string, cardId: string, gateId: string, correlationId: string): Promise<PublicationBlocked | PublicationSimulated> {  const state = await getState(file)
  const gate = state.gates.find((item) => item.id === gateId)
  if (!gate || gate.status !== 'approved') {
    await addLocalRecord(file, (current) => {
      const now = new Date().toISOString()
      current.events.push({
        id: `event-${correlationId}`,
        time: now,
        actor: 'Gabe',
        action: 'publication blocked until Gate (LOCAL/NO EXTERNAL EFFECT)',
        cardId,
        correlationId,
        reason: 'Gate de publicação pendente',
        receipt: createReceipt({ correlationId, operation: 'blogs.publication', status: 'blocked', actor: 'Gabe', metadata: { gateId, externalActionAuthorized: false } }),
      })
    })
    return { status: 'blocked' as const, code: 'PUBLICATION_GATE_REQUIRED', externalActionAuthorized: false as const }
  }
  await addLocalRecord(file, (current) => {
    const now = new Date().toISOString()
    current.events.push({
      id: `event-${correlationId}`,
      time: now,
      actor: 'Gestor Editorial',
      action: 'publication simulated after Gate (LOCAL/NO EXTERNAL EFFECT)',
      cardId,
      correlationId,
      reason: 'Gate aprovado localmente; nenhuma publicação externa foi executada',
      receipt: createReceipt({ correlationId, operation: 'blogs.publication', status: 'completed', actor: 'Gestor Editorial', metadata: { gateId, externalActionAuthorized: false } }),
    })
  })
  return { status: 'simulated' as const, externalActionAuthorized: false as const }
}

export async function runFluxQa016(options: FluxQa016Options): Promise<FluxQa016Result> {
  const fixtureFile = options.fixtureFile || path.resolve(process.cwd(), 'tests/fixtures/flux-qa-016-authority-input.json')
  const fixture = JSON.parse(await readFile(fixtureFile, 'utf8')) as AuthorityFixture
  await writeFile(options.stateFile, JSON.stringify(initialState()), 'utf8')
  const correlationId = 'flux-qa-016-local-e2e'
  const steps: string[] = []
  const evidence: string[] = [fixture.authoritySource, fixtureFile]

  const plan = createProjectPlan(parseBriefing(fixture.briefing), correlationId)
  await persistIntake(plan, localActor, options.stateFile)
  steps.push('base_input')
  evidence.push(`event:created project from briefing:${fixture.authoritySource}`)

  const cardId = `${plan.project.id}-foundation`
  const personaPackage = {
    story: fixture.story, version: '1.0.0', source: 'mock/local', personaId: 'persona-qa-016',
    identity: { name: 'Astra Local', thesis: 'autoridade por evidência útil' },
    voice: { tone: 'clear', formats: ['blog'] }, claims: { allowed: ['educational'], prohibited: ['guaranteed outcome'] }, disclosure: 'AI-assisted mock package',
  }
  const personaPath = path.join(path.dirname(options.stateFile), 'persona-package.json')
  await writeFile(personaPath, JSON.stringify(personaPackage, null, 2), 'utf8')
  await addLocalRecord(options.stateFile, (state) => {
    state.artifacts.push({ id: 'artifact-persona-qa-016', cardId, name: 'persona-package.json', kind: 'persona-package-mock-local', status: 'available', path: personaPath, sourcePath: fixture.authoritySource, size: JSON.stringify(personaPackage).length })
    state.events.push({ id: 'event-persona-qa-016', time: new Date().toISOString(), actor: 'AuthorityEngine', action: 'persona package received (MOCK/LOCAL)', cardId, correlationId, reason: hash(JSON.stringify(personaPackage)) })
  })
  steps.push('persona_package'); evidence.push(`artifact:${personaPath}`)

  const approval = await createApproval({ cardId, tenantId: 'tenant-qa-016', projectId: plan.project.id, project: plan.project.name, persona: 'persona-qa-016', blog: 'authority-flux-qa-016', type: 'project_scope', title: 'Aprovar pacote de persona e escopo local', requestedBy: 'Íris', impact: 'Somente estado local de teste', scope: 'Authority → Flux → Blogs → Control Tower; simulação local', rollback: 'Remover estado temporário e artefatos locais' }, localActor, options.stateFile)
  await approveApproval(approval.approval.id, 'approved', sergio, options.stateFile, { packageVersion: 1, reason: 'Aprovo o escopo local da QA-016; não autoriza ação externa.' })
  steps.push('approval'); evidence.push(`approval:${approval.approval.id}:approved-by-Sergio`)

  const approvalState = await getState(options.stateFile)
  const inboxEvent = approvalState.events.find((item) => item.action.includes('registrou decisão approved'))
  if (!inboxEvent) throw new Error('FLUX_QA_016_INBOX_EVENT_MISSING')
  await addLocalRecord(options.stateFile, (state) => {
    state.handoffs.push({ id: 'handoff-qa-016-inbox', cardId, project: plan.project.name, from: 'AuthorityEngine', to: 'Íris', summary: 'Inbox: approval e persona recebidos', done: 'Pacote local e decisão persistidos', risks: 'Nenhum efeito externo', nextStep: 'Despachar job de provisionamento simulado', acceptanceCriteria: 'Evento e pacote disponíveis para o próximo owner', evidenceRef: 'event:persona-qa-016', createdAt: new Date().toISOString(), status: 'received', correlationId, sourceType: 'local', source: 'local/authority-inbox' })
  })
  steps.push('event_inbox'); evidence.push(`inbox:event:${inboxEvent.id}`)

  await upsertJob({ jobId: 'job-qa-016-control-tower', cardId, project: plan.project.name, tenantId: 'tenant-qa-016', agent: 'Théo', role: 'Control Tower adapter', objective: 'Provisionar Control Tower simulado para o blog local', status: 'ready', artifactRefs: [], handoffRefs: ['handoff-qa-016-inbox'], evidenceRefs: ['event:persona-qa-016'], blockers: [], nextStep: 'Executar adapter local e ler estado de volta', correlationId, source: 'local/qa-016', sourceType: 'local', owner: 'Théo' }, localActor, options.stateFile)
  await updateJobEvent('job-qa-016-control-tower', 'started', {}, localActor, options.stateFile)
  steps.push('job'); evidence.push('job:job-qa-016-control-tower:started')

  const publicationGateId = 'FLUX-QA-016-GATE-PUBLICATION'
  await addLocalRecord(options.stateFile, (state) => {
    state.gates.push({ id: publicationGateId, cardId, project: 'FBR Agency Flux', title: 'Gate de publicação QA-016', requiredDecision: 'Autorizar publicação local simulada após readback', status: 'pending', impact: 'Não publica externamente', cost: 'Nenhum', scope: 'Blog authority-flux-qa-016', reversibility: 'Total', rollback: 'Excluir artefato local', evidence: ['job-qa-016-control-tower', 'readback local'], owner: 'Sergio', requestedAt: new Date().toISOString(), externalActionAuthorized: false, blockers: ['Gate pendente'] })
  })
  const provisioningPath = path.join(path.dirname(options.stateFile), 'control-tower-readback.json')
  const provisioning: FluxQa016Result['provisioning'] = { story: fixture.story, projectId: plan.project.id, blog: 'authority-flux-qa-016', status: 'simulated' as const, externalActionAuthorized: false, adapter: 'local-control-tower-fake', readbackVersion: '1.0.0', artifactPath: provisioningPath }
  await writeFile(provisioningPath, JSON.stringify(provisioning, null, 2), 'utf8')
  const completedJob = (await getState(options.stateFile)).jobs?.find((job) => job.jobId === 'job-qa-016-control-tower')
  if (!completedJob) throw new Error('FLUX_QA_016_JOB_MISSING_BEFORE_READBACK')
  await updateJobEvent('job-qa-016-control-tower', 'completed', { ...completedJob, status: 'completed', artifactRefs: ['control-tower-readback.json'], evidenceRefs: [provisioningPath], verification: 'verified', currentStep: 'readback verified' }, localActor, options.stateFile)
  await addLocalRecord(options.stateFile, (state) => {
    state.artifacts.push({ id: 'artifact-control-tower-readback-qa-016', cardId, name: 'control-tower-readback.json', kind: 'simulated-provisioning-readback', status: 'available', path: provisioningPath, sourcePath: provisioningPath, size: JSON.stringify(provisioning).length })
  })
  steps.push('simulated_provisioning')
  const readbackState = await getState(options.stateFile)
  const readback = { persisted: Boolean(readbackState.jobs?.find((job) => job.jobId === 'job-qa-016-control-tower' && job.status === 'completed' && job.verification === 'verified')), eventCount: readbackState.events.filter((event) => event.correlationId === correlationId || event.jobId === 'job-qa-016-control-tower').length, artifactCount: readbackState.artifacts.filter((artifact) => artifact.cardId === cardId).length, jobStatus: readbackState.jobs?.find((job) => job.jobId === 'job-qa-016-control-tower')?.status || 'missing' }
  steps.push('readback'); evidence.push(`readback:${provisioningPath}`)
  const before = await publication(options.stateFile, cardId, publicationGateId, 'flux-qa-016-publication-before-gate')
  if (before.status !== 'blocked') throw new Error('FLUX_QA_016_PUBLICATION_NOT_BLOCKED')
  const publicationBeforeGate: PublicationBlocked = before
  steps.push('publication_blocked'); evidence.push(`blocked:${publicationBeforeGate.code}`)

  const gate = await decideGate(publicationGateId, 'approved', sergio, options.stateFile)
  steps.push('gate_approved'); evidence.push(`gate:${gate.gate.id}:approved-by-Sergio`)
  const after = await publication(options.stateFile, cardId, publicationGateId, 'flux-qa-016-publication-after-gate')
  if (after.status !== 'simulated') throw new Error('FLUX_QA_016_PUBLICATION_NOT_SIMULATED_AFTER_GATE')
  const publicationAfterGate: PublicationSimulated = after
  steps.push('publication_simulated')

  await mkdir(evidenceDir, { recursive: true })
  const finalStatePath = path.join(evidenceDir, 'FLUX-QA-016-state.json')
  await writeFile(finalStatePath, JSON.stringify(await getState(options.stateFile), null, 2), 'utf8')
  await writeFile(evidencePath, JSON.stringify({ story: fixture.story, correlationId, stateFile: finalStatePath, steps, evidence, publicationBeforeGate, provisioning, readback, gate: { id: gate.gate.id, status: gate.gate.status, externalActionAuthorized: gate.gate.externalActionAuthorized }, publicationAfterGate }, null, 2), 'utf8')
  return { steps, correlationId, projectId: plan.project.id, cardId, approvalId: approval.approval.id, gateId: publicationGateId, publicationBeforeGate, provisioning: { ...provisioning, artifactPath: provisioningPath }, readback, publicationAfterGate, audit: { evidence, evidencePath } }
}
