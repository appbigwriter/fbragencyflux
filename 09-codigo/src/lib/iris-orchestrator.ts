import type { Blocker, Card, Event, FluxState, Handoff, Job } from './flux-repository'

export type IrisDecision = 'ready' | 'awaiting_owner' | 'blocked' | 'awaiting_approval' | 'needs_revision'
export type TriageTrigger = 'intake' | 'handoff' | 'event'
export type IrisInstruction = { objective: string; scope: string; deliverable: string; acceptanceCriteria: string; evidence: string; limits: string; nextStep: string; gate: string }
export type IrisTriageInput = { snapshot: FluxState; handoff?: Partial<Handoff> & { plan?: string; owner?: string }; blocker?: Blocker; plan?: string; trigger?: TriageTrigger; correlationId: string; dryRun?: boolean }
export type RequiredAction = { what: string; why: string; who: string; from: string; to: string; objective: string; deliverable: string; acceptanceCriteria: string; dueCheck: string; fallback: string; status: 'ready' | 'hold' | 'completed' }
export type IrisTriageResult = { decision: IrisDecision; correlationId: string; trigger: TriageTrigger; owner?: string; dependencies: string[]; blockers: string[]; reason: string; evidence: string[]; planningBasis: string[]; ownerReason: string; instruction?: IrisInstruction; requiredActions?: RequiredAction[]; handoff?: Handoff; job?: Job; event?: Event; readback: { blockerStatus?: string; persisted: boolean } }

const roleMatrix = [
  // Gestão Editorial por Projeto (Papel genérico: Gestor Editorial | Instâncias: Heidi Braun / Marcus Cole)
  { owner: 'Gestor Editorial', keys: ['produto-pauta', 'produto pauta', 'pauta', 'editorial', 'heidi', 'after forty', 'afterforty', 'marcus', 'talk to your crowd', 'fale com seu publico', 'storefront'], basis: 'Matriz Editorial: produto-pauta → Gestor Editorial', deps: ['Rick / Amazon Research'] },

  // Inteligência & Pesquisa
  { owner: 'Bia', keys: ['pesquisa de mercado', 'concorrencia', 'keywords', 'asin', 'amazon us', 'demanda'], basis: 'Matriz Inteligência: Pesquisa de mercado e Amazon US → Bia', deps: [] },
  { owner: 'Rick', keys: ['afiliados', 'radar de afiliados', 'amazon associates', 'clickbank', 'monetizacao', 'comissao'], basis: 'Matriz Monetização: Radar de afiliados e ofertas → Rick', deps: [] },

  // Criação & Mensagem
  { owner: 'Caio', keys: ['copy', 'carta de vendas', 'conversao', 'landing page', 'anuncio', 'aida', 'voc', 'headline'], basis: 'Matriz Copy: Mensagens comerciais e conversão → Caio', deps: ['Bia'] },
  { owner: 'Lia', keys: ['design', 'direcao visual', 'layout', 'motion', 'acessibilidade', 'wireframe', 'identidade'], basis: 'Matriz Visual: Direção visual, UI e assets → Lia', deps: ['Caio'] },
  { owner: 'Vito', keys: ['social', 'audiovisual', 'reels', 'shorts', 'storyboard', 'video', 'youtube', 'instagram'], basis: 'Matriz Audiovisual: Vídeos, Reels e redes sociais → Vito', deps: ['Caio', 'Lia'] },
  { owner: 'Rita', keys: ['listing', 'bullets', 'backend keywords', 'atributos listing', 'prelisting'], basis: 'Matriz Amazon: Criação de listings e oferta → Rita', deps: ['Bia'] },

  // Mídia & Tráfego
  { owner: 'Rafa', keys: ['trafego', 'meta ads', 'google ads', 'amazon ppc', 'pixel', 'capi', 'roas', 'campanha'], basis: 'Matriz Mídia: Planejamento de tráfego e métricas → Rafa', deps: ['Caio', 'Lia'] },

  // Engenharia, QA & Governança
  { owner: 'Théo', keys: ['provisionamento', 'migration', 'banco', 'infraestrutura', 'endpoint', 'supabase', 'deploy', 'api'], basis: 'Matriz FBR: Provisionamento, banco e código → Théo', deps: [] },
  { owner: 'Gabe', keys: ['qa', 'auditoria', 'compliance', 'checklist', 'conformidade', 'seo check', 'prontidao'], basis: 'Matriz Qualidade: QA independente e verificação fail-closed → Gabe', deps: [] },
  { owner: 'Kora', keys: ['kanban', 'card', 'intake', 'estado', 'sprint', 'capacidade', 'backlog'], basis: 'Matriz FBR: Kanban e controle de estado → Kora', deps: [] },
  { owner: 'Sergio', keys: ['gate', 'aprovação', 'aprovacao', 'publicação', 'publicacao', 'deploy producao', 'dns', 'gasto', 'verba'], basis: 'Matriz FBR: Gate humano e decisão de risco → Sergio', deps: [] },

  // Operações & Suporte
  { owner: 'Duda', keys: ['sdr', 'qualificacao', 'spin selling', 'crm', 'reuniao', 'lead'], basis: 'Matriz Comercial: SDR consultivo e pré-vendas → Duda', deps: [] },
  { owner: 'Email Guardian', keys: ['email', 'inbox seguro', 'thread', 'comunicacao'], basis: 'Matriz Suporte: Triagem segura de e-mails → Email Guardian', deps: [] },
  { owner: 'Second Brain Guardian', keys: ['second brain', 'memoria', 'indexacao', 'rastreabilidade', 'base conhecimento'], basis: 'Matriz Conhecimento: Memória e indexação → Second Brain', deps: [] },
] as const

