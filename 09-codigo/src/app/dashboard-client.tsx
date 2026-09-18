'use client'
import Link from 'next/link'
import type { DashboardSnapshot } from '../lib/flux-repository'
import { getJobSummary } from '../lib/jobs'
import BlockerAttention from './blocker-attention'
import ApprovalActions from './approval-actions'
import styles from './page.module.css'

export default function DashboardClient({ initial }: { initial: DashboardSnapshot }) {
 const jobs = initial.jobs || []
 const stale = getJobSummary(jobs).stale
 const awaiting = initial.handoffs.filter(h => h.status === 'awaiting_owner').length
 const attention = awaiting + initial.blockers.length + stale
 const gates = initial.gates.filter(g => g.status === 'pending' || g.decidedAt).slice(0, 4)
 return <main className={styles.shell}>
  <header className={styles.dashboardTitleRow}><div><p className={styles.eyebrow}>FBR Agency / Control Tower</p><h1>Agency Flux</h1></div><nav aria-label="Menu principal"><Link href="/handoffs">Handoffs</Link> · <Link href="/jobs">Jobs</Link> · <Link href="/sprints">Sprints/Stories</Link></nav></header>
  <section className={styles.info} aria-label="Info"><strong>Info</strong><p>Estado persistido do escopo autorizado. Decisão registrada não equivale a execução de agente ou autorização de efeito externo.</p></section>
  <section className={styles.metrics} aria-label="Métricas"><Metric label="Gates pendentes" value={initial.pendingGates} href="/?view=gates"/><Metric label="Cards ativos" value={initial.activeCards} href="/?view=cards"/><Metric label="Jobs atuais" value={initial.currentCounts.jobs} href="/jobs?current=true"/><Metric label="Atenção necessária" value={attention} href="/?view=attention"/></section>
  <div className={styles.dashboardGrid} aria-label="Painéis operacionais">
   <section className={styles.panel}><div className={styles.panelHeader}><h2>Projetos e cards prioritários</h2></div>{initial.projects.slice(0,4).map(project => <article className={styles.project} key={project.id}><Link className={styles.dataLink} href={`/?project=${encodeURIComponent(project.id)}`}><strong>{project.name}</strong><Status value={project.status}/><p>{project.description}</p></Link>{(initial.projectCards[project.id] || []).filter(c => c.priority === 'high').slice(0,3).map(card => <Link className={styles.compactItem} key={card.id} href={`/?card=${encodeURIComponent(card.id)}`}><span><strong>{card.id}</strong> {card.title}</span><Status value={card.status}/></Link>)}</article>)}{!initial.projects.length && <p className={styles.muted}>Nenhum projeto registrado.</p>}</section>
   <section className={styles.panel}><div className={styles.panelHeader}><h2>Gates pendentes/recentes</h2></div>{gates.map(g => <Link className={styles.compactItem} key={g.id} href={`/?gate=${encodeURIComponent(g.id)}`}><span><strong>{g.title}</strong><small>{g.owner}</small></span><Status value={g.status}/></Link>)}{!gates.length && <p className={styles.muted}>Nenhum gate pendente ou decidido.</p>}</section>
  <section className={styles.panel} aria-label="Central de Aprovações"><div className={styles.panelHeader}><h2>Central de Aprovações</h2><small>Projeto · persona · blog · tipo · status</small></div>{initial.approvals.items.map(approval => <article className={styles.compactItem} key={approval.id}><span><strong>{approval.title}</strong><small>{approval.project || 'Projeto não declarado'} · {approval.persona || 'Persona não declarada'} · {approval.blog || 'Blog não declarado'} · {approval.type || 'Tipo não declarado'} · pacote v{approval.packageVersion || 1}</small></span><ApprovalActions approval={approval}/></article>)}{!initial.approvals.items.length && <p className={styles.muted}>Nenhuma aprovação no escopo autorizado.</p>}</section>
   <BlockerAttention blockers={initial.blockers} snapshot={initial}/>
  </div>
  <section className={`${styles.panel} ${styles.history}`} aria-label="Histórico"><div className={styles.panelHeader}><h2>Histórico</h2></div><div className={styles.actions}><Link href="/jobs?historical=true">{initial.historicalCounts.jobs} jobs históricos</Link><Link href="/handoffs?historical=true">{initial.historicalCounts.handoffs} Handoffs históricos</Link><Link href="/?view=history">Ver todos os eventos disponíveis</Link></div><ul className={styles.events}>{initial.recentEvents.slice(0,5).map(event => <li key={event.id}><span className={styles.eventDot}/><Link href={`/?event=${encodeURIComponent(event.id)}`}>{event.action}<small>{event.actor} · {event.time}</small></Link></li>)}</ul>{!initial.recentEvents.length && <p className={styles.muted}>Nenhum evento registrado.</p>}</section>
 </main>
}
function Metric({label,value,href}:{label:string;value:number;href:string}) { return <Link href={href} className={styles.metric}><span>{label}</span><strong>{value}</strong></Link> }
function Status({value}:{value:string}) { return <span className={styles.status}>{value}</span> }
