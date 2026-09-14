import { describe, expect, it } from 'vitest'
import { assessAgentDecision, buildDependencyGraph, triageHandoff } from '../src/lib/iris-orchestrator'
import type { FluxState, Job } from '../src/lib/flux-repository'

const state = { version: 1, projects: [], cards: [{ id: 'AF-001', title: 'Produto-pauta', project: 'After Forty', status: 'ready', assignee: 'Kora', priority: 'high', detail: 'Plano After Forty: pauta, provisionamento e Gates.', acceptanceCriteria: ['matriz rastreável'], updatedAt: '' }], approvals: [], gates: [], events: [], handoffs: [], artifacts: [] } as FluxState
const handoff = { cardId: 'AF-001', from: 'Íris', to: 'Gestor Editorial', owner: 'Gestor Editorial', summary: 'produto-pauta', done: 'matriz', risks: '', nextStep: 'consultar Rick / Amazon Research', acceptanceCriteria: '2-3 opções com fontes', evidenceRef: 'matrix.md', blockers: [] }

describe('Iris orchestrator', () => {
  it('routes product pauta by plan and traces Rick dependency', () => {
    const result = triageHandoff({ snapshot: state, handoff, plan: 'produto-pauta no plano After Forty', correlationId: 'c1' })
    expect(result.owner).toBe('Gestor Editorial'); expect(result.dependencies).toContain('Rick / Amazon Research'); expect(result.planningBasis.length).toBeGreaterThan(0)
  })
  it('classifies covered, specialist and Sergio boundaries without inventing', () => {
    expect(assessAgentDecision('Íris', { gap: 'pauta inicial', context: 'regra do plano', proposedResolution: 'decompor', planBasis: 'After Forty § fluxo', nextCheck: 'após matriz' }).classification).toBe('covered_by_plan')
    expect(assessAgentDecision('Íris', { gap: 'fontes Amazon', context: 'plano', proposedResolution: 'pesquisar', requires: 'specialist_needed', specialist: 'Rick / Amazon Research', nextCheck: 'readback' }).status).toBe('collaboration_required')
    const escalation = assessAgentDecision('Bia', { gap: 'nova prioridade', context: 'não previsto no plano', proposedResolution: 'consultar', requires: 'outside_plan', nextCheck: 'após Sergio' })
    expect(escalation.status).toBe('awaiting_sergio_decision'); expect(escalation.sergioQuestion?.question).toBeTruthy()
  })
  it('returns needs_revision for incomplete Handoff', () => expect(triageHandoff({ snapshot: state, handoff: { summary: 'missing' }, correlationId: 'c2' }).decision).toBe('needs_revision'))
  it('builds parallel research/technical tracks and waits only for commercial input', () => {
    const base = { cardId: 'AF-001', project: 'After Forty', role: 'agent', updatedAt: '', artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'work', source: 'test', correlationId: 'x' }
    const jobs = [{ ...base, jobId: 'research', agent: 'Rick / Amazon Research', objective: 'pesquisar produto-pauta', status: 'ready' }, { ...base, jobId: 'theo', agent: 'Théo', objective: 'preparar provisionamento do banco', status: 'ready' }, { ...base, jobId: 'commercial', agent: 'Gestor Editorial', objective: 'conteúdo comercial específico', status: 'planned' }] as Job[]
    const graph = buildDependencyGraph({ ...state, jobs }); expect(graph.find((item) => item.jobId === 'research')?.canStart).toBe(true); expect(graph.find((item) => item.jobId === 'theo')?.canStart).toBe(true); expect(graph.find((item) => item.jobId === 'commercial')?.canStart).toBe(false); expect(graph.find((item) => item.jobId === 'theo')?.parallelGroup).toBeTruthy()
  })
})
