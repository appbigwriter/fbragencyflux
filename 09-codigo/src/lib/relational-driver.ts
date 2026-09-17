import { createRequire } from 'node:module'
import { FluxError } from './flux-repository'
import { SqlRelationalTransport, type RelationalChange, type RelationalRead, type RelationalTransport } from './relational-repository'

/**
 * Runtime relational drivers for RelationalFluxRepository.
 *
 * Resolution order (resolveRelationalConfig):
 * 1. FLUX_DATABASE_URL          -> direct PostgreSQL wire protocol (node-postgres Pool)
 * 2. FLUX_SUPABASE_URL/SUPABASE_URL + FLUX_SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY
 *                               -> PostgREST RPC transport (flux_relational_read/commit)
 * 3. DATABASE_URL               -> direct PostgreSQL wire protocol
 *
 * JSONB is only an RPC transport; it is never a persisted column (ADR-PERSISTENCIA-100-BANCO).
 */
const requireModule = createRequire(import.meta.url)

export type RelationalDatabaseConfig =
  | { kind: 'postgres'; url: string }
  | { kind: 'postgrest'; origin: string; serviceRoleKey: string }

const clean = (value: string | undefined): string | undefined => (value?.trim() ? value!.trim() : undefined)

function httpsOrigin(value: string, label: string): string {
  let parsed: URL
  try { parsed = new URL(value) } catch { throw new FluxError('PERSISTENCE_URL_INVALID', `${label} must be an absolute HTTP(S) URL`, 503) }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new FluxError('PERSISTENCE_URL_INVALID', `${label} must use HTTP(S)`, 503)
  return `${parsed.protocol}//${parsed.host}`
}

/** Resolve the relational runtime configuration; null when nothing is configured. */
export function resolveRelationalConfig(env: NodeJS.ProcessEnv = process.env): RelationalDatabaseConfig | null {
  const direct = clean(env.FLUX_DATABASE_URL)
  if (direct) {
    if (!/^postgres(ql)?:\/\//.test(direct)) throw new FluxError('PERSISTENCE_URL_INVALID', 'FLUX_DATABASE_URL must use the postgres:// scheme', 503)
    return { kind: 'postgres', url: direct }
  }
  const supabaseUrl = clean(env.FLUX_SUPABASE_URL) || clean(env.SUPABASE_URL)
  const serviceRoleKey = clean(env.FLUX_SUPABASE_SERVICE_ROLE_KEY) || clean(env.SUPABASE_SERVICE_ROLE_KEY)
  if (supabaseUrl && serviceRoleKey) return { kind: 'postgrest', origin: httpsOrigin(supabaseUrl, 'SUPABASE_URL'), serviceRoleKey }
  const fallback = clean(env.DATABASE_URL)
  if (fallback) {
    if (!/^postgres(ql)?:\/\//.test(fallback)) throw new FluxError('PERSISTENCE_URL_INVALID', 'DATABASE_URL must use the postgres:// scheme', 503)
    return { kind: 'postgres', url: fallback }
  }
  return null
}

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

const pgPools = new Map<string, InstanceType<typeof import('pg').Pool>>()
function poolSsl(url: string): boolean | { rejectUnauthorized: boolean } | undefined {
  if (/sslmode=disable/i.test(url)) return false
  try { if (['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname)) return false } catch { /* let pg report the malformed URL */ }
  return { rejectUnauthorized: false }
}
/** Direct PostgreSQL transport over node-postgres; one cached pool per connection string. */
export function postgresTransport(url: string): RelationalTransport {
  let pool = pgPools.get(url)
  if (!pool) {
    const { Pool } = requireModule('pg') as typeof import('pg')
    pool = new Pool({ connectionString: url, max: Number(process.env.FLUX_DATABASE_POOL_MAX || 5), ssl: poolSsl(url) })
    pgPools.set(url, pool)
  }
  return new SqlRelationalTransport(pool)
}

/** Build the transport for a resolved configuration. */
export function createRelationalTransport(config: RelationalDatabaseConfig): RelationalTransport {
  return config.kind === 'postgres' ? postgresTransport(config.url) : new SupabaseRestTransport(config.origin, config.serviceRoleKey)
}

/** Test/teardown helper: close every cached pool so the process can exit cleanly. */
export async function closeRelationalPools(): Promise<void> {
  await Promise.all([...pgPools.values()].map((pool) => pool.end()))
  pgPools.clear()
}
