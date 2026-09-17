import { createRequire } from 'node:module'
import { FluxError, type FluxState } from './flux-repository'
import { RelationalFluxRepository, SqlRelationalTransport, type RelationalChange, type RelationalRead, type RelationalTransport } from './relational-repository'
export type StateMutation<T = void> = (state: FluxState) => T | Promise<T>
export interface FluxStateRepository { load(): Promise<FluxState | null>; save(state: FluxState): Promise<void>; update<T>(mutation: StateMutation<T>): Promise<T> }
/** Explicit test double. Never selected from runtime configuration. */
export class FakeFluxRepository implements FluxStateRepository {
  private state: FluxState | null
  private queue: Promise<unknown> = Promise.resolve()
  constructor(initial: FluxState | null = null) { this.state = initial }
  async load() { return this.state ? structuredClone(this.state) : null }
  async save(state: FluxState) { this.state = structuredClone(state) }
  async update<T>(mutation: StateMutation<T>) { const run = this.queue.then(async () => { if (!this.state) throw new Error('State not initialized'); const next = structuredClone(this.state); const result = await mutation(next); this.state = next; return result }); this.queue = run.then(() => undefined, () => undefined); return run }
}
export { RelationalFluxRepository }

/** Supabase/PostgREST transport: calls the flux_relational_read/commit RPCs granted to service_role. */
export class SupabaseRestTransport implements RelationalTransport {
  constructor(private readonly origin: string, private readonly serviceRoleKey: string) {}
  private headers(): Record<string, string> { return { apikey: this.serviceRoleKey, authorization: `Bearer ${this.serviceRoleKey}`, 'content-type': 'application/json' } }
  private async rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
    let response: Response
    try { response = await fetch(`${this.origin}/rest/v1/rpc/${name}`, { method: 'POST', headers: this.headers(), body: args ? JSON.stringify(args) : undefined, cache: 'no-store' }) }
    catch { throw new FluxError('PERSISTENCE_UNAVAILABLE', 'Relational persistence endpoint is unreachable; verify the runtime project URL and connectivity', 503) }
    const text = await response.text()
    if (!response.ok) {
      let detail = ''
      try { const parsed = JSON.parse(text) as { code?: string; message?: string }; detail = parsed.code === 'PGRST116' ? '' : `${parsed.code || ''} ${parsed.message || ''}`.trim() } catch { /* non-JSON body */ }
      if (response.status === 409 || detail.includes('PERSISTENCE_CONFLICT')) throw new FluxError('PERSISTENCE_CONFLICT', 'Relational state changed concurrently; reload and retry', 409)
      throw new FluxError('PERSISTENCE_UNAVAILABLE', `Relational persistence rejected the operation (HTTP ${response.status}${detail ? `: ${detail}` : ''}); verify the migration and the runtime service role secret`, 503)
    }
    return (text ? JSON.parse(text) : null) as T
  }
  async read(): Promise<RelationalRead> { return this.rpc<RelationalRead>('flux_relational_read') }
  async commit(version: number, changes: RelationalChange[], waitingReasons?: string[]): Promise<RelationalRead> { return this.rpc<RelationalRead>('flux_relational_commit', { expected_version: version, changes, waiting_reasons: waitingReasons ?? null }) }
}

const requireModule = createRequire(import.meta.url)
const pools = new Map<string, SqlRelationalTransport>()
/** Direct PostgreSQL transport over node-postgres; one pool per connection string. */
function postgresTransport(url: string): RelationalTransport {
  let transport = pools.get(url)
  if (!transport) {
    const { Pool } = requireModule('pg') as typeof import('pg')
    transport = new SqlRelationalTransport(new Pool({ connectionString: url, max: Number(process.env.FLUX_DATABASE_POOL_MAX || 5), ssl: /(?:sslmode=require|ssl=true)/i.test(url) ? { rejectUnauthorized: false } : undefined }))
    pools.set(url, transport)
  }
  return transport
}
function supabaseOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null
  try { const url = new URL(value.trim()); if (url.protocol !== 'https:' && url.protocol !== 'http:') return null; return `${url.protocol}//${url.host}` } catch { return null }
}

let overrideRepository: FluxStateRepository | null = null
/** Test-only injection point. Never consulted by runtime configuration. */
export function setRepositoryOverride(repository: FluxStateRepository | null): void { overrideRepository = repository }

export function configuredRepository(file?: string): FluxStateRepository {
  if (file) throw new FluxError('FILESYSTEM_DISABLED', 'Filesystem operational persistence is disabled', 503)
  if (overrideRepository) return overrideRepository
  const direct = process.env.FLUX_DATABASE_URL
  if (direct) return new RelationalFluxRepository(postgresTransport(direct))
  const origin = supabaseOrigin(process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL)
  const serviceRoleKey = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (origin && serviceRoleKey) return new RelationalFluxRepository(new SupabaseRestTransport(origin, serviceRoleKey))
  if (process.env.DATABASE_URL) return new RelationalFluxRepository(postgresTransport(process.env.DATABASE_URL))
  throw new FluxError('PERSISTENCE_NOT_CONFIGURED', 'Relational persistence requires FLUX_SUPABASE_URL + FLUX_SUPABASE_SERVICE_ROLE_KEY (or FLUX_DATABASE_URL / DATABASE_URL) in runtime configuration', 503)
}
