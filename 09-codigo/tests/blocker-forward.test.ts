import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { getSnapshot, forwardBlocker, FluxError } from '../src/lib/flux-repository'
import { POST as login } from '../src/app/api/auth/login/route'
import { POST as forward } from '../src/app/api/flux/blockers/[id]/forward/route'

const originalEnv = { ...process.env }
const dirs: string[] = []
afterEach(async () => { process.env = { ...originalEnv }; await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })) ) })

async function fixture(blocker: Record<string, unknown> = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'flux-forward-')); dirs.push(dir)
  const file = join(dir, 'state.json')
  await writeFile(file, JSON.stringify({ version: 1, projects: [{ id: 'p', name: 'P', status: 'active', owner: 'Íris', description: 'p' }], cards: [{ id: 'C-1', title: 'Card', project: 'P', status: 'blocked', assignee: 'Íris', priority: 'normal', detail: 'd', acceptanceCriteria: [], updatedAt: new Date().toISOString() }], approvals: [], gates: [], events: [], handoffs: [{ id: 'h-1', cardId: 'C-1', project: 'P', from: 'A', to: 'B', summary: 'blocked', done: 'n/a', risks: '', nextStep: 'wait', acceptanceCriteria: 'x', evidenceRef: 'x', blockers: [{ id: 'b-1', cause: 'Missing evidence', status: 'open', owner: 'Gabe', nextAction: 'Review report', resolutionPlan: 'Read back report', resolutionEvidence: 'report.md', ...blocker }] }], artifacts: [] }))
  return file
}
function req(body: unknown, cookie = '') { return new Request('http://localhost/api/flux/blockers/b-1/forward', { method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify(body) }) }
async function authCookie(actor = 'Íris') {
  Object.assign(process.env, { NODE_ENV: 'development', FLUX_LOCAL_LOGIN_ACTOR: actor, FLUX_LOCAL_LOGIN_SECRET: 'test-secret' })
  const response = await login(new Request('http://localhost/api/auth/login', { method: 'POST', body: JSON.stringify({ actor, secret: 'test-secret' }), headers: { 'content-type': 'application/json' } }))
  return response.headers.get('set-cookie')?.split(';')[0] || ''
}

describe('blocker forward/unblock', () => {
  it('forwards an open blocker, waits for owner, and readbacks one event', async () => {
    const file = await fixture(); process.env.FLUX_DATA_FILE = file; const cookie = await authCookie()
    const response = await forward(req({ cardId: 'C-1', correlationId: 'corr-1', actor: 'Sergio' }, cookie), { params: Promise.resolve({ id: 'b-1' }) })
    expect(response.status).toBe(200)
    const body = await response.json(); expect(body.event).toMatchObject({ actor: 'Íris', correlationId: 'corr-1', cardId: 'C-1' }); expect(body.handoff).toMatchObject({ from: 'Íris', to: 'Gabe', blockerId: 'b-1' })
    const snapshot = await getSnapshot(file); expect(snapshot.cards.find((c) => c.id === 'C-1')?.status).toBe('awaiting_owner'); expect(snapshot.blockers[0].status).toBe('open'); expect(snapshot.recentEvents.filter((e) => e.correlationId === 'corr-1')).toHaveLength(1)
    const again = await forward(req({ cardId: 'C-1', correlationId: 'corr-1' }, cookie), { params: Promise.resolve({ id: 'b-1' }) }); expect(again.status).toBe(200); expect((await getSnapshot(file)).recentEvents.filter((e) => e.correlationId === 'corr-1')).toHaveLength(1)
  })
  it('rejects missing solution, legacy and resolved blockers', async () => {
    for (const status of ['open', 'legacy', 'resolved'] as const) {
      const file = await fixture(status === 'open' ? { owner: '' } : { status });
      await expect(forwardBlocker('b-1', { cardId: 'C-1', correlationId: `c-${status}` }, { actor: 'Íris', scope: 'local' }, file)).rejects.toMatchObject({ code: status === 'open' ? 'SOLUTION_NOT_DECLARED' : 'BLOCKER_NOT_OPEN' })
    }
  })
  it('requires authentication and never accepts actor spoofing', async () => {
    const file = await fixture(); process.env.FLUX_DATA_FILE = file
    expect((await forward(req({ cardId: 'C-1', correlationId: 'c-unauth' }), { params: Promise.resolve({ id: 'b-1' }) })).status).toBe(401)
    const cookie = await authCookie('Íris'); const response = await forward(req({ cardId: 'C-1', correlationId: 'c-spoof', actor: 'Sergio' }, cookie), { params: Promise.resolve({ id: 'b-1' }) }); expect(response.status).toBe(200); expect((await response.json()).event.actor).toBe('Íris')
  })
})
