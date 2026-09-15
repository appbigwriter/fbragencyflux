import { mkdir, open, readFile, rename, unlink, stat, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { FluxError, type FluxState } from './flux-repository'

export type StateMutation<T = void> = (state: FluxState) => T | Promise<T>
export interface FluxStateRepository { load(): Promise<FluxState | null>; save(state: FluxState): Promise<void>; update<T>(mutation: StateMutation<T>): Promise<T> }
export class FakeFluxRepository implements FluxStateRepository {
  private state: FluxState | null
  private queue: Promise<unknown> = Promise.resolve()
  constructor(initial: FluxState | null = null) { this.state = initial }
  async load() { return this.state ? structuredClone(this.state) : null }
  async save(state: FluxState) { this.state = structuredClone(state) }
  async update<T>(mutation: StateMutation<T>) { const run = this.queue.then(async () => { if (!this.state) throw new Error('State not initialized'); return mutation(this.state) }); this.queue = run.then(() => undefined, () => undefined); return run }
}
const LOCK_RETRIES = 80
const RETRY_DELAY_MS = 20
const LEASE_MS = 1500
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const retryable = (error: unknown) => ['EACCES', 'EPERM', 'EBUSY', 'ENOTEMPTY'].includes((error as NodeJS.ErrnoException)?.code || '')
type LockRecord = { token: string; owner: string; heartbeat: number }

export class JsonFluxRepository implements FluxStateRepository {
  constructor(private readonly file: string) {}
  async load() { try { return JSON.parse(await readFile(this.file, 'utf8')) as FluxState } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null; throw error } }
  private async acquireLock() {
    await mkdir(path.dirname(this.file), { recursive: true }); const lock = `${this.file}.lock`; const token = randomUUID(); const owner = `${process.pid}:${randomUUID()}`
    for (let attempt = 0; attempt < LOCK_RETRIES; attempt += 1) {
      try {
        const handle = await open(lock, 'wx'); await handle.writeFile(JSON.stringify({ token, owner, heartbeat: Date.now() } satisfies LockRecord)); await handle.close()
        let stopped = false
        const heartbeat = setInterval(async () => { if (stopped) return; try { const current = JSON.parse(await readFile(lock, 'utf8')) as LockRecord; if (current.token === token && current.owner === owner) await writeFile(lock, JSON.stringify({ ...current, heartbeat: Date.now() })) } catch { /* owner will fail closed on release */ } }, Math.max(250, Math.floor(LEASE_MS / 3)))
        heartbeat.unref?.()
        return async () => { stopped = true; clearInterval(heartbeat); try { const current = JSON.parse(await readFile(lock, 'utf8')) as LockRecord; if (current.token === token && current.owner === owner) await unlink(lock) } catch { /* another owner or already released */ } }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
          try { const current = JSON.parse(await readFile(lock, 'utf8')) as LockRecord; if (!current.token || !current.owner || Date.now() - current.heartbeat > LEASE_MS * 2) await unlink(lock) } catch { /* another writer owns or removes it */ }
        } else if (!retryable(error)) throw error
        await sleep(RETRY_DELAY_MS * (attempt + 1))
      }
    }
    throw new FluxError('LOCAL_STATE_BUSY', 'Local Flux state is busy; retry the operation', 503)
  }
  private async saveUnlocked(state: FluxState) { const tmp = `${this.file}.${process.pid}.${randomUUID()}.tmp`; try { await writeFile(tmp, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' }); for (let attempt = 0; ; attempt += 1) { try { await rename(tmp, this.file); return } catch (error) { if (!retryable(error) || attempt >= LOCK_RETRIES - 1) throw error; await sleep(RETRY_DELAY_MS * (attempt + 1)) } } } finally { await unlink(tmp).catch(() => undefined) } }
  async save(state: FluxState) { const release = await this.acquireLock(); try { await this.saveUnlocked(state) } finally { await release() } }
  async update<T>(mutation: StateMutation<T>) { const release = await this.acquireLock(); try { const state = await this.load(); if (!state) throw new Error('State not initialized'); const result = await mutation(state); await this.saveUnlocked(state); return result } finally { await release() } }
}
export function validateSupabaseUrl(value: string): string { let parsed: URL; try { parsed = new URL(value) } catch { throw new FluxError('PERSISTENCE_URL_INVALID', 'Supabase URL must be an absolute HTTPS URL', 503) }; if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))) throw new FluxError('PERSISTENCE_URL_INVALID', 'Supabase URL must use HTTPS', 503); if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') throw new FluxError('PERSISTENCE_URL_INVALID', 'Supabase URL must contain only the project origin', 503); return parsed.origin }
export function sanitizedSupabaseEndpoint(url: string): string { return `${new URL(validateSupabaseUrl(url)).host}/rest/v1/flux_state` }
function persistenceDiagnostic(operation: 'read' | 'write', status: number): FluxError { const prefix = operation === 'read' ? 'External persistence read' : 'External persistence write'; if (status === 401) return new FluxError('PERSISTENCE_UNAUTHORIZED', `${prefix} unauthorized (401); verify the runtime service role key belongs to the same Supabase project`, 401); if (status === 403) return new FluxError('PERSISTENCE_FORBIDDEN', `${prefix} forbidden (403); verify database permissions and the service role runtime secret`, 403); if (status === 404) return new FluxError('PERSISTENCE_NOT_FOUND', `${prefix} target not found (404); verify migration 011 and the flux_state REST table`, 404); if (status === 409) return new FluxError('PERSISTENCE_CONFLICT', `${prefix} conflict (409); state changed concurrently, reload and retry`, 409); if (status >= 500) return new FluxError('PERSISTENCE_UPSTREAM_UNAVAILABLE', `${prefix} upstream unavailable (${status}); retry after checking Supabase service health`, 503); return new FluxError('PERSISTENCE_HTTP_ERROR', `${prefix} rejected by upstream (${status}); inspect status and runtime configuration`, 503) }
export class SupabaseFluxRepository implements FluxStateRepository {
  private readonly baseUrl: string
  constructor(url: string, private readonly serviceRoleKey: string, private readonly key = process.env.FLUX_STATE_KEY || 'default') { this.baseUrl = validateSupabaseUrl(url) }
  private endpoint() { return `${this.baseUrl}/rest/v1/flux_state` }
  private headers(extra: Record<string, string> = {}) { return { apikey: this.serviceRoleKey, Authorization: `Bearer ${this.serviceRoleKey}`, 'content-type': 'application/json', ...extra } }
  async load() { const response = await fetch(`${this.endpoint()}?state_key=eq.${encodeURIComponent(this.key)}&select=state,version`, { headers: this.headers(), cache: 'no-store' }); if (!response.ok) throw persistenceDiagnostic('read', response.status); const rows = await response.json() as Array<{ state: FluxState; version?: number }>; if (!rows[0]) return null; if (!Number.isInteger(rows[0].version) || rows[0].version !== rows[0].state.version) throw new FluxError('PERSISTENCE_VERSION_REQUIRED', 'Supabase state must expose an integer version matching state.version; refusing unsafe snapshot writes', 503); return rows[0].state }
  async save(state: FluxState) { if (!Number.isInteger(state.version)) throw new FluxError('PERSISTENCE_VERSION_REQUIRED', 'Supabase writes require an integer state version', 422); const response = await fetch(`${this.endpoint()}?on_conflict=state_key`, { method: 'POST', headers: this.headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify({ state_key: this.key, state, version: state.version, updated_at: new Date().toISOString() }) }); if (!response.ok) throw persistenceDiagnostic('write', response.status) }
  async update<T>(mutation: StateMutation<T>) { const state = await this.load(); if (!state) throw new Error('State not initialized'); const expected = state.version; const result = await mutation(state); state.version = expected + 1; const response = await fetch(`${this.endpoint()}?state_key=eq.${encodeURIComponent(this.key)}&version=eq.${expected}`, { method: 'PATCH', headers: this.headers({ Prefer: 'return=representation' }), body: JSON.stringify({ state, version: state.version, updated_at: new Date().toISOString() }) }); if (!response.ok) throw persistenceDiagnostic('write', response.status); const rows = await response.json().catch(() => []); if (!Array.isArray(rows) || rows.length !== 1) throw new FluxError('PERSISTENCE_CONFLICT', 'Supabase CAS update returned no matching row; refusing to report mutation success', 409); return result }
}
export function configuredRepository(file?: string): FluxStateRepository { if (file) return new JsonFluxRepository(file); const mode = process.env.FLUX_PERSISTENCE || (process.env.NODE_ENV === 'production' ? 'supabase' : 'json'); const localFixture = process.env.FLUX_LOCAL_MODE === '1'; if (mode === 'json' && process.env.NODE_ENV === 'production' && !localFixture) throw new FluxError('JSON_PRODUCTION_DISABLED', 'JSON persistence is fixture/local only; configure Supabase persistence in production', 503); if (mode === 'json') { const testFile = process.env.FLUX_DATA_FILE; if (testFile && process.env.NODE_ENV === 'test') return new JsonFluxRepository(/* turbopackIgnore: true */ testFile); return new JsonFluxRepository(path.join(process.cwd(), 'data', 'flux-state.json')) }; if (mode !== 'supabase') throw new FluxError('PERSISTENCE_MODE_INVALID', `Unsupported FLUX_PERSISTENCE mode: ${mode}`, 500); const url = process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL; const key = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY; if (!url || !key) throw new FluxError('PERSISTENCE_NOT_CONFIGURED', 'Supabase persistence requires runtime URL and service role key', 503); return new SupabaseFluxRepository(validateSupabaseUrl(url), key) }
