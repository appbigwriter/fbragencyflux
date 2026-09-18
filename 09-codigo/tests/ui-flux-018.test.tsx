import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import DashboardClient from '../src/app/dashboard-client'
import JobsClient from '../src/app/jobs/jobs-client'
import HandoffsClient from '../src/app/handoffs/handoffs-client'
import type { Handoff } from '../src/lib/flux-repository'
import type { AgentRun } from '../src/lib/flux-repository'
import type { DashboardSnapshot } from '../src/lib/flux-repository'
vi.mock('../src/app/auth-control', () => ({ useAuthSession: () => ({ session: null }), requestAuth: vi.fn() }))
const empty: DashboardSnapshot = { version: 1, projects: [], cards: [], gates: [], handoffs: [], artifacts: [], jobs: [], approvals: {pending:0,items:[]}, recentEvents: [], activeCards:0, blockers:[], risks:[], pendingGates:0,pendingCards:0,blockerCount:0,projectCards:{},currentCounts:{handoffs:0,jobs:0,cards:0},historicalCounts:{handoffs:0,jobs:0,cards:0} }
const job: AgentRun = {jobId:'job-test',cardId:'card-test',project:'Flux',agent:'Kora',role:'Owner',objective:'Validar entrega',status:'planned',updatedAt:'2026-09-17T12:00:00Z',artifactRefs:[],handoffRefs:[],evidenceRefs:[],blockers:[],nextStep:'Revisar',correlationId:'test',source:'test'}
it('renders every job once as a card, date filters and URL-selected human-readable details', () => {
 const html = renderToStaticMarkup(<JobsClient initial={[job,{...job,jobId:'old',historical:true}]} query={{job:'job-test'}} />)
 expect(html.match(/data-job-card=/g)).toHaveLength(2)
 expect(html).toContain('Data inicial')
 expect(html).toContain('Data final')
 expect(html).toContain('Detalhes do job')
 expect(html).toContain('<details')
 expect(html).toContain('Ver JSON técnico / readback')
 expect(renderToStaticMarkup(<JobsClient initial={[]} />)).toContain('Nenhum job registrado.')
})
const handoff: Handoff = {id:'handoff-test',cardId:'card-test',project:'Flux',from:'Íris',to:'Kora',summary:'Entrega para revisão',done:'Artefato disponível',risks:'Risco declarado',nextStep:'Validar evidência',acceptanceCriteria:'QA aprovado',evidenceRef:'evidencia.md',createdAt:'2026-09-17T12:00:00Z'}
it('lists all handoffs including history with title/owner only and accessible icons; opens URL detail and interaction', () => {
 const html=renderToStaticMarkup(<HandoffsClient initial={[handoff,{...handoff,id:'old',historical:true,legacy:true}]} query={{handoff:'handoff-test',interact:'true'}} />)
 expect(html.match(/data-handoff-row=/g)).toHaveLength(2)
 const list=html.slice(html.indexOf('data-handoff-row='),html.indexOf('aria-label="Detalhes do Handoff"'))
 expect(list).not.toContain('card-test')
 expect(list).not.toContain('Risco declarado')
 expect(list).toContain('aria-label="Detalhes: Entrega para revisão"')
 expect(list).toContain('aria-label="Interagir: Entrega para revisão"')
 for(const text of ['Data inicial','Data final','Reenviar ao owner','Redelegar para novo agente','Aprovar','Reprovar','Observações','QA aprovado']) expect(html).toContain(text)
 expect(html).not.toContain('<pre')
 expect(renderToStaticMarkup(<HandoffsClient initial={[]} />)).toContain('Nenhum Handoff registrado.')
})
describe('FLUX-018 dashboard', () => {
 it('shows Info, four ordered linked metrics, four operational panels and Histórico with truthful empty states', () => {
  const html = renderToStaticMarkup(<DashboardClient initial={empty} />)
  expect(html).toContain('aria-label="Info"')
  const metrics = html.slice(html.indexOf('aria-label="Métricas"'), html.indexOf('aria-label="Painéis operacionais"'))
  expect(metrics.match(/<a /g)).toHaveLength(4)
  expect(metrics.indexOf('Gates pendentes')).toBeLessThan(metrics.indexOf('Cards ativos'))
  expect(metrics.indexOf('Cards ativos')).toBeLessThan(metrics.indexOf('Jobs atuais'))
  expect(metrics.indexOf('Jobs atuais')).toBeLessThan(metrics.indexOf('Atenção necessária'))
  expect(html).toContain('Nenhum projeto registrado.')
  expect(html).toContain('Nenhum evento registrado.')
  expect(html).toContain('Histórico')
 })
})
