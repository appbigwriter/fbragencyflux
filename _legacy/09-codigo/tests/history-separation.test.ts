import { afterEach, describe, expect, it } from 'vitest'
import { copyFile, mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { getSnapshot, importHistory, type FluxState } from '../src/lib/flux-repository'

const dirs: string[] = []
const originalEnv = { ...process.env }
afterEach(async () => { process.env = { ...originalEnv }; await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

async function cleanFile() {
  const dir = await mkdtemp(join(tmpdir(), 'flux-history-separation-')); dirs.push(dir)
  const file = join(dir, 'flux-state.json')
  await copyFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json'), file)
  return file
}

describe('initial state and historical archive separation', () => {
  it('fresh state does not contain historical handoffs or jobs', async () => {
    const file = await cleanFile(); const snapshot = await getSnapshot(file)
    expect(snapshot.handoffs.every((item) => !item.historical)).toBe(true)
    expect(snapshot.jobs?.every((item) => !item.historical)).toBe(true)
    expect(snapshot.handoffs).toHaveLength(2); expect(snapshot.jobs).toHaveLength(4)
  })

  it('imports the archive only through the explicit operation', async () => {
    const file = await cleanFile(); const fresh = await getSnapshot(file)
    const imported = await importHistory(file)
    expect(imported.handoffs.length).toBeGreaterThan(fresh.handoffs.length)
    expect(imported.handoffs.some((item) => item.historical)).toBe(true)
    expect((await getSnapshot(file)).jobs?.some((item) => item.historical)).toBe(true)
  })

  it('repeated reads do not contaminate the immutable fixture', async () => {
    const fixture = JSON.parse(await readFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json'), 'utf8')) as FluxState
    const file = await cleanFile(); await getSnapshot(file); await getSnapshot(file)
    const after = JSON.parse(await readFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json'), 'utf8')) as FluxState
    expect(after).toEqual(fixture)
  })

  it('opt-in environment mode imports history while default local E2E stays clean', async () => {
    const file = await cleanFile(); process.env.FLUX_IMPORT_HISTORY = '1'
    const imported = await getSnapshot(file)
    expect(imported.handoffs.some((item) => item.historical)).toBe(true)
  })

  it('preserves the versioned historical archive after isolated tests', async () => {
    const base = JSON.parse(await readFile(join(process.cwd(), 'data', 'flux-state.json'), 'utf8')) as FluxState
    expect(base.projects).toEqual([])
    expect(base.cards).toEqual([])
    expect(base.approvals).toEqual([])
    expect(base.gates).toEqual([])
    expect(base.events).toEqual([])
    expect(base.handoffs.length).toBeGreaterThan(0)
    expect(base.handoffs.every((item) => item.historical)).toBe(true)
    expect(base.artifacts).toEqual([])
    expect(base.blockers).toEqual([])
    expect(base.jobs!.length).toBeGreaterThan(0)
    expect(base.jobs!.every((item) => item.historical)).toBe(true)
    expect(base.agentRuns!.length).toBe(base.jobs!.length)
  })
})