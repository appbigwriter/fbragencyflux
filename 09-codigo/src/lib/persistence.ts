import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { FluxError, type FluxState } from './flux-repository'
import { RelationalFluxRepository } from './relational-repository'
import { createRelationalTransport, resolveRelationalConfig } from './relational-driver'

export type StateMutation<T = void> = (state: FluxState) => T | Promise<T>
export interface FluxStateRepository { load(): Promise<FluxState | null>; save(state: FluxState): Promise<void>; update<T>(mutation: StateMutation<T>): Promise<T> }
/** Explicit test double. Never selected from runtime configuration. */
export class FakeFluxRepository implements FluxStateRepository {
  private state: FluxState | null
  private queue: Promise<unknown> = Promise.resolve()
  constructor(initial: FluxState | null = null) { this.state = initial }
  async load() { return this.state ? structuredClone(this.state) : null }
  async save(state: FluxState) { this.state = structuredClone(state) }
  async update<T>(mutation: StateMutation<T>): Promise<T> { const run = this.queue.then(async () => { if (!this.state) throw new Error('State not initialized'); const next = structuredClone(this.state); const result = await mutation(next); this.state = next; return result }); this.queue = run.then(() => undefined, () => undefined); return run }
}
export { RelationalFluxRepository }
export { SupabaseRestTransport, postgresTransport, resolveRelationalConfig, createRelationalTransport, closeRelationalPools } from './relational-driver'

const LOCK_RETRIES = 80
const RETRY_DELAY_MS = 20
const LEASE_MS = 1500
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const retryable = (error: unknown) => ['EACCES', 'EPERM', 'EBUSY', 'ENOTEMPTY'].includes((error as NodeJS.ErrnoException)?.code || '')
type LockRecord = { token: string; owner: string; heartbeat: number }

/** Local JSON file adapter used when a test/local call passes an explicit state file. Never the production runtime path. */
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
  async update<T>(mutation: StateMutation<T>): Promise<T> { const release = await this.acquireLock(); try { const state = await this.load(); if (!state) throw new Error('State not initialized'); const result = await mutation(state); await this.saveUnlocked(state); return result } finally { await release() } }
}

const relationalRepositories = new Map<string, FluxStateRepository>()
/** Relational repository resolved from runtime configuration (FLUX_DATABASE_URL, or SUPABASE_URL + service role). */
export function relationalRepository(env: NodeJS.ProcessEnv = process.env): FluxStateRepository {
  const config = resolveRelationalConfig(env)
  if (!config) throw new FluxError('PERSISTENCE_NOT_CONFIGURED', 'Relational persistence requires FLUX_DATABASE_URL or FLUX_SUPABASE_URL/SUPABASE_URL + service role key', 503)
  const cacheKey = JSON.stringify(config)
  let repository = relationalRepositories.get(cacheKey)
  if (!repository) { repository = new RelationalFluxRepository(createRelationalTransport(config)); relationalRepositories.set(cacheKey, repository) }
  return repository
}

let overrideRepository: FluxStateRepository | null = null
/** Test-only injection point. Never consulted by runtime configuration. */
export function setRepositoryOverride(repository: FluxStateRepository | null): void { overrideRepository = repository }

export function configuredRepository(file?: string): FluxStateRepository {
  // An explicit file is the local JSON fixture path used by tests and the import tooling;
  // the operational runtime is always the relational database.
  if (file) return new JsonFluxRepository(file)
  if (overrideRepository) return overrideRepository
  const mode = process.env.FLUX_PERSISTENCE
  if (mode && !['supabase', 'postgres', 'json'].includes(mode)) throw new FluxError('PERSISTENCE_MODE_INVALID', `Unsupported FLUX_PERSISTENCE mode: ${mode}`, 500)
  if (mode === 'json') {
    // Explicit local QA override; never a silent production fallback.
    if (process.env.NODE_ENV === 'production' && process.env.FLUX_LOCAL_MODE !== '1') throw new FluxError('JSON_PRODUCTION_DISABLED', 'JSON persistence is local/test only; configure relational persistence in production', 503)
    const dataFile = process.env.FLUX_DATA_FILE
    if (dataFile) return new JsonFluxRepository(/* turbopackIgnore: true */ dataFile)
    return new JsonFluxRepository(path.join(process.cwd(), 'data', 'flux-state.json'))
  }
  const config = resolveRelationalConfig()
  if (config) return relationalRepository()
  if (process.env.FLUX_DATA_FILE && process.env.NODE_ENV === 'test') return new JsonFluxRepository(/* turbopackIgnore: true */ process.env.FLUX_DATA_FILE)
  if (process.env.NODE_ENV === 'test' || process.env.FLUX_LOCAL_MODE === '1') return new JsonFluxRepository(path.join(process.cwd(), 'data', 'flux-state.json'))
  throw new FluxError('PERSISTENCE_NOT_CONFIGURED', 'Relational persistence requires FLUX_DATABASE_URL or FLUX_SUPABASE_URL/SUPABASE_URL + service role key in runtime configuration', 503)
}
