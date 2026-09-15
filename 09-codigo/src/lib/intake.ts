import { createHash } from 'node:crypto'
import type { AgentRun, Card, LocalActor, Project, ProjectStatus, JobStatus } from './flux-repository'
import { FluxError, mutateState } from './flux-repository'
import { createReceipt } from './observability'

export type ProjectInput = {
  id: string
  name: string
  tenant: string
  owner: string
  language: string
  market: string
  objective: string
  entry: string
  scope: string
  nextStep: string
  source: { kind: 'briefing'; ref: string; version: string; checksum: string }
  inputs: {
    persona: VersionedInput[]
    designSystem: VersionedInput[]
    restrictions: VersionedInput[]
    assets: VersionedInput[]
    acceptance: VersionedInput[]
  }
}
export type VersionedInput = { value: string; version: string; origin: string; owner: string; checksum: string }
export type IntakePlan = { project: Project; input: ProjectInput; cards: Card[]; jobs: AgentRun[]; receipt?: import('./observability').Receipt }

const field = (text: string, name: string) => {
  const match = text.match(new RegExp(`^\\s*${name}\\s*:\\s*(.+?)\\s*$`, 'im'))
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') || ''
}
function sectionItems(text: string, heading: string) {
  const match = text.match(new RegExp(`^##\\s+(?:${heading})\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, 'im'))
  return [...(match?.[1] || '').matchAll(/^\s*[-*]\s+(.+?)\s*$/gm)].map((item) => item[1].trim())
}
const idOf = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64)
const checksum = (value: string) => createHash('sha256').update(value).digest('hex')
const input = (value: string, owner: string): VersionedInput => ({ value, version: '1.0.0', origin: 'briefing.md', owner, checksum: checksum(value) })

export function parseBriefing(markdown: string): ProjectInput {
  if (!markdown.trim()) throw new FluxError('BRIEFING_INCOMPLETE', 'Briefing cannot be empty', 422)
  const title = markdown.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim() || ''
  const name = title || field(markdown, 'name')
  const owner = field(markdown, 'owner')
  const tenant = field(markdown, 'tenant')
  const objective = field(markdown, 'objective')
  const entry = field(markdown, 'input') || field(markdown, 'entrada')
  const scope = field(markdown, 'scope')
  const nextStep = field(markdown, 'nextStep') || field(markdown, 'next step') || field(markdown, 'próximo passo')
  if (!name || !owner || !tenant || !objective || !scope || !nextStep) throw new FluxError('BRIEFING_INCOMPLETE', 'Briefing requires explicit title, owner, tenant, objective, scope and nextStep', 422)
  const id = idOf(field(markdown, 'id') || name.replace(/^projeto\s+/i, ''))
  if (!id) throw new Error('Briefing requires a valid project identifier')
  const language = field(markdown, 'language') || 'pt-BR'
  const market = field(markdown, 'market') || 'BR'
  const groups = {
    persona: sectionItems(markdown, 'Persona|Personas').map((value) => input(value, owner)),
    designSystem: sectionItems(markdown, 'Design System').map((value) => input(value, owner)),
    restrictions: sectionItems(markdown, 'Restrictions|Restrições').map((value) => input(value, owner)),
    assets: sectionItems(markdown, 'Assets|Ativos').map((value) => input(value, owner)),
    acceptance: sectionItems(markdown, 'Acceptance|Aceite|Critérios').map((value) => input(value, owner)),
  }
  if (!entry && !groups.persona.length && !groups.designSystem.length && !groups.restrictions.length && !groups.assets.length) throw new FluxError('BRIEFING_INCOMPLETE', 'Briefing requires explicit input/entrada context', 422)
  if (!groups.acceptance.length) throw new FluxError('BRIEFING_INCOMPLETE', 'Briefing requires explicit acceptance criteria', 422)
  return { id, name, tenant, owner, language, market, objective, entry, scope, nextStep, source: { kind: 'briefing', ref: 'briefing.md', version: '1.0.0', checksum: checksum(markdown) }, inputs: groups }
}

export function projectInputChecksum(projectInput: ProjectInput) { return checksum(JSON.stringify(projectInput)) }

export function createProjectPlan(projectInput: ProjectInput, correlationId: string): IntakePlan {
  const now = new Date().toISOString()
  const project: Project = { id: projectInput.id, name: projectInput.name, tenantId: projectInput.tenant, status: 'planned' as ProjectStatus, owner: projectInput.owner, description: projectInput.objective }
  const foundationCard: Card = { id: `${projectInput.id}-foundation`, title: `${projectInput.name}: foundation`, project: projectInput.id, tenantId: projectInput.tenant, status: 'planned', assignee: 'Kora', priority: 'high', detail: projectInput.objective, acceptanceCriteria: ['Briefing normalizado', 'Evidência local anexada'], updatedAt: now }
  const executionCard: Card = { id: `${projectInput.id}-execution`, title: `${projectInput.name}: execution`, project: projectInput.id, tenantId: projectInput.tenant, status: 'planned', assignee: projectInput.owner, priority: 'normal', detail: projectInput.objective, acceptanceCriteria: ['Entregável versionado', 'Readback local persistido'], updatedAt: now }
  const base = (jobId: string, card: Card, agent: string, objective: string, dependsOn: string[] = []): AgentRun => ({ jobId, cardId: card.id, project: projectInput.id, tenantId: projectInput.tenant, agent, role: agent, objective, status: 'planned' as JobStatus, updatedAt: now, artifactRefs: [], handoffRefs: [], evidenceRefs: [projectInput.source.ref], blockers: [], nextStep: projectInput.nextStep, correlationId, source: 'local/intake', sourceType: 'local', historical: false, activeBlocker: false, owner: agent, verification: 'not_verified', dependsOn, blocks: [], canStart: dependsOn.length === 0, parallelGroup: dependsOn.length === 0 ? `parallel-${projectInput.id}` : undefined, track: dependsOn.length === 0 ? 'foundation' : 'execution' })
  const jobs = [base(`${projectInput.id}-intake`, foundationCard, 'Íris', 'Normalizar briefing e inputs versionados'), base(`${projectInput.id}-execution`, executionCard, projectInput.owner, projectInput.objective, [`${projectInput.id}-intake`])]
  return { project, input: projectInput, cards: [foundationCard, executionCard], jobs }
}

export async function persistIntake(plan: IntakePlan, actor: LocalActor, file?: string): Promise<IntakePlan> {
  if (!actor || actor.scope !== 'local' || !actor.actor.trim()) throw new FluxError('UNAUTHORIZED_ACTOR', 'A server-side local actor is required', 403)
  return mutateState((state) => {
    if (!plan.input.tenant?.trim() || plan.project.tenantId !== plan.input.tenant || plan.cards.some((card) => card.tenantId !== plan.input.tenant) || plan.jobs.some((job) => job.tenantId !== plan.input.tenant)) throw new FluxError('TENANT_MISMATCH', 'Intake entities must belong to the declared tenant', 403)
    if (actor.tenantId && actor.tenantId !== plan.input.tenant) throw new FluxError('TENANT_MISMATCH', 'Operation crosses tenant boundary', 403)
    if (state.projects.some((project) => project.id === plan.project.id && project.tenantId && project.tenantId !== plan.input.tenant)) throw new FluxError('TENANT_MISMATCH', 'Project belongs to another tenant', 403)
    if (state.projects.some((project) => project.id === plan.project.id && (project.tenantId || '') === (plan.project.tenantId || plan.input.tenant))) throw new FluxError('PROJECT_EXISTS', `Project ${plan.project.id} already exists in tenant ${plan.input.tenant}`, 409)
    state.projects.push(plan.project)
    state.cards.push(...plan.cards)
    state.jobs = [...(state.jobs || []), ...plan.jobs]
    state.agentRuns = state.jobs
    const now = new Date().toISOString()
    const receipt = createReceipt({ correlationId: plan.jobs[0]?.correlationId || plan.input.source.checksum, operation: 'intake.persist', status: 'completed', actor: actor.actor, metadata: { projectId: plan.project.id, tenant: plan.input.tenant } })
    state.events.push({ id: `event-intake-${plan.input.source.checksum}`, time: now, actor: actor.actor, action: 'created project from briefing', correlationId: plan.jobs[0]?.correlationId, reason: plan.input.source.checksum, receipt })
    return { ...plan, receipt }
  }, file)
}
