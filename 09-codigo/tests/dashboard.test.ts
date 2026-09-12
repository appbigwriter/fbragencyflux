import { describe, expect, it } from 'vitest'
import { getDashboardSnapshot } from '../src/lib/dashboard'

describe('getDashboardSnapshot', () => {
  it('returns operational counts from persisted state', async () => {
    const snapshot = await getDashboardSnapshot()
    expect(snapshot.projects).toHaveLength(2)
    expect(snapshot.approvals.pending).toBe(1)
    expect(snapshot.activeCards).toBe(2)
    expect(snapshot.blockers).toHaveLength(0)
    expect(snapshot.recentEvents.length).toBeGreaterThan(0)
  })

  it('keeps approval, card and artifact details tied to After Forty', async () => {
    const snapshot = await getDashboardSnapshot()
    expect(snapshot.cards.find((item) => item.id === 'AF-001')?.project).toBe('After Forty')
    expect(snapshot.approvals.items[0].cardId).toBe('AF-001')
    expect(snapshot.artifacts.every((item) => item.cardId === 'AF-001')).toBe(true)
  })
})