const textOf = (input: IrisTriageInput) => [input.handoff?.summary, input.handoff?.nextStep, input.blocker?.cause, input.plan, input.handoff?.plan, input.handoff?.owner, input.handoff?.to].filter(Boolean).join(' ').toLowerCase()
const nonempty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0

export function triageHandoff(input: IrisTriageInput): IrisTriageResult {
  const h = input.handoff || {}; const cardId = h.cardId; const card = cardId ? input.snapshot.cards.find((c) => c.id === cardId) : undefined
  const plan = input.plan || h.plan || (card?.detail && card.detail !== 'Estado inicial local após reset; nenhuma execução externa.' ? card.detail : '')
  const acceptance = h.acceptanceCriteria
  const missing = [!nonempty(cardId) && 'cardId', !card && 'card existente', !nonempty(plan) && 'plano', !nonempty(h.owner || h.to) && 'owner', !nonempty(acceptance) && 'critério de aceite'].filter(Boolean) as string[]
  const text = textOf(input)
  const matched = roleMatrix.find((row) => row.keys.some((key) => text.includes(key)))
  const owner = matched?.owner || (h.owner || h.to)
  const planningBasis = matched ? [matched.basis] : []
  const dependencies = [...new Set([...(matched?.deps || []), ...(input.blocker?.resolutionAction?.to && input.blocker.resolutionAction.to !== owner ? [input.blocker.resolutionAction.to] : [])])]
  const blockerIds = (input.handoff?.blockers || []).filter((b) => b.status === 'open').map((b) => b.id)
  if (input.blocker?.status === 'open' && !blockerIds.includes(input.blocker.id)) blockerIds.push(input.blocker.id)
  if (missing.length) return { decision: 'needs_revision', correlationId: input.correlationId, trigger: input.trigger || 'handoff', dependencies, blockers: blockerIds, reason: `Handoff incompleto: ${missing.join(', ')}`, evidence: [], planningBasis, ownerReason: matched ? matched.basis : 'Nenhum owner foi inferido; matriz sem correspondência.', readback: { blockerStatus: input.blocker?.status, persisted: false } }
  if (!matched && !nonempty(h.owner || h.to)) return { decision: 'awaiting_owner', correlationId: input.correlationId, trigger: input.trigger || 'handoff', dependencies, blockers: blockerIds, reason: 'Plano não contém correspondência na matriz e owner não foi declarado.', evidence: [], planningBasis, ownerReason: 'Owner ausente na matriz e no Handoff.', readback: { blockerStatus: input.blocker?.status, persisted: false } }
  const instruction: IrisInstruction = { objective: input.blocker?.resolutionAction?.objective || h.summary!, scope: `Card ${cardId} · ${card!.project}`, deliverable: input.blocker?.resolutionAction?.deliverable || h.done!, acceptanceCriteria: acceptance!, evidence: input.blocker?.resolutionAction?.evidenceRequired || h.evidenceRef!, limits: 'Sem efeitos externos; não publicar, gastar, provisionar ou marcar blocker resolved.', nextStep: input.blocker?.resolutionAction?.nextStep || h.nextStep!, gate: matched?.owner === 'Sergio' || /gate|aprova/i.test(text) ? 'Gate explícito de Sergio antes de ação de risco.' : 'Sem Gate de execução externa; registrar evidência local.' }
  const decision: IrisDecision = input.blocker?.status === 'open' || blockerIds.length ? (matched?.owner === 'Sergio' ? 'awaiting_approval' : 'blocked') : owner === h.to ? 'ready' : 'awaiting_owner'
  const evidence = [h.evidenceRef, input.blocker?.resolutionEvidence].filter(nonempty)
  return { decision, correlationId: input.correlationId, trigger: input.trigger || 'handoff', owner, dependencies, blockers: blockerIds, reason: decision === 'blocked' ? 'Dependência/blocker aberto impede avanço.' : `Owner selecionado pela matriz: ${owner}.`, evidence, planningBasis, ownerReason: matched?.basis || 'Owner declarado no Handoff; nenhuma inferência adicional.', instruction, readback: { blockerStatus: input.blocker?.status, persisted: false } }
}

