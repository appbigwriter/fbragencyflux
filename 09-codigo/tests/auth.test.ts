import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getSnapshot, validNextStatuses } from '../src/lib/flux-repository'
import { POST as login } from '../src/app/api/auth/login/route'
import { POST as gateDecision } from '../src/app/api/flux/gates/[id]/decision/route'
import { POST as cardTransition } from '../src/app/api/flux/cards/[id]/route'

const originalEnv = { ...process.env }
const tempDirs: string[] = []
afterEach(async () => { process.env = { ...originalEnv }; await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })) ) })

function request(body: unknown, cookie?: string) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: cookie ? { 'content-type': 'application/json', cookie } : { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('real Flux authentication', () => {
  it('fails closed for an unauthenticated gate decision even when body spoofs Sergio', async () => {
    const response = await gateDecision(new Request('http://localhost/api/flux/gates/FLUX-GATE-01/decision', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ decision: 'approved', actor: 'Sergio', scope: 'local' }),
    }), { params: Promise.resolve({ id: 'FLUX-GATE-01' }) })
    expect(response.status).toBe(401)
  })

  it('creates a local-only authenticated session from an env credential', async () => {
    Object.assign(process.env, { NODE_ENV: 'development' })
    process.env.FLUX_LOCAL_LOGIN_ACTOR = 'Sergio'
    process.env.FLUX_LOCAL_LOGIN_SECRET = 'test-only-secret'
    const response = await login(request({ actor: 'Sergio', secret: 'test-only-secret' }))
    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toContain('HttpOnly')
    expect(response.headers.get('set-cookie')).toContain('flux_session=')
  })

  it('does not let an authenticated operator spoof Sergio in the request body', async () => {
    Object.assign(process.env, { NODE_ENV: 'development' })
    process.env.FLUX_LOCAL_LOGIN_ACTOR = 'Íris'
    process.env.FLUX_LOCAL_LOGIN_SECRET = 'test-only-secret'
    const loggedIn = await login(request({ actor: 'Íris', secret: 'test-only-secret' }))
    const cookie = loggedIn.headers.get('set-cookie')?.split(';')[0]
    const response = await gateDecision(new Request('http://localhost/api/flux/gates/FLUX-GATE-01/decision', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: cookie || '' },
      body: JSON.stringify({ decision: 'approved', actor: 'Sergio', scope: 'local' }),
    }), { params: Promise.resolve({ id: 'FLUX-GATE-01' }) })
    expect(response.status).toBe(403)
  })

  it('authorizes an authenticated owner for a card transition without trusting actor body', async () => {
    Object.assign(process.env, { NODE_ENV: 'development' })
    const dir = await mkdtemp(join(tmpdir(), 'flux-auth-test-')); tempDirs.push(dir); process.env.FLUX_DATA_FILE = join(dir, 'flux-state.json')
    await writeFile(process.env.FLUX_DATA_FILE, await readFile(join(process.cwd(), 'data', 'flux-state.json')))
    const current = (await getSnapshot(process.env.FLUX_DATA_FILE)).cards.find((card) => card.id === 'AF-001')!
    const next = validNextStatuses(current.status)[0]
    process.env.FLUX_LOCAL_LOGIN_ACTOR = 'Íris'
    process.env.FLUX_LOCAL_LOGIN_SECRET = 'test-only-secret'
    const loggedIn = await login(request({ actor: 'Íris', secret: 'test-only-secret' }))
    const cookie = loggedIn.headers.get('set-cookie')?.split(';')[0]
    const response = await cardTransition(new Request('http://localhost/api/flux/cards/AF-001', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: cookie || '' },
      body: JSON.stringify({ status: next, actor: 'Sergio', scope: 'local' }),
    }), { params: Promise.resolve({ id: 'AF-001' }) })
    expect(response.status).toBe(200)
  })
})
