import type { Handoff } from './flux-repository'

export function selectHandoffs(handoffs: Handoff[], query = '', limit = 6) {
  const normalized = query.trim().toLowerCase()
  const filtered = normalized
    ? handoffs.filter((handoff) => `${handoff.id} ${handoff.cardId} ${handoff.project} ${handoff.from} ${handoff.to} ${handoff.summary}`.toLowerCase().includes(normalized))
    : handoffs
  return { visible: filtered.slice(0, limit), overflow: filtered.slice(limit), total: filtered.length }
}
