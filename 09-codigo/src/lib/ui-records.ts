export type RecordFilters = { owner?: string; project?: string; from?: string; to?: string; status?: string; historical?: string; current?: string; stale?: string }
export type PageQuery = Record<string, string | string[] | undefined>
export function queryValue(query: PageQuery, key: string) { const value = query[key]; return typeof value === 'string' ? value : '' }
export function matchesRecordFilters(row: {owner: string; project: string; date: string; historical?: boolean; status?: string; stale?: boolean}, filters: RecordFilters) {
 if (filters.owner && row.owner !== filters.owner || filters.project && row.project !== filters.project || filters.status && row.status !== filters.status) return false
 if (filters.historical === 'true' && !row.historical || filters.current === 'true' && row.historical || filters.stale === 'true' && !row.stale) return false
 if (!filters.from && !filters.to) return true
 const timestamp = Date.parse(row.date)
 if (!Number.isFinite(timestamp)) return false
 const date = new Date(timestamp)
 const day = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
 return (!filters.from || day >= filters.from) && (!filters.to || day <= filters.to)
}
