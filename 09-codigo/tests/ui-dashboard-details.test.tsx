import React from 'react'
import { it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import DashboardDetails from '../src/app/dashboard-details'
import type { DashboardSnapshot } from '../src/lib/flux-repository'
const snapshot: DashboardSnapshot={version:1,projects:[{id:'p',name:'Projeto real de teste',description:'Escopo persistido',owner:'Kora',status:'active'}],cards:[{id:'c',project:'p',title:'Revisão',detail:'Verificar fontes',assignee:'Gabe',priority:'high',status:'review',acceptanceCriteria:['Evidência presente'],updatedAt:'2026-09-17'}],gates:[],handoffs:[],artifacts:[],jobs:[],blockers:[],risks:[],approvals:{pending:0,items:[]},recentEvents:[{id:'e',time:'2026-09-17',actor:'Gabe',action:'Revisou evidência',reason:'Fonte confirmada',cardId:'c',correlationId:'corr'}],activeCards:1,pendingGates:0,pendingCards:1,blockerCount:0,projectCards:{},currentCounts:{jobs:0,handoffs:0,cards:1},historicalCounts:{jobs:0,handoffs:0,cards:0}}
it('opens actual project/card/event detail from URL query with related links, not JSON',()=>{
 for (const [query,text] of [[{project:'p'},'Escopo persistido'],[{card:'c'},'Evidência presente'],[{event:'e'},'Fonte confirmada']] as const) {
  const html=renderToStaticMarkup(<DashboardDetails snapshot={snapshot} query={query}/>)
  expect(html).toContain(text);expect(html).not.toContain('<pre')
 }
 const event=renderToStaticMarkup(<DashboardDetails snapshot={snapshot} query={{event:'e'}}/>)
 expect(event).toContain('/?card=c')
 expect(renderToStaticMarkup(<DashboardDetails snapshot={snapshot} query={{view:'cards'}}/>)).toContain('Revisão')
 expect(renderToStaticMarkup(<DashboardDetails snapshot={snapshot} query={{card:'missing'}}/>)).toContain('não encontrado no escopo autorizado')
})
