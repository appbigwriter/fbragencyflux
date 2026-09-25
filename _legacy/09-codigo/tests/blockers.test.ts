import { afterEach, describe, expect, it } from 'vitest'
import { getSnapshot, normalizeBlocker, validateBlocker } from '../src/lib/flux-repository'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dirs: string[] = []
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

async function stateFile(handoffs: unknown[]) {
  const dir = await mkdtemp(join(tmpdir(), 'flux-blockers-'))
  dirs.push(dir)
  const file = join(dir, 'state.json')
  await writeFile(file, JSON.stringify({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs, artifacts: [] }))
  return file
}

describe('blocker modeling', () => {
  it('does not promote a risk to an active blocker', async () => {
    const snapshot = await getSnapshot(await stateFile([{ id: 'h-risk', cardId: 'AF-001', project: 'After Forty', from: 'A', to: 'B', summary: 'x', done: 'x', risks: 'Risk only', nextStep: 'x', acceptanceCriteria: 'x', evidenceRef: 'x' }]))
    expect(snapshot.blockers).toEqual([])
    expect(snapshot.risks).toEqual([{ sourceId: 'h-risk', cause: 'Risk only' }])
  })

  it('requires owner, nextAction and resolutionPlan for an open blocker', () => {
    expect(() => validateBlocker({ id: 'b1', cause: 'Missing evidence', status: 'open' })).toThrow(/owner.*nextAction.*resolutionPlan/i)
  })

  it('classifies a historical blocker without explicit status as legacy/unverified', () => {
    expect(normalizeBlocker({ id: 'b1', cause: 'Old pending item' })).toMatchObject({ status: 'legacy', verification: 'unverified', resolution: 'not_declared' })
  })

  it('exposes the declared executable action on the blocker model', () => {
    expect(normalizeBlocker({ id: 'b1', cause: 'Missing evidence', status: 'open', owner: 'Gabe', nextAction: 'Attach report', resolutionPlan: 'Report is attached and read back', resolutionEvidence: 'report.md' })).toMatchObject({ resolutionPlan: 'Report is attached and read back', resolutionEvidence: 'report.md', resolutionAction: { to: 'Gabe', nextStep: 'Attach report' } })
  })

  it('rejects passive retention as an open blocker resolution plan', () => {
    expect(() => validateBlocker({ id: 'b2', cause: 'Missing product', status: 'open', owner: 'Gestor Editorial', nextAction: 'wait', resolutionPlan: 'Manter pendente; não executar' })).toThrow(/executável|executable/i)
  })

  it('requires all After Forty blockers to expose executable forwarding actions', async () => {
    const fixture = await import('../data/after-forty-intake.fixture.json')
    const blockers = [...(fixture.default.blockers || []), ...fixture.default.handoffs.flatMap((handoff) => handoff.blockers || [])]
    expect(blockers).toHaveLength(4)
    for (const blocker of blockers) expect(blocker.resolutionAction).toMatchObject({ from: expect.any(String), to: expect.any(String), objective: expect.any(String), deliverable: expect.any(String), acceptanceCriteria: expect.any(String), evidenceRequired: expect.any(String), nextStep: expect.any(String) })
    expect(blockers.find((blocker) => blocker.id === 'blocker-afterforty-product-scope')?.resolutionAction?.to).toBe('Gestor Editorial')
    expect(blockers.find((blocker) => blocker.id === 'blocker-afterforty-product-scope')?.resolutionAction?.objective).toContain('Rick/Amazon Research')
  })
})
