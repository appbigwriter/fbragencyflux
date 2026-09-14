import { afterEach, describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'
import { DELETE as logout, GET as session } from '../src/app/api/auth/session/route'
import { POST as login } from '../src/app/api/auth/login/route'

const originalEnv = { ...process.env }
afterEach(() => { process.env = { ...originalEnv } })

function loginRequest(body: unknown) {
  return new Request('http://localhost/api/auth/login', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  })
}

describe('visible authentication control contract', () => {
  it('exposes compact login fields and no default credential', async () => {
    const source = await readFile('src/app/auth-control.tsx', 'utf8')
    expect(source).toContain('Não autenticado')
    expect(source).toContain('name="actor"')
    expect(source).toContain('name="credential"')
    expect(source).toContain('Entrar')
    expect(source).toContain('/api/auth/login')
    expect(source).not.toMatch(/(default|test-only-secret|FLUX_LOCAL_LOGIN_SECRET).*(secret|credential)/i)
  })

  it('reads the authenticated session and clears it through logout', async () => {
    Object.assign(process.env, { NODE_ENV: 'development', FLUX_LOCAL_LOGIN_ACTOR: 'Sergio', FLUX_LOCAL_LOGIN_SECRET: 'test-only-secret' })
    const loggedIn = await login(loginRequest({ actor: 'Sergio', secret: 'test-only-secret' }))
    const cookie = loggedIn.headers.get('set-cookie')!.split(';')[0]
    const authenticated = await session(new Request('http://localhost/api/auth/session', { headers: { cookie } }))
    expect(authenticated.status).toBe(200)
    expect(await authenticated.json()).toEqual({ actor: 'Sergio', scope: 'local', roles: ['gatekeeper', 'operator', 'coordinator'] })
    const loggedOut = await logout(new Request('http://localhost/api/auth/session', { method: 'DELETE', headers: { cookie } }))
    expect(loggedOut.status).toBe(200)
    const afterLogout = await session(new Request('http://localhost/api/auth/session', { headers: { cookie } }))
    expect(afterLogout.status).toBe(401)
  })

  it('renders a clear read-only warning and gates management actions on session', async () => {
    const [handoffs, jobs] = await Promise.all([
      readFile('src/app/handoffs/handoffs-client.tsx', 'utf8'),
      readFile('src/app/jobs/jobs-client.tsx', 'utf8'),
    ])
    expect(handoffs).toContain('Leitura permitida; gestão bloqueada sem sessão')
    expect(jobs).toContain('Leitura permitida; gestão bloqueada sem sessão')
    expect(handoffs).toContain('disabled={!session ||')
    expect(jobs).toContain('disabled={!session ||')
  })
})
