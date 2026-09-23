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

export const rolesFor = (actor: string): Role[] => {
  const norm = actor.toLowerCase()
  if (norm === 'sergio' || norm.includes('sergio') || norm.includes('admin')) {
    return ['gatekeeper', 'operator', 'coordinator']
  }
  if (norm === 'íris' || norm === 'iris') {
    return ['operator', 'coordinator']
  }
  return ['operator']
}

function normalizeActor(actor: string, expected: string): string | null {
  if (actor === expected) return expected
  if (actor.trim().toLowerCase() === expected.trim().toLowerCase()) return expected
  return null
}

function configuredSecret(scope: 'local' | 'published'): string | undefined {
  if (scope === 'local') {
    return getLocalConfig('FLUX_LOCAL_LOGIN_SECRET') || process.env.FLUX_LOCAL_LOGIN_SECRET || 'Super1404'
  }
  return process.env.FLUX_AUTH_SECRET
}

function sameSecret(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

function cookieValue(request: Request) {
  return request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1)
}

export function cookieHeader(id: string, scope: 'local' | 'published') {
  return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_MS / 1000}${scope === 'published' ? '; Secure' : ''}`
}

export function clearCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`
}

async function trySupabaseAuth(identifier: string, secret: string): Promise<string | null> {
  const supabaseUrl = process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL
  const apiKey = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !apiKey || apiKey.includes('<secret-manager')) return null

  try {
    const origin = supabaseUrl.replace(/\/+$/, '')
    console.log(`[AUTH SUPABASE] Tentando autenticação no Supabase Auth (${origin})...`)
    const res = await fetch(`${origin}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({ email: identifier, password: secret }),
    })

    if (res.ok) {
      const data = await res.json()
      const user = data.user
      const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || identifier
      console.log(`[AUTH SUPABASE SUCESSO] Usuário autenticado: ${displayName} (${user?.email})`)
      return displayName
    } else {
      const err = await res.json().catch(() => ({}))
      console.warn(`[AUTH SUPABASE REJEITADO] Resposta do Supabase:`, err)
    }
  } catch (err) {
    console.warn('[AUTH SUPABASE ERRO] Falha ao consultar Supabase:', err)
  }
  return null
}

export async function authenticate(rawActor: string, rawSecret: string): Promise<{ sessionId: string; actor: SessionActor }> {
  const actor = String(rawActor || '').trim()
  const secret = String(rawSecret || '')

  const local = process.env.FLUX_LOCAL_MODE === '1' || process.env.NODE_ENV !== 'production'
  const scope = local ? 'local' : 'published'

  console.log(`[AUTH DEBUG] Recebida tentativa de login | actor="${actor}" | modo=${scope}`)

  // 1. Tenta autenticação via Supabase Auth se for email ou se configurado
  if (actor.includes('@')) {
    const supabaseUser = await trySupabaseAuth(actor, secret)
    if (supabaseUser) {
      const sessionId = randomBytes(32).toString('base64url')
      const identity: SessionActor = { actor: supabaseUser, scope, roles: rolesFor(supabaseUser) }
      sessions.set(sessionId, { ...identity, expiresAt: Date.now() + SESSION_TTL_MS })
      return { sessionId, actor: identity }
    }
  }

  // 2. Modo Local (Dev)
  if (local) {
    const rawExpected = getLocalConfig('FLUX_LOCAL_LOGIN_ACTOR') || process.env.FLUX_LOCAL_LOGIN_ACTOR
    // Se não tiver esperado configurado, default é Sergio
    const expectedActor = rawExpected || 'Sergio'
    const expectedSecret = configuredSecret('local') || 'Super1404'

    const matchedActor = normalizeActor(actor, expectedActor)
    if (!matchedActor) {
      console.error(`[AUTH DEBUG REJEITADO] Ator informado "${actor}" não confere com o esperado "${expectedActor}".`)
      throw new FluxError('INVALID_CREDENTIALS', `Invalid local-only credentials (recebido: "${actor}", esperado: "${expectedActor}")`, 401)
    }

    if (!sameSecret(secret, expectedSecret)) {
      console.error(`[AUTH DEBUG REJEITADO] Senha incorreta para o ator "${actor}".`)
      throw new FluxError('INVALID_CREDENTIALS', 'Invalid credentials', 401)
    }

    const sessionId = randomBytes(32).toString('base64url')
    const identity: SessionActor = { actor: matchedActor, scope, roles: rolesFor(matchedActor) }
    sessions.set(sessionId, { ...identity, expiresAt: Date.now() + SESSION_TTL_MS })
    console.log(`[AUTH DEBUG SUCESSO] Usuário "${matchedActor}" autenticado com papéis: ${identity.roles.join(', ')}`)
    return { sessionId, actor: identity }
  }

  // 3. Modo Publicado (VPS / Produção)
  const expectedAuthActor = process.env.FLUX_AUTH_ACTOR
  if (!expectedAuthActor || normalizeActor(actor, expectedAuthActor) === null) {
    // Tenta também Supabase Auth como fallback para produção
    const supabaseUser = await trySupabaseAuth(actor, secret)
    if (supabaseUser) {
      const sessionId = randomBytes(32).toString('base64url')
      const identity: SessionActor = { actor: supabaseUser, scope, roles: rolesFor(supabaseUser) }
      sessions.set(sessionId, { ...identity, expiresAt: Date.now() + SESSION_TTL_MS })
      return { sessionId, actor: identity }
    }

    console.error(`[AUTH DEBUG REJEITADO PROD] Ator "${actor}" não autorizado ou FLUX_AUTH_ACTOR não configurado.`)
    throw new FluxError('INVALID_CREDENTIALS', 'Invalid credentials', 401)
  }

  if (!process.env.FLUX_SESSION_SECRET) {
    console.error('[AUTH DEBUG ERRO PROD] FLUX_SESSION_SECRET não configurado em runtime.')
    throw new FluxError('AUTH_NOT_CONFIGURED', 'Session secret is not configured in runtime', 503)
  }

  const expectedSecret = configuredSecret('published')
  if (!expectedSecret || !sameSecret(secret, expectedSecret)) {
    console.error(`[AUTH DEBUG REJEITADO PROD] Senha incorreta para "${actor}".`)
    throw new FluxError('INVALID_CREDENTIALS', 'Invalid credentials', 401)
  }

  const canonicalActor = normalizeActor(actor, expectedAuthActor) || actor
  const sessionId = randomBytes(32).toString('base64url')
  const identity: SessionActor = { actor: canonicalActor, scope, roles: rolesFor(canonicalActor) }
  sessions.set(sessionId, { ...identity, expiresAt: Date.now() + SESSION_TTL_MS })
  console.log(`[AUTH DEBUG SUCESSO PROD] Usuário "${canonicalActor}" autenticado com papéis: ${identity.roles.join(', ')}`)
  return { sessionId, actor: identity }
}

export function getSession(request: Request): SessionActor {
  const id = cookieValue(request)
  const session = id ? sessions.get(id) : undefined
  if (!session || session.expiresAt <= Date.now()) throw new FluxError('AUTHENTICATION_REQUIRED', 'Authentication required', 401)
  return { actor: session.actor, scope: session.scope, roles: session.roles }
}

export function requireRole(request: Request, role: Role) {
  const session = getSession(request)
  if (!session.roles.includes(role)) throw new FluxError('FORBIDDEN', `Role ${role} required`, 403)
  return session
}

export function logout(request: Request) {
  const id = cookieValue(request)
  if (id) sessions.delete(id)
}

export function isLocalAuthEnabled() {
  const actor = getLocalConfig('FLUX_LOCAL_LOGIN_ACTOR') || process.env.FLUX_LOCAL_LOGIN_ACTOR || 'Sergio'
  const secret = getLocalConfig('FLUX_LOCAL_LOGIN_SECRET') || process.env.FLUX_LOCAL_LOGIN_SECRET || 'Super1404'
  return (process.env.FLUX_LOCAL_MODE === '1' || process.env.NODE_ENV !== 'production') && Boolean(actor && secret)
}

export const authCookieName = SESSION_COOKIE
