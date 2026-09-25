import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createProjectPlan, parseBriefing, projectInputChecksum } from '../src/lib/intake'
import { dispatchIncoming } from '../src/lib/dispatcher'
import { POST as dispatcherPost } from '../src/app/api/flux/dispatcher/route'
import { getState } from '../src/lib/flux-repository'

type Temp = { dir: string; file: string }
const temps: Temp[] = []
afterEach(async () => { await Promise.all(temps.splice(0).map(({ dir }) => rm(dir, { recursive: true, force: true }))) })

async function stateFile() {
  const dir = await mkdtemp(join(process.cwd(), 'flux-close-'))
  const file = join(dir, 'state.json')
  await writeFile(file, JSON.stringify({ version: 1, projects: [], cards: [{ id: 'card-1', title: 'test', project: 'atlas', status: 'ready', assignee: 'Kora', priority: 'normal', detail: 'test', acceptanceCriteria: ['evidence'], updatedAt: '' }], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [{ jobId: 'job-1', cardId: 'card-1', project: 'atlas', agent: 'Kora', role: 'Kora', objective: 'test', status: 'ready', updatedAt: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'done', correlationId: 'old', source: 'test' }] }))
  temps.push({ dir, file })
  return file
}

describe('local closing contracts', () => {
  it('parses a generic markdown briefing and creates versioned project inputs', () => {
    const input = parseBriefing(`# Projeto Atlas\n\nowner: Kora\ntenant: atlas\nlanguage: pt-BR\nmarket: BR\nobjective: Validar intake genérico\nscope: somente estado local\nnextStep: anexar readback\n\n## Assets\n- brief.md\n\n## Restrictions\n- Sem publicação\n\n## Acceptance\n- Readback local\n`)
    expect(input).toMatchObject({ id: 'atlas', owner: 'Kora', tenant: 'atlas', language: 'pt-BR', market: 'BR' })
    expect(input.inputs.assets[0]).toMatchObject({ value: 'brief.md', version: '1.0.0', owner: 'Kora' })
    expect(input.inputs.restrictions[0].origin).toBe('briefing.md')
    expect(projectInputChecksum(input)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('creates isolated project, cards, jobs, dependencies and correlation IDs without fixtures', () => {
    const input = parseBriefing(`# Projeto Atlas\n\nowner: Kora\ntenant: atlas\nlanguage: pt-BR\nmarket: BR\nobjective: Validar intake\ninput: briefing local\nscope: somente local\nnextStep: registrar evidência\n\n## Acceptance\n- Evidência local\n`)
    const plan = createProjectPlan(input, 'corr-atlas')
    expect(plan.project.id).toBe('atlas')
    expect(plan.cards.every((card) => card.project === 'atlas')).toBe(true)
    expect(plan.jobs).toHaveLength(2)
    expect(plan.jobs[0].parallelGroup).toBeTruthy()
    expect(plan.jobs[0].correlationId).toBe('corr-atlas')
  })

  it('keeps two different project names isolated inside the same tenant', () => {
    const first = parseBriefing('# Catalogo Norte\n\nowner: Kora\ntenant: shared\nobjective: Norte\ninput: briefing Norte\nscope: local\nnextStep: validar\n\n## Acceptance\n- Norte validado')
    const second = parseBriefing('# Catalogo Sul\n\nowner: Kora\ntenant: shared\nobjective: Sul\ninput: briefing Sul\nscope: local\nnextStep: validar\n\n## Acceptance\n- Sul validado')
    expect(first.id).not.toBe(second.id)
    expect(createProjectPlan(first, 'c1').project.id).not.toBe(createProjectPlan(second, 'c2').project.id)
  })

  it('deduplicates the dispatcher route through persistent inbox after route-level restart', async () => {
    const file = await stateFile(); const previousFile = process.env.FLUX_DATA_FILE; const previousToken = process.env.FLUX_DISPATCHER_TOKEN
    process.env.FLUX_DATA_FILE = file; process.env.FLUX_DISPATCHER_TOKEN = 'route-test-token'
    try {
      const event = { eventId: 'evt-route-durable', type: 'job' as const, jobId: 'job-1', event: 'started' as const, sentAt: '2026-09-15T12:00:00.000Z', correlationId: 'route-corr', payload: { cardId: 'card-1', agent: 'Kora', objective: 'test' } }
      const request = () => new Request('http://localhost/api/flux/dispatcher', { method: 'POST', headers: { authorization: 'Bearer route-test-token', 'content-type': 'application/json' }, body: JSON.stringify(event) })
      expect((await dispatcherPost(request())).status).toBe(200)
      expect((await dispatcherPost(request())).status).toBe(200)
      expect((await getState(file)).events.filter((item) => item.reason === event.eventId)).toHaveLength(1)
    } finally { if (previousFile === undefined) delete process.env.FLUX_DATA_FILE; else process.env.FLUX_DATA_FILE = previousFile; if (previousToken === undefined) delete process.env.FLUX_DISPATCHER_TOKEN; else process.env.FLUX_DISPATCHER_TOKEN = previousToken }
  })
})
