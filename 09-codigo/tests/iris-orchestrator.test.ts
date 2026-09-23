import { describe, expect, it } from 'vitest'
import { assessAgentDecision, buildDependencyGraph, triageHandoff, validateAuthorityEngineBriefing } from '../src/lib/iris-orchestrator'
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

  it('validates the 4 pillars of Authority Engine and prompts user for missing info', () => {
    const incomplete = { projectName: 'Novo Blog Finanças', niche: 'Finanças' }
    const result = validateAuthorityEngineBriefing(incomplete)
    expect(result.status).toBe('missing_pillars')
    expect(result.missingPillars).toContain('Subnicho')
    expect(result.missingPillars).toContain('Problema a Resolver')
    expect(result.missingPillars).toContain('Audiência Alvo')
    expect(result.irisClarificationQuestions.length).toBe(3)
  })

  it('triggers persona development when 4 pillars are present but no persona is defined', () => {
    const fullNoPersona = {
      projectName: 'Biohack Brasil',
      niche: 'Saúde & Longevidade',
      subnicho: 'Biohacking para Homens 40+',
      subniche: 'Biohacking para Homens 40+',
      problemToSolve: 'Queda de energia e foco após os 40 anos',
      targetAudience: 'Executivos e empreendedores 40-55 anos',
      personaDefined: false
    }
    const result = validateAuthorityEngineBriefing(fullNoPersona)
    expect(result.status).toBe('needs_persona_development')
    expect(result.assignedManager).toBe('Íris')
    expect(result.suggestedCardTitle).toContain('Desenvolver Perfil Editorial')
  })

  it('approves Authority Engine start when 4 pillars and persona are ready', () => {
    const fullWithPersona = {
      projectName: 'After Forty',
      niche: 'Saúde & Longevidade',
      subniche: 'Skin & Beauty 40+',
      problemToSolve: 'Perda de colágeno e vitalidade',
      targetAudience: 'Mulheres 40-55 anos',
      personaDefined: true,
      personaDetails: 'Heidi Braun, 50 anos, German-American',
      editorialManagerName: 'Heidi Braun'
    }
    const result = validateAuthorityEngineBriefing(fullWithPersona)
    expect(result.status).toBe('ready_for_authority_engine')
    expect(result.assignedManager).toBe('Heidi Braun')
    expect(result.suggestedCardTitle).toContain('Iniciar Esteira de Conteúdo')
  })
})