export function triageOnIntake(input: IrisTriageInput) { return triageHandoff({ ...input, trigger: 'intake' }) }
export function triageOnHandoff(input: IrisTriageInput) { return triageHandoff({ ...input, trigger: 'handoff' }) }

export function buildDependencyGraph(snapshot: FluxState) {
  const jobs = snapshot.jobs || []; const product = jobs.find((job) => /Rick|Amazon Research|produto.?pauta|pauta/i.test(`${job.agent} ${job.objective}`))
  return jobs.map((job) => {
    const commercial = /conteúdo comercial|conteudo comercial|affiliate|afiliad|publica/i.test(job.objective)
    const dependsOn = commercial && product && product.jobId !== job.jobId ? [product.jobId] : []
    const blockers = jobs.filter((candidate) => candidate.jobId !== job.jobId && candidate.dependsOn?.includes(job.jobId)).map((candidate) => candidate.jobId)
    const canStart = dependsOn.every((id) => jobs.find((candidate) => candidate.jobId === id)?.status === 'completed')
    const independent = dependsOn.length === 0
    return { jobId: job.jobId, dependsOn, blocks: blockers, canStart, independent, parallelGroup: independent ? `parallel-${job.cardId}` : undefined, track: /Théo|infra|provision|banco/i.test(`${job.agent} ${job.objective}`) ? 'technical-foundation' : /Rick|Amazon|Bia|pesquis/i.test(`${job.agent} ${job.objective}`) ? 'research' : 'content', dependencyReason: independent ? 'Nenhuma entrada necessária de outro job; track pode iniciar em paralelo.' : 'Conteúdo comercial depende do entregável produto-pauta.' }
  })
}
export function triageOnEvent(input: IrisTriageInput) { return triageHandoff({ ...input, trigger: 'event' }) }

export type DecisionBoundary = 'covered_by_plan' | 'specialist_needed' | 'outside_plan'
export type AgentDecisionAssessment = { agent: string; decisionScope: string[]; classification: DecisionBoundary; status: 'ready' | 'collaboration_required' | 'awaiting_sergio_decision'; gapAssessment: string; proposedResolution: string; planBasis?: string; collaborationRequest?: { to: string; objective: string; deliverable: string; acceptanceCriteria: string }; sergioQuestion?: { problem: string; context: string; impact: string; alternatives: string[]; recommendation: string; question: string; decisionRequired: string }; evidence: string[]; nextCheck: string }

