import { describe, expect, it } from 'vitest'
import { selectHandoffs } from '../src/lib/handoff-ui'
import type { Handoff } from '../src/lib/flux-repository'

const handoff = (id: string): Handoff => ({ id, cardId: 'AF-001', project: 'After Forty', from: 'A', to: 'B', summary: `summary ${id}`, done: '', risks: '', nextStep: '', acceptanceCriteria: '', evidenceRef: '', createdAt: '' })

describe('operational handoff presentation', () => {
  it('shows at most six cards and keeps the rest expandable', () => {
    const result = selectHandoffs(Array.from({ length: 9 }, (_, index) => handoff(`h-${index + 1}`)))
    expect(result.visible).toHaveLength(6)
    expect(result.overflow).toHaveLength(3)
    expect(result.total).toBe(9)
  })

  it('filters handoffs before applying the six-card limit', () => {
    const result = selectHandoffs([handoff('alpha'), handoff('beta'), handoff('alpha-2')], 'alpha')
    expect(result.visible.map((item) => item.id)).toEqual(['alpha', 'alpha-2'])
    expect(result.total).toBe(2)
  })
})
