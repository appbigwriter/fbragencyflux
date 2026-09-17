import { describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createProjectPlan, parseBriefing } from '../src/lib/intake'
import { createSprint, createStory } from '../src/lib/planning'
import type { FluxState } from '../src/lib/flux-repository'

describe('v1.5 local planning and intake contracts', () => {
  it('supports non-persisting intake preview and gives jobs a nextCheck', () => {
    const input = parseBriefing(`# After Forty\nowner: Sergio\ntenant: after-forty\nobjective: demo local\nscope: research\nnextStep: registrar readback\ninput: briefing\n## Acceptance\n- readback local`)
    const plan = createProjectPlan(input, 'preview-1')
    expect(plan.jobs.every(job => job.nextCheck && !job.historical)).toBe(true)
  })
  it('persists Sprint and Story locally with receipts and mandatory nextCheck', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'flux-v15-')); const file = join(dir, 'state.json')
    const state: FluxState = { version: 1, projects: [{ id: 'p1', name: 'P1', tenantId: 't1', status: 'planned', owner: 'Sergio', description: 'd' }], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], jobs: [], sprints: [], stories: [] }
    await writeFile(file, JSON.stringify(state))
    try {
      const actor = { actor: 'Sergio', scope: 'local' as const, tenantId: 't1' }
      const sprintResult = await createSprint({ projectId: 'p1', tenantId: 't1', name: 'S1', objective: 'Objetivo', owner: 'Íris', nextCheck: '2026-09-18T10:00:00Z' }, actor, file)
      const storyResult = await createStory({ sprintId: sprintResult.sprint.id, projectId: 'p1', title: 'Story 1', objective: 'Entregar', owner: 'Kora', acceptanceCriteria: ['readback'], nextCheck: '2026-09-18T11:00:00Z' }, actor, file)
      const saved = JSON.parse(await readFile(file, 'utf8')) as FluxState
      expect(saved.sprints).toHaveLength(1); expect(saved.stories).toHaveLength(1)
      expect(storyResult.receipt.operation).toBe('story.create'); expect(saved.events.some(e => e.receipt?.operation === 'sprint.create')).toBe(true)
    } finally { await rm(dir, { recursive: true, force: true }) }
  })
})