const decisionScopes: Record<string, string[]> = {
  'Íris': ['intake', 'decomposição de briefing', 'roteamento', 'grafo de dependências', 'coordenação'],
  'Kora': ['Kanban', 'card', 'estado', 'dependências', 'sprints', 'capacidade'],
  'Bia': ['pesquisa de mercado', 'concorrência', 'keywords', 'ASINs', 'demanda Amazon US'],
  'Rita': ['draft de listing', 'título', 'bullets', 'atributos', 'backend keywords'],
  'Caio': ['copy comercial', 'páginas', 'anúncios', 'resposta direta', 'claims rastreáveis'],
  'Lia': ['direção visual', 'layout', 'motion', 'acessibilidade', 'especificações UI'],
  'Vito': ['redes sociais', 'audiovisual', 'storyboard', 'manifesto de licenças', 'vídeos'],
  'Rafa': ['plano de mídia paga', 'estrutura de campanha', 'Amazon PPC', 'requisitos de tracking'],
  'Théo': ['código', 'arquitetura', 'infraestrutura em plano', 'integração', 'deploy staging'],
  'Gabe': ['QA independente', 'evidência', 'qualidade', 'conformidade', 'checklist fail-closed'],
  'Duda': ['SDR consultivo', 'SPIN Selling', 'qualificação de leads', 'agendamento CRM'],
  'Rick / Amazon Research': ['pesquisa Amazon Associates', 'ClickBank', 'fontes de preço', 'opções de monetização'],
  'Gestor Editorial': ['pauta editorial', 'draft em inglês', 'SEO', 'sources e disclosure', 'associação pauta-produto'],
  'Heidi Braun': ['gestão editorial After Forty', 'curadoria de longevidade/vitalidade', 'pautas After Forty', 'SEO e disclosure'],
  'Marcus Cole': ['gestão editorial Talk to Your Crowd', 'estratégias de PDV e fachadas', 'pautas de retail display', 'Amazon Store Signs'],
  'Email Guardian': ['triagem de e-mails autorizados', 'classificação de threads', 'rascunhos de resposta'],
  'Second Brain Guardian': ['memória operacional', 'indexação de fontes', 'relatórios de rastreabilidade'],
  'Sergio': ['escopo', 'prioridade', 'gate', 'gasto', 'produção', 'publicação', 'irreversível']
}


export function assessAgentDecision(agent: string, input: { gap: string; context: string; proposedResolution: string; evidence?: string[]; nextCheck: string; requires?: DecisionBoundary | 'internal' | 'specialist' | 'sergio'; specialist?: string; planBasis?: string; response?: string }): AgentDecisionAssessment {
  const scope = decisionScopes[agent] || decisionScopes[agent.split(' ')[0]] || []
  const classification: DecisionBoundary = input.requires === 'internal' ? 'covered_by_plan' : input.requires === 'specialist' ? 'specialist_needed' : input.requires === 'sergio' ? 'outside_plan' : input.requires || (input.planBasis ? 'covered_by_plan' : /produto-pauta|provisionamento|gate|pauta|Amazon Research/i.test(`${input.gap} ${input.context}`) ? (input.specialist ? 'specialist_needed' : 'covered_by_plan') : 'outside_plan')
  if (classification === 'outside_plan' && !input.response?.trim()) return { agent, decisionScope: scope, classification, status: 'awaiting_sergio_decision', gapAssessment: input.gap, proposedResolution: input.proposedResolution, sergioQuestion: { problem: input.gap, context: input.context, impact: 'Avanço depende de decisão humana explícita.', alternatives: ['prosseguir com escopo atual', 'revisar escopo antes de avançar'], recommendation: input.proposedResolution, question: 'Sergio, qual alternativa deve ser autorizada?', decisionRequired: 'Decisão explícita registrada no Gate/evento.' }, evidence: input.evidence || [], nextCheck: input.nextCheck }
  if (classification === 'specialist_needed') return { agent, decisionScope: scope, classification, status: 'collaboration_required', gapAssessment: input.gap, proposedResolution: input.proposedResolution, collaborationRequest: { to: input.specialist || 'especialista declarado no plano', objective: input.proposedResolution, deliverable: 'Resultado verificável e rastreável', acceptanceCriteria: 'Entregável atende ao card e anexa evidência.' }, evidence: input.evidence || [], nextCheck: input.nextCheck }
  return { agent, decisionScope: scope, classification, status: 'ready', gapAssessment: input.gap, proposedResolution: input.proposedResolution, planBasis: input.planBasis || 'Regra já estabelecida no plano/card/Handoff.', evidence: input.evidence || [], nextCheck: input.nextCheck }
}

