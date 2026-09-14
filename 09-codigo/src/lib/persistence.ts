import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { FluxError, type FluxState } from './flux-repository'

export interface FluxStateRepository { load(): Promise<FluxState | null>; save(state: FluxState): Promise<void> }
export class FakeFluxRepository implements FluxStateRepository {
  private state: FluxState | null
  constructor(initial: FluxState | null = null) { this.state = initial }
  async load() { return this.state ? structuredClone(this.state) : null }
  async save(state: FluxState) { this.state = structuredClone(state) }
}
export class JsonFluxRepository implements FluxStateRepository {
  constructor(private readonly file: string) {}
  async load() { try { return JSON.parse(await readFile(this.file, 'utf8')) as FluxState } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error } }
  async save(state: FluxState) { await mkdir(path.dirname(this.file), { recursive: true }); const tmp = `${this.file}.${process.pid}.tmp`; await writeFile(tmp, `${JSON.stringify(state, null, 2)}\n`, 'utf8'); await rename(tmp, this.file) }
}
export function validateSupabaseUrl(value: string): string {
  let parsed: URL
  try { parsed = new URL(value) } catch { throw new FluxError('PERSISTENCE_URL_INVALID', 'Supabase URL must be an absolute HTTPS URL', 503) }
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))) throw new FluxError('PERSISTENCE_URL_INVALID', 'Supabase URL must use HTTPS', 503)
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new FluxError('PERSISTENCE_URL_INVALID', 'Supabase URL must contain only the project origin', 503)
  return parsed.origin
}

export function sanitizedSupabaseEndpoint(url: string): string { return `${new URL(validateSupabaseUrl(url)).host}/rest/v1/flux_state` }

function persistenceDiagnostic(operation: 'read' | 'write', status: number): FluxError {
  const prefix = operation === 'read' ? 'External persistence read' : 'External persistence write'
  if (status === 401) return new FluxError(`PERSISTENCE_UNAUTHORIZED`, `${prefix} unauthorized (401); verify the runtime service role key belongs to the same Supabase project`, 401)
  if (status === 403) return new FluxError(`PERSISTENCE_FORBIDDEN`, `${prefix} forbidden (403); verify database permissions and the service role runtime secret`, 403)
  if (status === 404) return new FluxError(`PERSISTENCE_NOT_FOUND`, `${prefix} target not found (404); verify migration 011 and the flux_state REST table`, 404)
  if (status >= 500) return new FluxError(`PERSISTENCE_UPSTREAM_UNAVAILABLE`, `${prefix} upstream unavailable (${status}); retry after checking Supabase service health`, 503)
  return new FluxError(`PERSISTENCE_HTTP_ERROR`, `${prefix} rejected by upstream (${status}); inspect the status and runtime configuration`, 503)
}

export class SupabaseFluxRepository implements FluxStateRepository {
  private readonly baseUrl: string
  constructor(url: string, private readonly serviceRoleKey: string, private readonly key = process.env.FLUX_STATE_KEY || 'default') { this.baseUrl = validateSupabaseUrl(url) }
  private endpoint() { return `${this.baseUrl}/rest/v1/flux_state` }
  private headers(extra: Record<string, string> = {}) { return { apikey: this.serviceRoleKey, Authorization: `Bearer ${this.serviceRoleKey}`, 'content-type': 'application/json', ...extra } }
  async load() { const response = await fetch(`${this.endpoint()}?state_key=eq.${encodeURIComponent(this.key)}&select=state`, { headers: this.headers(), cache: 'no-store' }); if (!response.ok) throw persistenceDiagnostic('read', response.status); const rows = await response.json() as Array<{ state: FluxState }>; return rows[0]?.state || null }
  async save(state: FluxState) { const response = await fetch(`${this.endpoint()}?on_conflict=state_key`, { method: 'POST', headers: this.headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ state_key: this.key, state, updated_at: new Date().toISOString() }) }); if (!response.ok) throw persistenceDiagnostic('write', response.status) }
}
export function configuredRepository(file?: string): FluxStateRepository {
  if (file) return new JsonFluxRepository(path.resolve(file))
  const mode = process.env.FLUX_PERSISTENCE || (process.env.NODE_ENV === 'production' ? 'supabase' : 'json')
  const localFixture = process.env.FLUX_LOCAL_MODE === '1'
  if (mode === 'json' && process.env.NODE_ENV === 'production' && !localFixture) throw new FluxError('JSON_PRODUCTION_DISABLED', 'JSON persistence is fixture/local only; configure Supabase persistence in production', 503)
  if (mode === 'json') return new JsonFluxRepository(path.resolve(process.env.FLUX_DATA_FILE || path.join(process.cwd(), 'data', 'flux-state.json')))
  if (mode !== 'supabase') throw new FluxError('PERSISTENCE_MODE_INVALID', `Unsupported FLUX_PERSISTENCE mode: ${mode}`, 500)
  const url = process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new FluxError('PERSISTENCE_NOT_CONFIGURED', 'Supabase persistence requires FLUX_SUPABASE_URL (or SUPABASE_URL) and FLUX_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) in runtime', 503)
  return new SupabaseFluxRepository(validateSupabaseUrl(url), key)
}
