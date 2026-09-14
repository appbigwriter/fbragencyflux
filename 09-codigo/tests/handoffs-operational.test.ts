import { afterEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { getSnapshot, normalizeHandoff, resumeHandoff, type FluxState, type Handoff } from '../src/lib/flux-repository'

const dirs: string[] = []
async function fixture() { const dir=await mkdtemp(join(tmpdir(),'handoffs-')); dirs.push(dir); const file=join(dir,'state.json'); const state=JSON.parse(await readFile(join(process.cwd(),'data/flux-state.json'),'utf8')) as FluxState; state.handoffs=[{id:'local-handoff',cardId:'AF-001',project:'After Forty',from:'Íris',to:'Gabe',summary:'Revisar evidências',done:'',risks:'',nextStep:'revisar',acceptanceCriteria:'evidência',evidenceRef:'tests',createdAt:new Date().toISOString(),status:'received',solution:{cause:'revisão pendente',owner:'Gabe',nextAction:'revisar evidência',resolutionPlan:'comparar fontes',resolutionEvidence:'tests'}}]; await writeFile(file,JSON.stringify(state)); return file }
afterEach(async()=>{await Promise.all(dirs.splice(0).map(d=>rm(d,{recursive:true,force:true})) )})

describe('operational handoffs',()=>{
 it('normalizes status and operational timestamps without inventing details',()=>{const h=normalizeHandoff({id:'h',cardId:'c',project:'p',from:'a',to:'b',summary:'s',done:'',risks:'',nextStep:'',acceptanceCriteria:'',evidenceRef:'e',createdAt:'2026-01-01T00:00:00Z',historical:true});expect(h.status).toBe('legacy');expect(h.lastUpdate).toBe(h.createdAt);expect(h.lastBlocker).toBeUndefined()})
 it('persists release, actor, owner and reads it back idempotently',async()=>{const file=await fixture(); const input={action:'release' as const,correlationId:'corr-fixed',cause:'causa',solution:'solução',nextAction:'próximo',owner:'Gabe'}; const first=await resumeHandoff('local-handoff',input,{actor:'Íris',scope:'local'},file); expect(first.handoff?.status).toBe('released'); expect(first.event.actor).toBe('Íris'); expect(first.event.to).toBe('Gabe'); const second=await resumeHandoff('local-handoff',input,{actor:'Íris',scope:'local'},file); expect(second.idempotent).toBe(true); expect((await getSnapshot(file)).handoffs.find(h=>h.id==='local-handoff')?.status).toBe('released')})
 it('keeps legacy handoffs read-only',async()=>{const file=await fixture(); const state=JSON.parse(await readFile(file,'utf8')); state.handoffs[0].status='legacy'; state.handoffs[0].historical=true; await writeFile(file,JSON.stringify(state)); await expect(resumeHandoff('local-handoff',{action:'resume',correlationId:'c',cause:'x',solution:'y',nextAction:'z',owner:'Gabe'},{actor:'Íris',scope:'local'},file)).rejects.toMatchObject({code:'LEGACY_HANDOFF'})})
})
