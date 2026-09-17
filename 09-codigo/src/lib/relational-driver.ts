import { Pool } from 'pg'
import { FluxError } from './flux-repository'
import type { SqlQuery } from './relational-repository'

/**
 * Runtime database drivers for RelationalFluxRepository.
 *
 * Two supported transports, resolved by resolveRelationalConfig():
 * - FLUX_DATABASE_URL -> direct Postgres wire protocol through pg.Pool
 * - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or FLUX_ prefixed variants)
 *   -> PostgREST RPC transport executing flux_relational_read/commit
 *
 * Both satisfy the SqlQuery interface consumed by SqlRelationalTransport.
 */

export type RelationalDatabaseConfig =
  | { kind: 'postgres'; connectionString: string }
  | { kind: 'postgrest'; baseUrl: string; serviceRoleKey: string }

class DatabaseTransportError extends Error {
  constructor(public code: string, message: string, public status = 503) { super(message) }
}

const clean = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function validateHttpsProjectOrigin(value: string, label: string): URL {
  let parsed: URL
  try { parsed = new URL(value) } catch { throw new FluxError('PERSISTENCE_URL_INVALID', `${label} must be an absolute HTTPS URL`, 503) }
  const local = ['localhost', '127.0.0.1'].includes(parsed.hostname)
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) throw new FluxError('PERSISTENCE_URL_INVALID', `${label} must use HTTPS`, 503)
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new FluxError('PERSISTENCE_URL_INVALID', `${label} must contain only the project origin`, 503)
  return parsed
}

/** Resolve the runtime relational configuration; null when nothing is configured. */
export function resolveRelationalConfig(env: NodeJS.ProcessEnv = process.env): RelationalDatabaseConfig | null {
  const direct = clean(env.FLUX_DATABASE_URL)
  if (direct) {
    try { new URL(direct) } catch { throw new FluxError('PERSISTENCE_URL_INVALID', 'FLUX_DATABASE_URL must be a valid Postgres connection string', 503) }
    if (!/^postgres(ql)?:\/\//.test(direct)) throw new FluxError('PERSISTENCE_URL_INVALID', 'FLUX_DATABASE_URL must use the postgres:// scheme', 503)
    return { kind: 'postgres', connectionString: direct }
  }
  const url = clean(env.FLUX_SUPABASE_URL) || clean(env.SUPABASE_URL)
  const key = clean(env.FLUX_SUPABASE_SERVICE_ROLE_KEY) || clean(env.SUPABASE_SERVICE_ROLE_KEY)
  if (url && key) {
    const origin = validateHttpsProjectOrigin(url, 'SUPABASE_URL').origin
    return { kind: 'postgrest', baseUrl: origin, serviceRoleKey: key }
  }
  return null
}

const isLocalHost = (connectionString: string): boolean => {
  try { return ['localhost', '127.0.0.1', '::1'].includes(new URL(connectionString).hostname) } catch { return false }
}

/** Direct Postgres driver (pg.Pool) for FLUX_DATABASE_URL. */
export class PgPoolSqlQuery implements SqlQuery {
  private readonly pool: Pool
  constructor(connectionString: string) {
    let ssl: boolean | { rejectUnauthorized: boolean } | undefined
    if (/sslmode=/.test(connectionString)) ssl = undefined
    else ssl = isLocalHost(connectionString) ? false : { rejectUnauthorized: false }
    this.pool = new Pool({ connectionString, max: 4, ...(ssl === undefined ? {} : { ssl }) })
  }
  query(sql: string, values?: unknown[]) { return this.pool.query(sql, values as unknown[] | undefined) }
  async end() { await this.pool.end() }
}

const READ_STATEMENT = /^select\s+flux_relational_read\(\)\s+as\s+result\s*;?\s*$/i
const COMMIT_STATEMENT = /^select\s+flux_relational_commit\(\s*\$1\s*,\s*\$2::jsonb\s*,\s*\$3::text\[\]\s*\)\s+as\s+result\s*;?\s*$/i

function restDiagnostic(status: number, operation: string): DatabaseTransportError {
  if (status === 401) return new DatabaseTransportError('PERSISTENCE_UNAUTHORIZED', `${operation} unauthorized (401); verify the runtime service role key belongs to the same Supabase project`, 401)
  if (status === 403) return new DatabaseTransportError('PERSISTENCE_FORBIDDEN', `${operation} forbidden (403); verify database permissions and the service role runtime secret`, 403)
  if (status === 404) return new DatabaseTransportError('PERSISTENCE_NOT_FOUND', `${operation} target not found (404); verify the flux_relational RPC migration is applied`, 404)
  if (status >= 500) return new DatabaseTransportError('PERSISTENCE_UPSTREAM_UNAVAILABLE', `${operation} upstream unavailable (${status}); retry after checking Supabase service health`, 503)
  return new DatabaseTransportError('PERSISTENCE_HTTP_ERROR', `${operation} rejected by upstream (${status}); verify the flux_relational RPC migration and runtime configuration`, 503)
}

/**
 * PostgREST RPC driver for SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Executes exactly the two Flux RPC statements; anything else fails closed
 * instead of silently degrading to another transport.
 */
export class PostgrestRpcSqlQuery implements SqlQuery {
  constructor(private config: { baseUrl: string; serviceRoleKey: string }) {}
  private async rpc(name: string, body: Record<string, unknown>): Promise<unknown> {
    let response: Response
    try {
      response = await fetch(`${this.config.baseUrl}/rest/v1/rpc/${name}`, {
        method: 'POST',
        headers: { apikey: this.config.serviceRoleKey, Authorization: `Bearer ${this.config.serviceRoleKey}`, 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
      })
    } catch (error) {
      if ((error as Error).name === 'TimeoutError') throw new DatabaseTransportError('PERSISTENCE_UPSTREAM_TIMEOUT', `flux_relational RPC ${name} timed out`, 504)
      throw new DatabaseTransportError('PERSISTENCE_NETWORK_ERROR', `flux_relational RPC ${name} failed to reach the database gateway`, 503)
    }
    if (!response.ok) {
      const upstream = await response.json().catch(() => ({}) as { code?: string; message?: string })
      if (upstream.code === '40001') throw new DatabaseTransportError('40001', upstream.message || 'PERSISTENCE_CONFLICT', 409)
      throw restDiagnostic(response.status, `flux_relational RPC ${name}`)
    }
    return response.json()
  }
  async query(sql: string, values?: unknown[]) {
    if (READ_STATEMENT.test(sql)) return { rows: [{ result: await this.rpc('flux_relational_read', {}) }] }
    if (COMMIT_STATEMENT.test(sql)) {
      const [expectedVersion, changes, waitingReasons] = values || []
      const result = await this.rpc('flux_relational_commit', {
        expected_version: expectedVersion,
        changes: typeof changes === 'string' ? JSON.parse(changes) : changes,
        waiting_reasons: waitingReasons ?? null,
      })
      return { rows: [{ result }] }
    }
    throw new FluxError('RELATIONAL_QUERY_UNSUPPORTED', 'The PostgREST transport executes only flux_relational_read() and flux_relational_commit()', 501)
  }
}

/** Build the SqlQuery driver for a resolved configuration. */
export function createRelationalSqlQuery(config: RelationalDatabaseConfig): SqlQuery {
  return config.kind === 'postgres'
    ? new PgPoolSqlQuery(config.connectionString)
    : new PostgrestRpcSqlQuery(config)
}
