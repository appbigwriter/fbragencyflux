import { FluxError, type FluxState } from './flux-repository'
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
export { RelationalFluxRepository } from './relational-repository'
export function configuredRepository(file?: string): FluxStateRepository {
  if (file) throw new FluxError('FILESYSTEM_DISABLED', 'Filesystem operational persistence is disabled', 503)
  throw new FluxError('PERSISTENCE_NOT_CONFIGURED', 'Relational persistence requires runtime configuration', 503)
}
