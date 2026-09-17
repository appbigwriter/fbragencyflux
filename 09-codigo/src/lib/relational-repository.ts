import { randomUUID } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { FluxError, type FluxState } from './flux-repository'
import { relationalSpecs, type EntitySpec } from './relational-schema'
import type { FluxStateRepository, StateMutation } from './persistence'

type Row = Record<string, unknown>
export type RelationalRead = { version: number; waitingReasons?: string[] | null } & Record<string, unknown>
export interface SqlQuery { query(sql: string, values?: unknown[]): Promise<{ rows: unknown[] }> }
export interface RelationalTransport { read(): Promise<RelationalRead>; commit(version: number, changes: RelationalChange[], waitingReasons?: string[]): Promise<RelationalRead> }
export type RelationalChange = { table: string; operation: 'upsert'; row: Row }
export class SqlRelationalTransport implements RelationalTransport {
  constructor(private db: SqlQuery) {}
  async read() { const result = await this.db.query('SELECT flux_relational_read() AS result'); return (result.rows[0] as {result: RelationalRead}).result }
  async commit(version: number, changes: RelationalChange[], waitingReasons?: string[]) {
    try { const result = await this.db.query('SELECT flux_relational_commit($1,$2::jsonb,$3::text[]) AS result', [version, JSON.stringify(changes), waitingReasons || null]); return (result.rows[0] as {result: RelationalRead}).result }
    catch (error) { if ((error as {code?: string}).code === '40001') throw new FluxError('PERSISTENCE_CONFLICT','Relational state changed concurrently; reload and retry',409); throw error }
  }
}
const rows = (raw: RelationalRead, table: string): Row[] => (raw[table] || []) as Row[]
function empty(version: number): FluxState { return { version, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], blockers: [], jobs: [], agentRuns: [], sprints: [], stories: [], requiredActions: [], coordinator: {} } }
function external(row: Row): string { return String(row.external_id ?? row.id) }
function get(object: Row, field: string): unknown { return field.split('.').reduce<unknown>((o,k) => (o as Row | undefined)?.[k],object) }
function set(object: Row, field: string, value: unknown) { const parts=field.split('.'); if(parts.length===1) object[field]=value; else { object[parts[0]] ||= {}; (object[parts[0]] as Row)[parts[1]]=value } }
function decodeRow(raw: RelationalRead, spec: EntitySpec, row: Row): Row {
  const entity: Row = { [spec.key]: external(row) }
  for(const [key,f] of Object.entries(spec.fields)) {
    if(key.endsWith('Present')) { if(row[f.column]) entity[key.slice(0,-7)] = {}; continue }
    let value = row[f.column]
    if(value === null || value === undefined) continue
    if(f.ref) { const target=rows(raw,f.ref==='tenants'?'flux_tenants':relationalSpecs[f.ref].table).find(r=>r.id===value); if(!target) throw new FluxError('RELATIONAL_REFERENCE_MISSING',`Missing reference for ${spec.table}.${f.column}`,503); value = row[`${f.column}_external_ref`] ?? external(target) }
    if(f.type==='timestamptz') value = new Date(String(value)).toISOString()
    if(f.type==='bigint') value=Number(value)
    if(f.type==='bytea' && typeof value==='string') value=Buffer.from(value.slice(2),'hex')
    set(entity,key,value)
  }
  return entity
}
export function decodeRelational(raw: RelationalRead): FluxState {
  const state = empty(Number(raw.version)); const collections: Record<string, Row[]> = {}
  for(const [key,spec] of Object.entries(relationalSpecs)) collections[key] = rows(raw,spec.table).slice().sort((a,b)=>Number(a.ordinal||0)-Number(b.ordinal||0)).map(row=>decodeRow(raw,spec,row))
  for(const key of ['projects','cards','approvals','gates','jobs','handoffs','artifacts','sprints','stories','requiredActions']) (state as unknown as Row)[key]=collections[key]
  const blockerRows=rows(raw,'flux_blockers')
  state.blockers = collections.blockers.filter(b=>!blockerRows.find(r=>external(r)===b.id)?.container_handoff_id) as FluxState['blockers']
  for(const h of state.handoffs) { const uuid=rows(raw,'flux_handoffs').find(r=>external(r)===h.id)?.id; const childIds=new Set(blockerRows.filter(r=>r.container_handoff_id===uuid).map(external)); const children=collections.blockers.filter(b=>childIds.has(String(b.id))); if(children.length) h.blockers=children as typeof h.blockers }
  state.events = collections.events.map(event=>{ const receipt=collections.receipts.find(r=>r.id===event.receiptId); delete event.receiptId; if(receipt) { const value={...receipt}; delete value.id; event.receipt=value } return event }) as FluxState['events']
  state.agentRuns=state.jobs
  if(collections.coordinatorRuns.length) state.coordinator!.lastCoordinatorRun=collections.coordinatorRuns.at(-1) as FluxState['coordinator'] extends {lastCoordinatorRun?: infer R} ? R : never
  if(raw.waitingReasons) state.coordinator!.waitingReasons=raw.waitingReasons
  return state
}
function entityCollections(state: FluxState): Record<string, Row[]> {
  const collections: Record<string, Row[]> = {}
  for(const key of Object.keys(relationalSpecs)) collections[key]=((state as unknown as Row)[key] || []) as Row[]
  collections.blockers=[...(state.blockers||[]),...state.handoffs.flatMap(h=>h.blockers||[])] as Row[]
  collections.receipts=state.events.flatMap(e=>e.receipt?[{...e.receipt,id:`receipt:${e.id}`}]:[]) as Row[]
  collections.events=state.events.map(e=>{ const copy={...e} as Row; delete copy.receipt; if(e.receipt) copy.receiptId=`receipt:${e.id}`; return copy })
  collections.handoffs=state.handoffs.map(h=>{const copy={...h}; delete copy.blockers; return copy}) as Row[]
  collections.coordinatorRuns=state.coordinator?.lastCoordinatorRun?[state.coordinator.lastCoordinatorRun as unknown as Row]:[]
  return collections
}
export function encodeChanges(raw: RelationalRead, state: FluxState): RelationalChange[] {
  const collections=entityCollections(state); const before=entityCollections(decodeRelational(raw)); const ids: Record<string, Map<string,string>>={}
  ids.tenants=new Map(rows(raw,'flux_tenants').flatMap(r=>[[external(r),String(r.id)],[String(r.slug),String(r.id)],[String(r.id),String(r.id)]]))
  for(const [key,spec] of Object.entries(relationalSpecs)) {
    ids[key]=new Map(rows(raw,spec.table).flatMap(r=>[[external(r),String(r.id)],[String(r.id),String(r.id)]]))
    for(const obj of collections[key]) { const id=String(obj[spec.key]); if(!id || id==='undefined') throw new FluxError('RELATIONAL_ID_REQUIRED',`${key} requires ${spec.key}`,422); if(!ids[key].has(id)) ids[key].set(id,randomUUID()) }
  }
  const projectNames=new Map<string,string[]>()
  for(const p of collections.projects) projectNames.set(String(p.name),[...(projectNames.get(String(p.name))||[]),String(p.id)])
  const changes: RelationalChange[]=[]
  for(const [key,spec] of Object.entries(relationalSpecs)) {
    const unique = new Map<string,Row>()
    for(const obj of collections[key]) { const id=String(obj[spec.key]); if(unique.has(id) && !isDeepStrictEqual(unique.get(id),obj)) throw new FluxError('RELATIONAL_DUPLICATE_ID',`Conflicting ${key} identifier`,422); unique.set(id,obj) }
    // StateMutation is not permission to erase rows/history implicitly.
    if(key!=='coordinatorRuns' && before[key].some(obj=>!unique.has(String(obj[spec.key])))) throw new FluxError('RELATIONAL_DELETE_DISABLED','Deleting persisted entities requires a separate approved operation',409)
    for(const [id,obj] of unique) {
      const prior=before[key].find(x=>String(x[spec.key])===id)
      if(prior && isDeepStrictEqual(prior,obj)) continue
      const known = new Set([spec.key,...Object.keys(spec.fields).map(k=>k.split('.')[0]).filter(k=>!k.endsWith('Present'))])
      for(const field of Object.keys(obj)) if(!known.has(field)) throw new FluxError('RELATIONAL_UNMAPPED_FIELD',`Unmapped field ${key}.${field}`,422)
      const row: Row={ id:ids[key].get(id), external_id:id, ordinal:collections[key].indexOf(obj) }
      for(const [field,f] of Object.entries(spec.fields)) {
        let value = field.endsWith('Present') ? Boolean(obj[field.slice(0,-7)]) : get(obj,field)
        if(f.ref && value != null) {
          const literal=String(value); row[`${f.column}_external_ref`]=literal
          if(f.ref==='projects' && !ids.projects.has(literal)) { const matches=projectNames.get(literal)||[]; if(matches.length!==1) throw new FluxError('RELATIONAL_PROJECT_AMBIGUOUS','Project must resolve unambiguously by id or name',422); value=matches[0] }
          value=ids[f.ref].get(String(value)); if(!value) throw new FluxError('RELATIONAL_REFERENCE_MISSING',`Unknown ${f.ref} reference in ${key}.${field}`,422)
        }
        if(f.type==='bytea' && value != null) { if(!(value instanceof Uint8Array)) throw new FluxError('INVALID_BINARY','Artifact binary content must be bytes',422); value=`\\x${Buffer.from(value).toString('hex')}` }
        if(value !== undefined && value !== null && f.type==='text' && typeof value!=='string') throw new FluxError('RELATIONAL_FIELD_TYPE',`${key}.${field} must be text (no serialized objects)`,422)
        row[f.column]=value ?? null
      }
      if(key==='projects') row.slug=id
      if(key==='cards') row.acceptance_criteria=(obj.acceptanceCriteria as string[]).join('\n')
      const card=collections.cards.find(c=>c.id===obj.cardId)
      const project=collections.projects.find(p=>p.id===(obj.projectId||obj.project||card?.project)||p.name===(obj.project||card?.project))
      const tenant=obj.tenantId ?? card?.tenantId ?? project?.tenantId
      if('tenantId' in spec.fields || ['gates','handoffs','artifacts','blockers','events','receipts','coordinatorRuns','requiredActions'].includes(key)) row.tenant_id=tenant==null?null:ids.tenants.get(String(tenant))
      if(tenant!=null && !row.tenant_id) throw new FluxError('RELATIONAL_TENANT_UNKNOWN','Tenant must be explicitly provisioned before domain writes',422)
      if(['artifacts','blockers','events'].includes(key)) row.project_id=project?ids.projects.get(String(project.id)):null
      if(key==='blockers') { const parent=state.handoffs.find(h=>h.blockers?.some(b=>b.id===id)); row.container_handoff_id=parent?ids.handoffs.get(parent.id):null }
      changes.push({table:spec.table,operation:'upsert',row})
    }
  }
  return changes
}
export class RelationalFluxRepository implements FluxStateRepository {
  private transport: RelationalTransport
  constructor(driver: SqlQuery | RelationalTransport) { this.transport='query' in driver?new SqlRelationalTransport(driver):driver }
  async load(): Promise<FluxState> { return decodeRelational(await this.transport.read()) }
  async save(state: FluxState): Promise<void> { const raw=await this.transport.read(); if(Number(raw.version)!==state.version) throw new FluxError('PERSISTENCE_CONFLICT','State version is stale',409); await this.transport.commit(Number(raw.version),encodeChanges(raw,state),state.coordinator?.waitingReasons) }
  async update<T>(mutation: StateMutation<T>): Promise<T> { const raw=await this.transport.read(); const state=decodeRelational(raw); const result=await mutation(state); const changes=encodeChanges(raw,state); const after=await this.transport.commit(Number(raw.version),changes,state.coordinator?.waitingReasons); if(Number(after.version)!==Number(raw.version)+1) throw new FluxError('PERSISTENCE_READBACK_FAILED','Relational commit readback version mismatch',503); return result }
}
