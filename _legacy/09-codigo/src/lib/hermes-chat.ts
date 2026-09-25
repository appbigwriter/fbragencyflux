import type { Blocker, Card, Handoff } from './flux-repository'

export const HERMES_BLOCKER_QUESTION = 'Analise este impasse, verifique o plano, proponha a próxima ação ou encaminhe ao agente correto; não marque resolvido sem evidência.'
const MAX_FIELD_LENGTH = 600
const MAX_PROMPT_LENGTH = 6000
const SECRET_PATTERNS = [
  /(?:password|passwd|senha|token|secret|credential|credencial|api[_ -]?key|access[_ -]?key|private[_ -]?key)\s*[:=]\s*[^\s,;]+/gi,
  /(?:bearer\s+)[a-z0-9._~+/=-]+/gi,
  /(?:sk|pk)_(?:live|test)_[a-z0-9_-]+/gi,
]

export function sanitizeHermesText(value: unknown, limit = MAX_FIELD_LENGTH): string {
  if (typeof value !== 'string') return 'não declarado'
  let safe = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  for (const pattern of SECRET_PATTERNS) safe = safe.replace(pattern, '[REDACTED]')
  return safe.slice(0, limit) || 'não declarado'
}

function line(label: string, value: unknown) {
  return `${label}: ${sanitizeHermesText(value)}`
}

type ChatBlocker = Pick<Blocker, 'id' | 'cause' | 'owner' | 'nextAction' | 'resolutionPlan' | 'resolutionEvidence' | 'resolutionAction'> & { status?: string; sourceId?: string; cardId?: string; author?: string }
type ChatHandoff = Pick<Handoff, 'id' | 'cardId' | 'project' | 'from' | 'to' | 'summary' | 'acceptanceCriteria' | 'evidenceRef'> & { status?: string }

export function buildBlockerChatPrompt({ project, card, handoff, blocker }: { project?: string; card?: Card; handoff?: ChatHandoff; blocker: ChatBlocker }): string {
  const resolution = blocker.resolutionAction
  const author = blocker.author || handoff?.from
  const owner = blocker.owner || resolution?.to
  const lines = [
    'Contexto operacional do Flux — blocker',
    line('Projeto', project || handoff?.project || card?.project),
    line('Card', card ? `${card.id} · ${card.title}` : blocker.cardId),
    line('Handoff ID', handoff?.id || blocker.sourceId),
    line('Blocker ID', blocker.id),
    line('Autor do bloqueio', author),
    line('Owner', owner),
    line('Roteamento Hermes', author ? `Conversa solicitada com o autor do bloqueio ${author} / responsável ${owner || author}. A ponte envia ao chat atual do Hermes; não há contrato oficial para selecionar sessão ou agente específico.` : 'Autor do bloqueio não declarado; não inferir nem endereçar a pessoa. A ponte envia ao chat atual do Hermes.'),
    line('Causa', blocker.cause),
    line('resolutionAction/HOLD', `${handoff?.status === 'blocked' || handoff?.status === 'awaiting_owner' ? 'HOLD · ' : ''}${resolution?.objective || blocker.resolutionPlan}`),
    line('nextAction', blocker.nextAction || resolution?.nextStep),
    line('Acceptance/evidence', `${resolution?.acceptanceCriteria || handoff?.acceptanceCriteria || 'não declarado'} · Evidência: ${resolution?.evidenceRequired || blocker.resolutionEvidence || handoff?.evidenceRef || 'não declarada'}`),
    line('Pergunta', `${HERMES_BLOCKER_QUESTION} O autor deve analisar o próprio bloqueio, propor a solução/ações requeridas e encaminhar se depender de terceiro.`),
  ]
  return lines.join('\n').slice(0, MAX_PROMPT_LENGTH)
}

type HermesWindow = { hermes?: { send?: (prompt: string) => unknown } }

export async function sendHermesPrompt(prompt: string): Promise<'sent' | 'fallback'> {
  const hermes = (globalThis as HermesWindow).hermes
  if (typeof hermes?.send === 'function') {
    try {
      await hermes.send(prompt)
      return 'sent'
    } catch {
      // Clipboard fallback below makes bridge failures visible and recoverable.
    }
  }
  try {
    await globalThis.navigator?.clipboard?.writeText(prompt)
  } catch {
    // The caller still reports how to recover when clipboard is unavailable.
  }
  return 'fallback'
}

export function hermesFallbackMessage() {
  return 'Ponte do Hermes indisponível. Contexto copiado quando possível; copie o contexto e abra o chat atual do Hermes.'
}
