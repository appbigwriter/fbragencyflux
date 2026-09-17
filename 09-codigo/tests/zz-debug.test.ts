import { describe, it, expect } from 'vitest'
import { copyFile, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('debug', () => {
  it('repro gates GET path', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'fluxdbg-'))
    const file = join(dir, 'flux-state.json')
    await copyFile(join(process.cwd(), 'data', 'after-forty-intake.fixture.json'), file)
    process.env.FLUX_DATA_FILE = file
    try {
      const { GET } = await import('../src/app/api/flux/gates/route')
      const response = await GET()
      console.log('status', response.status, 'body', JSON.stringify(await response.json()).slice(0, 300))
      expect(response.status).toBe(200)
    } finally { delete process.env.FLUX_DATA_FILE; await rm(dir, { recursive: true, force: true }) }
  })
})
