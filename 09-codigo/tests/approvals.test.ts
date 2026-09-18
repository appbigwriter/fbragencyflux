import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { approveApproval, getApprovals, getSnapshot } from '../src/lib/flux-repository'

const dirs: string[] = []
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

async function fileWith(overrides: Record<string, unknown> = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'flux-approvals-')); dirs.push(dir)
  const file = join(dir, 'state.json')
  const state = JSON.parse(await readFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json'), 'utf8'))
  state.approvals = [{ ...state.approvals[0], ...overrides }]
  await writeFile(file, JSON.stringify(state))
  return file
}
const sergio = { actor: 'Sergio', scope: 'local' as const }

describe('Central de Aprovações', () => {
  it.each([
    ['approved', undefined],
    ['rejected', 'Fonte insuficiente'],
    ['revision_requested', 'Adicionar evidências'],
  ] as const)('records %s and reads it back locally', async (decision, reason) => {
    const file = await fileWith({ packageVersion: 3, projectId: 'after-forty', persona: 'Heidi Braun', blog: 'afterforty.fbr.news', type: 'editorial_copy' })
    const result = await approveApproval('approval-af-intake-local', decision, sergio, file, { packageVersion: 3, reason })
    expect(result.approval.status).toBe(decision)
    expect(result.approval.decidedBy).toBe('Sergio')
    expect(result.approval.decisionReason).toBe(reason)
    expect((await getSnapshot(file)).approvals.items[0].status).toBe(decision)
  })

  it('requires a reason for rejection and revision', async () => {
    const file = await fileWith()
    await expect(approveApproval('approval-af-intake-local', 'rejected', sergio, file)).rejects.toMatchObject({ code: 'REASON_REQUIRED' })
    await expect(approveApproval('approval-af-intake-local', 'revision_requested', sergio, file, { reason: ' ' })).rejects.toMatchObject({ code: 'REASON_REQUIRED' })
  })

  it('does not trust a spoofed actor', async () => {
    const file = await fileWith()
    await expect(approveApproval('approval-af-intake-local', 'approved', { actor: 'Íris', scope: 'local' }, file)).rejects.toMatchObject({ code: 'SERGIO_REQUIRED' })
  })

  it('rejects stale approval packages before deciding', async () => {
    const file = await fileWith({ packageVersion: 2 })
    await expect(approveApproval('approval-af-intake-local', 'approved', sergio, file, { packageVersion: 1 })).rejects.toMatchObject({ code: 'STALE_APPROVAL_PACKAGE' })
    expect((await getSnapshot(file)).approvals.items[0].status).toBe('pending')
  })

  it('rejects duplicate decisions', async () => {
    const file = await fileWith()
    await approveApproval('approval-af-intake-local', 'approved', sergio, file, { packageVersion: 1 })
    await expect(approveApproval('approval-af-intake-local', 'rejected', sergio, file, { packageVersion: 1, reason: 'No longer valid' })).rejects.toMatchObject({ code: 'APPROVAL_ALREADY_DECIDED' })
  })

  it('denies a tenant-crossing decision and indexes approval metadata', async () => {
    const file = await fileWith({ tenantId: 'tenant-a', projectId: 'after-forty', persona: 'Heidi Braun', blog: 'afterforty.fbr.news', type: 'editorial_copy' })
    await expect(approveApproval('approval-af-intake-local', 'approved', { ...sergio, tenantId: 'tenant-b' }, file, { packageVersion: 1 })).rejects.toMatchObject({ code: 'TENANT_MISMATCH' })
    const indexed = await getApprovals({ projectId: 'after-forty', persona: 'Heidi Braun', blog: 'afterforty.fbr.news', type: 'editorial_copy', status: 'pending' }, file)
    expect(indexed).toHaveLength(1)
    expect(indexed[0].packageVersion).toBe(1)
  })
})
