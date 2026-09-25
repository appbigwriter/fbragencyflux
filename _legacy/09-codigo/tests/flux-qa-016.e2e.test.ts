import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { runFluxQa016 } from '../src/lib/flux-qa-016-harness'

const dirs: string[] = []
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))) })

describe('FLUX-QA-016 local auditable E2E', () => {
  it('runs Authority → Flux → Blogs → Control Tower and blocks publication before Gate', async () => {
    const dir = await mkdtemp(join(process.cwd(), 'flux-qa-016-'))
    dirs.push(dir)
    const result = await runFluxQa016({ stateFile: join(dir, 'state.json') })

    expect(result.steps).toEqual([
      'base_input', 'persona_package', 'approval', 'event_inbox', 'job',
      'simulated_provisioning', 'readback', 'publication_blocked', 'gate_approved', 'publication_simulated',
    ])
    expect(result.publicationBeforeGate).toMatchObject({ status: 'blocked', code: 'PUBLICATION_GATE_REQUIRED' })
    expect(result.provisioning).toMatchObject({ status: 'simulated', externalActionAuthorized: false })
    expect(result.readback.persisted).toBe(true)
    expect(result.publicationAfterGate).toMatchObject({ status: 'simulated', externalActionAuthorized: false })
    expect(result.audit.evidence.length).toBeGreaterThanOrEqual(8)
  })
})
