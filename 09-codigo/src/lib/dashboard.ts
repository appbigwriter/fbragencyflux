export type ProjectStatus = 'active' | 'blocked' | 'planned'
export type CardStatus = 'in_progress' | 'review' | 'blocked' | 'awaiting_approval'

export type Project = {
  id: string
  name: string
  status: ProjectStatus
  owner: string
  description: string
}

export type Card = {
  id: string
  title: string
  project: string
  status: CardStatus
  assignee: string
  priority: 'high' | 'normal'
  detail: string
}

export type Approval = {
  id: string
  cardId: string
  title: string
  requestedBy: string
  impact: string
}

export type Event = {
  id: string
  time: string
  actor: string
  action: string
  cardId?: string
}

export type DashboardSnapshot = {
  projects: Project[]
  approvals: { pending: number; items: Approval[] }
  activeCards: number
  blockers: Card[]
  recentEvents: Event[]
  cards: Card[]
}

const projects: Project[] = [
  { id: 'project-flux', name: 'FBR Agency Flux', status: 'active', owner: 'Sergio', description: 'Governança transversal e auditoria' },
  { id: 'project-conteudo', name: 'Editorial Engine', status: 'active', owner: 'Gestor Editorial', description: 'Pipeline de conteúdo e publicação' },
  { id: 'project-campanhas', name: 'Campaign Lab', status: 'blocked', owner: 'Rafa', description: 'Pesquisa e campanhas em preparação' },
]

const cards: Card[] = [
  { id: 'card-001', title: 'Validar briefing de fundação', project: 'FBR Agency Flux', status: 'in_progress', assignee: 'Íris', priority: 'high', detail: 'Escopo e critérios de aceite' },
  { id: 'card-002', title: 'Revisar contrato de handoff', project: 'FBR Agency Flux', status: 'review', assignee: 'Gabe', priority: 'normal', detail: 'Evidências e gates' },
  { id: 'card-003', title: 'Aprovar publicação editorial', project: 'Editorial Engine', status: 'awaiting_approval', assignee: 'Gestor Editorial', priority: 'high', detail: 'Escopo público aguardando Sergio' },
  { id: 'card-004', title: 'Provisionar schema dedicado', project: 'FBR Agency Flux', status: 'blocked', assignee: 'Théo', priority: 'high', detail: 'Contrato do Control Tower pendente' },
  { id: 'card-005', title: 'Aprovar orçamento de campanha', project: 'Campaign Lab', status: 'awaiting_approval', assignee: 'Rafa', priority: 'high', detail: 'Gasto e oferta aguardando Sergio' },
  { id: 'card-006', title: 'Conectar pesquisa ao plano', project: 'Campaign Lab', status: 'blocked', assignee: 'Lia', priority: 'normal', detail: 'Depende da aprovação do orçamento' },
]

const approvals: Approval[] = [
  { id: 'approval-001', cardId: 'card-003', title: 'Aprovar publicação editorial', requestedBy: 'Gestor Editorial', impact: 'Ação pública' },
  { id: 'approval-002', cardId: 'card-005', title: 'Aprovar orçamento de campanha', requestedBy: 'Rafa', impact: 'Gasto e oferta' },
]

const recentEvents: Event[] = [
  { id: 'event-001', time: 'Hoje, 10:42', actor: 'Íris', action: 'normalizou o briefing', cardId: 'card-001' },
  { id: 'event-002', time: 'Hoje, 10:18', actor: 'Gabe', action: 'enviou card para revisão', cardId: 'card-002' },
  { id: 'event-003', time: 'Hoje, 09:54', actor: 'Gestor Editorial', action: 'solicitou aprovação', cardId: 'card-003' },
  { id: 'event-004', time: 'Ontem, 17:31', actor: 'Théo', action: 'registrou bloqueio de provisionamento', cardId: 'card-004' },
  { id: 'event-005', time: 'Ontem, 16:05', actor: 'Kora', action: 'atualizou dependência', cardId: 'card-006' },
]

export function getDashboardSnapshot(): DashboardSnapshot {
  return {
    projects,
    approvals: { pending: approvals.length, items: approvals },
    activeCards: cards.filter((card) => card.status !== 'blocked').length,
    blockers: cards.filter((card) => card.status === 'blocked'),
    recentEvents,
    cards,
  }
}
