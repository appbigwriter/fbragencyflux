import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { decideGate, getGates, getSnapshot } from '../src/lib/flux-repository'
import { GET } from '../src/app/api/flux/gates/route'
import { POST } from '../src/app/api/flux/gates/[id]/decision/route'

const tempDirs: string[] = []
const originalEnv = { ...process.env }
afterEach(async () => { process.env = { ...originalEnv }; await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })
async function testFile() { const dir = await mkdtemp(join(tmpdir(), 'flux-gates-test-')); tempDirs.push(dir); const file = join(dir, 'flux-state.json'); const seed = JSON.parse(await readFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json'), 'utf8')); seed.gates = (seed.gates || []).map((gate: { status: string; decidedAt?: string; decidedBy?: string }) => ({ ...gate, status: 'pending', decidedAt: undefined, decidedBy: undefined })); await writeFile(file, JSON.stringify(seed), 'utf8'); return file }

describe('FBR Agency Flux gates', () => {
  it('seeds exactly four pending gates with the complete local decision model', async () => {
    const file = await testFile(); const gates = await getGates(file)
    expect(gates).toHaveLength(4); expect(gates.every((gate) => gate.project === 'FBR Agency Flux' && gate.status === 'pending')).toBe(true)
    expect(gates.every((gate) => gate.externalActionAuthorized === false && gate.requestedAt && gate.evidence.length > 0)).toBe(true)
    expect(JSON.parse(await readFile(file, 'utf8')).gates).toHaveLength(4)
  })
  it('rejects a non-Sergio actor and a non-local scope', async () => {
    const file = await testFile()
    await expect(decideGate('FLUX-GATE-01', 'approved', { actor: 'Íris', scope: 'local' }, file)).rejects.toMatchObject({ code: 'SERGIO_REQUIRED' })
    await expect(decideGate('FLUX-GATE-01', 'approved', { actor: 'Sergio', scope: 'remote' as 'local' }, file)).rejects.toMatchObject({ code: 'LOCAL_SCOPE_REQUIRED' })
  })
  it('records a valid local decision without authorizing external action', async () => {
    const file = await testFile(); const result = await decideGate('FLUX-GATE-02', 'approved', { actor: 'Sergio', scope: 'local' }, file)
    expect(result.gate.status).toBe('approved'); expect(result.gate.decidedBy).toBe('Sergio'); expect(result.gate.decidedAt).toMatch(/T/); expect(result.gate.externalActionAuthorized).toBe(false)
    expect(result.event.action).toContain('NO EXTERNAL EFFECT')
  })
  it('rejects duplicate decisions and reads the decision back after reload', async () => {
    const file = await testFile(); await decideGate('FLUX-GATE-03', 'changes_requested', { actor: 'Sergio', scope: 'local' }, file)
    await expect(decideGate('FLUX-GATE-03', 'rejected', { actor: 'Sergio', scope: 'local' }, file)).rejects.toMatchObject({ code: 'GATE_ALREADY_DECIDED' })
    expect((await getSnapshot(file)).gates.find((gate) => gate.id === 'FLUX-GATE-03')?.status).toBe('changes_requested')
  })
  it('exposes the HTTP contract and rejects an invalid actor', async () => {
    process.env.FLUX_DATA_FILE = await testFile()
    const response = await GET(); const body = await response.json() as { gates: unknown[] }
    expect(response.status).toBe(200); expect(body.gates).toHaveLength(4)
    const denied = await POST(new Request('http://localhost/api/flux/gates/FLUX-GATE-01/decision', { method: 'POST', body: JSON.stringify({ decision: 'approved', actor: 'Íris', scope: 'local' }) }), { params: Promise.resolve({ id: 'FLUX-GATE-01' }) })
    expect(denied.status).toBe(401)
  })
})
