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
export class SupabaseFluxRepository implements FluxStateRepository {
  constructor(private readonly url: string, private readonly serviceRoleKey: string, private readonly key = process.env.FLUX_STATE_KEY || 'default') {}
  private endpoint() { return `${this.url.replace(/\/$/, '')}/rest/v1/flux_state` }
  private headers(extra: Record<string, string> = {}) { return { apikey: this.serviceRoleKey, Authorization: `Bearer ${this.serviceRoleKey}`, 'content-type': 'application/json', ...extra } }
  async load() { const response = await fetch(`${this.endpoint()}?state_key=eq.${encodeURIComponent(this.key)}&select=state`, { headers: this.headers(), cache: 'no-store' }); if (!response.ok) throw new FluxError('PERSISTENCE_READ_FAILED', `External persistence read failed (${response.status})`, 503); const rows = await response.json() as Array<{ state: FluxState }>; return rows[0]?.state || null }
  async save(state: FluxState) { const response = await fetch(this.endpoint(), { method: 'POST', headers: this.headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ state_key: this.key, state, updated_at: new Date().toISOString() }) }); if (!response.ok) throw new FluxError('PERSISTENCE_WRITE_FAILED', `External persistence write failed (${response.status})`, 503) }
}
export function configuredRepository(file?: string): FluxStateRepository {
  if (file) return new JsonFluxRepository(path.resolve(file))
  const mode = process.env.FLUX_PERSISTENCE || (process.env.NODE_ENV === 'production' ? 'supabase' : 'json')
  const localFixture = process.env.FLUX_LOCAL_MODE === '1'
  if (mode === 'json' && process.env.NODE_ENV === 'production' && !localFixture) throw new FluxError('JSON_PRODUCTION_DISABLED', 'JSON persistence is fixture/local only; configure Supabase persistence in production', 503)
  if (mode === 'json') return new JsonFluxRepository(path.resolve(process.env.FLUX_DATA_FILE || path.join(process.cwd(), 'data', 'flux-state.json')))
  if (mode !== 'supabase') throw new FluxError('PERSISTENCE_MODE_INVALID', `Unsupported FLUX_PERSISTENCE mode: ${mode}`, 500)
  const url = process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new FluxError('PERSISTENCE_NOT_CONFIGURED', 'Supabase persistence requires FLUX_SUPABASE_URL and FLUX_SUPABASE_SERVICE_ROLE_KEY in runtime', 503)
  return new SupabaseFluxRepository(url, key)
}
