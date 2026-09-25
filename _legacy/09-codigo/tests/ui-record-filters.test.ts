import { expect, it } from 'vitest'
import { matchesRecordFilters } from '../src/lib/ui-records'
it('filters exact owner/project and inclusive local date interval without hiding historical rows by default', () => {
 const row = { owner:'Kora', project:'Flux', date:'2026-09-17T23:59:59', historical:true }
 expect(matchesRecordFilters(row, {})).toBe(true)
 expect(matchesRecordFilters(row, {owner:'Kora',project:'Flux',from:'2026-09-17',to:'2026-09-17'})).toBe(true)
 expect(matchesRecordFilters(row, {owner:'Íris'})).toBe(false)
 expect(matchesRecordFilters(row, {project:'Outro'})).toBe(false)
 expect(matchesRecordFilters(row, {from:'2026-09-18'})).toBe(false)
 expect(matchesRecordFilters(row, {to:'2026-09-16'})).toBe(false)
 expect(matchesRecordFilters({...row,date:'not_declared'}, {from:'2026-09-17'})).toBe(false)
 expect(matchesRecordFilters(row, {from:'2026-09-18',to:'2026-09-16'})).toBe(false)
})