export type ProjectBriefing = {
  projectName: string
  niche?: string
  subniche?: string
  problemToSolve?: string
  targetAudience?: string
  personaDefined?: boolean
  personaDetails?: string
  editorialManagerName?: string
}

export type AuthorityEngineIntakeResult = {
  status: 'missing_pillars' | 'needs_persona_development' | 'ready_for_authority_engine'
  assignedManager: string
  missingPillars: string[]
  irisClarificationQuestions: string[]
  nextStep: string
  suggestedCardTitle: string
  suggestedCardDetail: string
}

export function validateAuthorityEngineBriefing(briefing: ProjectBriefing): AuthorityEngineIntakeResult {
  const missing: string[] = []
  const questions: string[] = []

  if (!briefing.niche || !briefing.niche.trim()) {
    missing.push('Nicho')
    questions.push('Qual é o Nicho macro do projeto (ex: Longevidade & Bem-Estar, Finanças, Home Fitness)?')
  }
  if (!briefing.subniche || !briefing.subniche.trim()) {
    missing.push('Subnicho')
    questions.push('Qual é o Subnicho específico de atuação (ex: Microcorrente facial e biohacking para 45+)?')
  }
  if (!briefing.problemToSolve || !briefing.problemToSolve.trim()) {
    missing.push('Problema a Resolver')
    questions.push('Qual é a dor ou problema central que este projeto se propõe a resolver para o leitor?')
  }
  if (!briefing.targetAudience || !briefing.targetAudience.trim()) {
    missing.push('Audiência Alvo')
    questions.push('Qual é a audiência que precisa (ou ainda nem sabe que precisa) resolver esse problema?')
  }

  if (missing.length > 0) {
    return {
      status: 'missing_pillars',
      assignedManager: 'Íris',
      missingPillars: missing,
      irisClarificationQuestions: questions,
      nextStep: 'Íris interage com o usuário para obter os 4 pilares obrigatórios antes de iniciar a esteira.',
      suggestedCardTitle: `[Intake Pendente] ${briefing.projectName || 'Novo Projeto'} · Completar Briefing`,
      suggestedCardDetail: `Aguardando preenchimento dos pilares fundamentais: ${missing.join(', ')}.`
    }
  }

  const manager = briefing.editorialManagerName?.trim() || (briefing.projectName.toLowerCase().includes('after forty') ? 'Heidi Braun' : 'Gestor Editorial')
  const hasPersona = Boolean(briefing.personaDefined && (briefing.personaDetails?.trim() || manager !== 'Gestor Editorial'))

  if (!hasPersona) {
    return {
      status: 'needs_persona_development',
      assignedManager: 'Íris',
      missingPillars: [],
      irisClarificationQuestions: [],
      nextStep: 'Authority Engine Etapa 1: Iniciar criação da Persona Ideal / Perfil do Gestor Editorial baseado nos 4 pilares.',
      suggestedCardTitle: `[Authority Engine · Persona] Desenvolver Perfil Editorial para ${briefing.projectName}`,
      suggestedCardDetail: `Nicho: ${briefing.niche}\nSubnicho: ${briefing.subniche}\nProblema: ${briefing.problemToSolve}\nAudiência: ${briefing.targetAudience}\n\nObjetivo: Criar Core Identity, Visual Signature e Regras de Compliance para o novo Gestor Editorial.`
    }
  }

  return {
    status: 'ready_for_authority_engine',
    assignedManager: manager,
    missingPillars: [],
    irisClarificationQuestions: [],
    nextStep: `Persona aprovada (${manager}). Iniciar Authority Engine com pesquisa de mercado (Bia/Rick) e pautas editoriais.`,
    suggestedCardTitle: `[Authority Engine · Pautas] Iniciar Esteira de Conteúdo para ${briefing.projectName}`,
    suggestedCardDetail: `Projeto: ${briefing.projectName}\nGestor(a) Editorial: ${manager}\nNicho: ${briefing.niche} / ${briefing.subniche}\nProblema: ${briefing.problemToSolve}\nAudiência: ${briefing.targetAudience}`
  }
}

