import { describe, expect, it } from 'vitest'
import { getDashboardSnapshot } from '../src/lib/dashboard'

describe('getDashboardSnapshot', () => {
  it('returns the operational counts used by the dashboard', () => {
    const snapshot = getDashboardSnapshot()

    expect(snapshot.projects).toHaveLength(3)
    expect(snapshot.approvals.pending).toBe(2)
    expect(snapshot.activeCards).toBe(4)
    expect(snapshot.blockers).toHaveLength(2)
    expect(snapshot.recentEvents).toHaveLength(5)
  })

  it('keeps approval and blocker details tied to their cards', () => {
    const snapshot = getDashboardSnapshot()

    expect(snapshot.approvals.items.map((item) => item.cardId)).toEqual(['card-003', 'card-005'])
    expect(snapshot.blockers.map((item) => item.id)).toEqual(['card-004', 'card-006'])
  })
})
