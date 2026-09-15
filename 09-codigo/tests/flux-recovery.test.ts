import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createBackup, restoreBackup, snapshotDigest } from '../src/lib/backup'
import { createReceipt, sanitizeError } from '../src/lib/observability'
import { JsonFluxRepository } from '../src/lib/persistence'
import type { FluxState } from '../src/lib/flux-repository'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const dirs: string[] = []
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

describe('local recovery and observability', () => {
  it('backs up and restores a local snapshot without changing the source', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-backup-')); dirs.push(dir)
    const source = join(dir, 'state.json'); const backup = join(dir, 'backup.json'); const restored = join(dir, 'restored.json')
    await writeFile(source, JSON.stringify({ version: 1, projects: [{ id: 'a' }], events: [] }))
    const created = await createBackup(source, backup)
    await restoreBackup(backup, restored)
    expect(created.digest).toBe(await snapshotDigest(restored))
    expect(JSON.parse(await readFile(source, 'utf8')).projects[0].id).toBe('a')
  })
  it('serializes concurrent read-modify-write updates without lost updates', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-lock-')); dirs.push(dir)
    const file = join(dir, 'state.json'); const repository = new JsonFluxRepository(file)
    await writeFile(file, JSON.stringify({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], counter: 0 }))
    await Promise.all(Array.from({ length: 20 }, () => repository.update(async (state) => { await new Promise((resolve) => setTimeout(resolve, 1)); (state as FluxState & { counter: number }).counter += 1 })))
    expect((await repository.load() as FluxState & { counter: number }).counter).toBe(20)
  })

  it('rolls back a failed local mutation and removes transient lock state', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-rollback-')); dirs.push(dir)
    const file = join(dir, 'state.json'); const repository = new JsonFluxRepository(file)
    await writeFile(file, JSON.stringify({ version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], marker: 'before' }))
    await expect(repository.update((state) => { (state as FluxState & { marker: string }).marker = 'partial'; throw new Error('fail after partial mutation') })).rejects.toThrow('fail after partial mutation')
    expect((await repository.load() as FluxState & { marker: string }).marker).toBe('before')
    await expect(readFile(`${file}.lock`, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('fails the local smoke script closed when no runtime secret is supplied', async () => {
    const run = promisify(execFile)
    await expect(run('bash', ['scripts/smoke-e2e-local.sh'], { cwd: process.cwd(), env: { ...process.env, FLUX_SMOKE_SECRET: '' } })).rejects.toMatchObject({ code: 1 })
  })

  it('creates sanitized receipts and never returns secret-like values', () => {
    const receipt = createReceipt({ correlationId: 'corr-1', operation: 'dispatch', status: 'completed', actor: 'Kora', jobId: 'job-1', metadata: { token: 'secret-value', note: 'ok' } })
    expect(receipt.correlationId).toBe('corr-1'); expect(receipt.metadata).toEqual({ token: '[REDACTED]', note: 'ok' })
    expect(sanitizeError(new Error('authorization Bearer abc123'))).not.toContain('abc123')
  })
})