import { FluxError } from './flux-repository'

export type FluxReadScope = {
  tenantId: string
  projectId: string
  visibility: 'private' | 'public'
}

const PUBLIC_SCOPE_ENV = 'FLUX_PUBLIC_READ_SCOPE'

export function readScopeFromRequest(request: Request): FluxReadScope {
  const url = new URL(request.url)
  const tenantId = request.headers.get('x-flux-tenant-id')?.trim() || url.searchParams.get('tenantId')?.trim() || ''
  const projectId = request.headers.get('x-flux-project-id')?.trim() || url.searchParams.get('projectId')?.trim() || ''
  const visibility = (url.searchParams.get('scope') || request.headers.get('x-flux-read-scope') || 'private') as FluxReadScope['visibility']
  if (!tenantId || !projectId) throw new FluxError('READ_SCOPE_REQUIRED', 'tenantId and projectId are required for Flux reads', 400)
  if (visibility !== 'private' && visibility !== 'public') throw new FluxError('READ_SCOPE_INVALID', 'Read scope must be private or public', 400)
  if (visibility === 'public' && process.env[PUBLIC_SCOPE_ENV] !== `${tenantId}/${projectId}`) {
    throw new FluxError('PUBLIC_SCOPE_UNDEFINED', 'Public reading is not defined for this tenant/project', 403)
  }
  return { tenantId, projectId, visibility }
}

export function publicReadScope(): string | undefined {
  return process.env[PUBLIC_SCOPE_ENV]
}
