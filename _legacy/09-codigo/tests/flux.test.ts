import { afterEach, describe, expect, it } from 'vitest'
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { approveApproval, classifyFilesystemRun, getSnapshot, transitionCard, validNextStatuses } from '../src/lib/flux-repository'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

async function testFile() {
  const dir = await mkdtemp(join(tmpdir(), 'flux-test-'))
  tempDirs.push(dir)
  const file = join(dir, 'flux-state.json')
  await copyFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json'), file)
  return file
}

describe('Flux persisted repository', () => {
  it('classifies file-derived text without a structured open blocker as review, not blocked', () => {
    const run = classifyFilesystemRun('review pending Gate; no operational blocker declared', 'history.md')
    expect(run.status).toBe('review')
    expect(run.activeBlocker).toBe(false)
    expect(run.historical).toBe(true)
    expect(run.sourceType).toBe('filesystem')
    expect(run.blockers).toEqual([])
  })

  it('keeps a structured open blocker active and exposes its cause', () => {
    const run = classifyFilesystemRun('status: open\nblocker: owner waiting for evidence\nowner: Gabe\nnextAction: review\nresolutionPlan: compare source', 'history.md')
    expect(run.status).toBe('blocked')
    expect(run.activeBlocker).toBe(true)
    expect(run.blockers[0]).toContain('owner waiting for evidence')
  })

  it('seeds AF-001 and persists the snapshot outside src', async () => {
    const file = await testFile()
    const snapshot = await getSnapshot(file)
    expect(snapshot.cards.some((card) => card.id === 'AF-001')).toBe(true)
    expect(snapshot.projects.some((project) => project.name === 'After Forty')).toBe(true)
    expect(snapshot.handoffs.length).toBeGreaterThan(0)
    expect(snapshot.artifacts).toHaveLength(0)
    expect(JSON.parse(await readFile(file, 'utf8')).cards).toHaveLength(snapshot.cards.length)
  })

  it('allows a valid transition and records an event', async () => {
    const file = await testFile()
    const current = (await getSnapshot(file)).cards.find((card) => card.id === 'AF-001')!
    const next = validNextStatuses(current.status)[0]
    const result = await transitionCard('AF-001', next, { actor: 'Íris', scope: 'local' }, file)
    expect(result.card.status).toBe(next)
    expect(result.event.action).toContain(next)
    expect((await getSnapshot(file)).recentEvents.at(-1)?.cardId).toBe('AF-001')
  })

  it('rejects an invalid transition fail-closed', async () => {
    const file = await testFile()
    await expect(transitionCard('AF-001', 'completed', { actor: 'Íris', scope: 'local' }, file)).rejects.toMatchObject({ code: 'INVALID_TRANSITION' })
  })

  it('rejects approval decisions from actors other than Sergio', async () => {
    const file = await testFile()
    await expect(approveApproval('approval-af-001', 'approved', { actor: 'Íris', scope: 'local' }, file)).rejects.toMatchObject({ code: 'SERGIO_REQUIRED' })
  })

  it('records Sergio approval with a timestamp and supports readback', async () => {
    const file = await testFile()
    const result = await approveApproval('approval-af-intake-local', 'approved', { actor: 'Sergio', scope: 'local' }, file)
    expect(result.approval.status).toBe('approved')
    expect(result.approval.decidedAt).toMatch(/T/)
    const snapshot = await getSnapshot(file)
    expect(snapshot.approvals.items.find((item) => item.id === 'approval-af-intake-local')?.status).toBe('approved')
    expect(snapshot.recentEvents[0]?.actor).toBe('Sergio')
  })
})
