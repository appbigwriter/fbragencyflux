import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getDashboardSnapshot } from '../src/lib/dashboard'

const tempDirs: string[] = []
afterEach(async () => { await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })
async function testFile() { const dir = await mkdtemp(join(tmpdir(), 'flux-dashboard-test-')); tempDirs.push(dir); const file = join(dir, 'flux-state.json'); await writeFile(file, await readFile(join(process.cwd(), 'data', 'flux-state.json')), 'utf8'); return file }

describe('getDashboardSnapshot', () => {
  it('returns operational counts from persisted state', async () => {
    const snapshot = await getDashboardSnapshot(await testFile())
    expect(snapshot.projects).toHaveLength(2)
    expect(snapshot.approvals.pending).toBe(1)
    expect(snapshot.activeCards).toBe(2)
    expect(snapshot.blockers).toHaveLength(0)
    expect(snapshot.recentEvents.length).toBeGreaterThan(0)
  })

  it('keeps approval, card and artifact details tied to After Forty', async () => {
    const snapshot = await getDashboardSnapshot(await testFile())
    expect(snapshot.cards.find((item) => item.id === 'AF-001')?.project).toBe('After Forty')
    expect(snapshot.approvals.items[0].cardId).toBe('AF-001')
    expect(snapshot.artifacts.every((item) => item.cardId === 'AF-001')).toBe(true)
  })
})
