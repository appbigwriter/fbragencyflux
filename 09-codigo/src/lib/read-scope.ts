import { FluxError } from './flux-repository'

export type FluxReadScopePair = { tenantId: string; projectId: string }
export type FluxReadScope = { scopes: FluxReadScopePair[]; visibility: 'private' | 'public' }

const PUBLIC_SCOPE_ENV = 'FLUX_PUBLIC_READ_SCOPE'
const PAIR = /^([^/\s,]+)\/([^/\s,]+)$/

/** Parse a complete allowlist. Invalid input never produces a partial scope. */
export function parseReadScopeAllowlist(value: string | undefined | null): FluxReadScopePair[] | null {
  if (value == null || !value.trim()) return null
  const seen = new Set<string>()
  const result: FluxReadScopePair[] = []
  for (const raw of value.split(',')) {
    const item = raw.trim()
    const match = PAIR.exec(item)
    if (!match) return null
    const tenantId = match[1].trim()
    const projectId = match[2].trim()
    if (!tenantId || !projectId || tenantId.includes('*') || projectId.includes('*')) return null
    const key = `${tenantId}/${projectId}`
    if (seen.has(key)) return null
    seen.add(key)
    result.push({ tenantId, projectId })
  }
  return result.length ? result : null
}

export function publicReadScope(): FluxReadScopePair[] | null {
  return parseReadScopeAllowlist(process.env[PUBLIC_SCOPE_ENV])
}

export function readScopeFromRequest(request: Request): FluxReadScope {
  const url = new URL(request.url)
  const visibility = (url.searchParams.get('scope') || request.headers.get('x-flux-visibility') || 'private') as FluxReadScope['visibility']
  if (visibility !== 'private' && visibility !== 'public') throw new FluxError('READ_SCOPE_INVALID', 'Read scope must be private or public', 400)

  const explicitRaw = request.headers.get('x-flux-read-scope') ?? url.searchParams.get('readScope')
  const explicit = explicitRaw?.trim()
  let scopes = explicit ? parseReadScopeAllowlist(explicit) : null
  if (explicitRaw !== null && !scopes) throw new FluxError('READ_SCOPE_INVALID', 'Read scope must contain unique tenantId/projectId pairs', 400)
  if (explicitRaw === null) {
    const tenantId = request.headers.get('x-flux-tenant-id')?.trim() || url.searchParams.get('tenantId')?.trim() || ''
    const projectId = request.headers.get('x-flux-project-id')?.trim() || url.searchParams.get('projectId')?.trim() || ''
    if (tenantId && projectId) scopes = [{ tenantId, projectId }]
  }
  if (!scopes) throw new FluxError('READ_SCOPE_REQUIRED', 'An explicit tenantId/projectId read scope is required', 400)
  if (visibility === 'public') {
    const allowed = publicReadScope()
    if (!allowed || scopes.some((scope) => !allowed.some((item) => item.tenantId === scope.tenantId && item.projectId === scope.projectId))) {
      throw new FluxError('PUBLIC_SCOPE_UNDEFINED', 'Public reading is not defined for this tenant/project scope', 403)
    }
  }
  return { scopes, visibility }
}
