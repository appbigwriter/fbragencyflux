import { randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { FluxError } from './flux-repository'

export type Role = 'gatekeeper' | 'operator' | 'coordinator'
export type SessionActor = { actor: string; scope: 'local' | 'published'; roles: Role[] }

type Session = SessionActor & { expiresAt: number }
const sessions = new Map<string, Session>()
const SESSION_COOKIE = 'flux_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

function getLocalConfig(key: 'FLUX_LOCAL_LOGIN_ACTOR' | 'FLUX_LOCAL_LOGIN_SECRET'): string | undefined {
  if (process.env[key]) return process.env[key]
  const paths = [
    join(process.cwd(), '.env.local'),
    join(process.cwd(), '.env'),
    join(process.cwd(), '09-codigo', '.env.local'),
    join(process.cwd(), '09-codigo', '.env'),
  ]
  for (const p of paths) {
    try {
      if (existsSync(p)) {
        const text = readFileSync(p, 'utf8')
        const m = text.match(new RegExp(`^${key}=(.*)$`, 'm'))
        if (m) {
          const val = m[1].trim().replace(/^["']|["']$/g, '')
          process.env[key] = val
          return val
        }
      }
    } catch {}
  }
  return undefined
}

const rolesFor = (actor: string): Role[] => actor === 'Sergio' ? ['gatekeeper', 'operator', 'coordinator'] : actor === 'Íris' ? ['operator', 'coordinator'] : ['operator']
function configuredSecret(scope: 'local' | 'published') {
  const secret = scope === 'local' ? (getLocalConfig('FLUX_LOCAL_LOGIN_SECRET') || process.env.FLUX_LOCAL_LOGIN_SECRET) : process.env.FLUX_AUTH_SECRET
  if (!secret) throw new FluxError('AUTH_NOT_CONFIGURED', 'Authentication credential is not configured in runtime', 503)
  return secret
}
function sameSecret(a: string, b: string) { const left = Buffer.from(a); const right = Buffer.from(b); return left.length === right.length && timingSafeEqual(left, right) }
function cookieValue(request: Request) { return request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1) }
export function cookieHeader(id: string, scope: 'local' | 'published') { return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}${scope === 'published' ? '; Secure' : ''}` }
export function clearCookie() { return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0` }
export function authenticate(actor: string, secret: string): { sessionId: string; actor: SessionActor } {
  const local = process.env.FLUX_LOCAL_MODE === '1' || process.env.NODE_ENV !== 'production'
  const scope = local ? 'local' : 'published'
  if (local) {
    const expectedActor = getLocalConfig('FLUX_LOCAL_LOGIN_ACTOR') || process.env.FLUX_LOCAL_LOGIN_ACTOR
    if (!expectedActor || actor !== expectedActor) throw new FluxError('INVALID_CREDENTIALS', 'Invalid local-only credentials', 401)
  } else if (!process.env.FLUX_AUTH_ACTOR || actor !== process.env.FLUX_AUTH_ACTOR) throw new FluxError('INVALID_CREDENTIALS', 'Invalid credentials', 401)
  if (scope === 'published' && !process.env.FLUX_SESSION_SECRET) throw new FluxError('AUTH_NOT_CONFIGURED', 'Session secret is not configured in runtime', 503)
  if (!sameSecret(secret, configuredSecret(scope))) throw new FluxError('INVALID_CREDENTIALS', 'Invalid credentials', 401)
  const sessionId = randomBytes(32).toString('base64url')
  const identity: SessionActor = { actor, scope, roles: rolesFor(actor) }
  sessions.set(sessionId, { ...identity, expiresAt: Date.now() + SESSION_TTL_MS })
  return { sessionId, actor: identity }
}
export function getSession(request: Request): SessionActor {
  const id = cookieValue(request); const session = id ? sessions.get(id) : undefined
  if (!session || session.expiresAt <= Date.now()) throw new FluxError('AUTHENTICATION_REQUIRED', 'Authentication required', 401)
  return { actor: session.actor, scope: session.scope, roles: session.roles }
}
export function requireRole(request: Request, role: Role) { const session = getSession(request); if (!session.roles.includes(role)) throw new FluxError('FORBIDDEN', `Role ${role} required`, 403); return session }
export function logout(request: Request) { const id = cookieValue(request); if (id) sessions.delete(id) }
export function isLocalAuthEnabled() {
  const actor = getLocalConfig('FLUX_LOCAL_LOGIN_ACTOR') || process.env.FLUX_LOCAL_LOGIN_ACTOR
  const secret = getLocalConfig('FLUX_LOCAL_LOGIN_SECRET') || process.env.FLUX_LOCAL_LOGIN_SECRET
  return (process.env.FLUX_LOCAL_MODE === '1' || process.env.NODE_ENV !== 'production') && Boolean(actor && secret)
}
export const authCookieName = SESSION_COOKIE

