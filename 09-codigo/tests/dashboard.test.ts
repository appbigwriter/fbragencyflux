import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getDashboardSnapshot } from '../src/lib/dashboard'

const tempDirs: string[] = []
afterEach(async () => { await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })
async function testFile() { const dir = await mkdtemp(join(tmpdir(), 'flux-dashboard-test-')); tempDirs.push(dir); const file = join(dir, 'flux-state.json'); await writeFile(file, await readFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json')), 'utf8'); return file }

describe('getDashboardSnapshot', () => {
  it('returns operational counts from persisted state', async () => {
    const snapshot = await getDashboardSnapshot(await testFile())
    expect(snapshot.projects).toHaveLength(2)
    expect(snapshot.approvals.pending).toBe(1)
    expect(snapshot.activeCards).toBe(1)
    expect(snapshot.blockers).toHaveLength(4)
    expect(snapshot.recentEvents.length).toBeGreaterThan(0)
  })

  it('separates Flux gates from After Forty project cards and counts each scope independently', async () => {
    const snapshot = await getDashboardSnapshot(await testFile())
    expect(snapshot.gates.map((gate) => gate.id)).toEqual(['FLUX-GATE-01', 'FLUX-GATE-02', 'FLUX-GATE-03', 'FLUX-GATE-04'])
    expect(snapshot.pendingGates).toBe(4)
    expect(snapshot.pendingCards).toBe(1)
    expect(snapshot.blockerCount).toBe(4)
    expect(snapshot.projectCards['after-forty'].map((card) => card.id)).toEqual(['AF-001'])
    expect(snapshot.projectCards['project-flux']).toEqual([])
  })

  it('keeps approval, card and artifact details tied to After Forty', async () => {
    const snapshot = await getDashboardSnapshot(await testFile())
    expect(snapshot.cards.find((item) => item.id === 'AF-001')?.project).toBe('After Forty')
    expect(snapshot.approvals.items[0].cardId).toBe('AF-001')
    expect(snapshot.artifacts).toHaveLength(0)
  })

  it('reads the separated scopes back after reload without closing project cards', async () => {
    const file = await testFile()
    const first = await getDashboardSnapshot(file)
    const second = await getDashboardSnapshot(file)
    expect(second.gates.map((gate) => gate.status)).toEqual(first.gates.map((gate) => gate.status))
    expect(second.cards.find((card) => card.id === 'AF-001')?.status).toBe('ready')
  })
})
