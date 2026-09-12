import { getSnapshot } from '../lib/flux-repository'
import ApprovalActions from './approval-actions'
import styles from './page.module.css'

const statusLabels: Record<string, string> = { active: 'Ativo', blocked: 'Bloqueado', planned: 'Planejado', ready: 'Pronto', in_progress: 'Em execução', review: 'Em revisão', awaiting_approval: 'Aguardando aprovação', approved: 'Aprovado local', completed: 'Concluído', failed: 'Falhou' }

export default async function Home() {
  const snapshot = await getSnapshot()
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>FBR Agency / Control Tower</p><h1>Agency Flux</h1><p className={styles.subtitle}>Visão operacional dos projetos, gates e handoffs</p></div><div className={styles.live}><span />LOCAL PERSISTED · NO EXTERNAL EFFECT</div></header>
    <section className={styles.metrics} aria-label="Resumo operacional"><Metric label="Projetos" value={snapshot.projects.length} note="no fluxo" /><Metric label="Cards ativos" value={snapshot.activeCards} note="em execução ou revisão" /><Metric label="Aprovações" value={snapshot.approvals.pending} note="pendentes de Sergio" accent /><Metric label="Bloqueios" value={snapshot.blockers.length} note="com próximo passo" danger /></section>
    <div className={styles.grid}>
      <Panel title="Projetos" kicker="Portfólio"><div className={styles.projectList}>{snapshot.projects.map((project) => <div className={styles.project} key={project.id}><div className={styles.row}><strong>{project.name}</strong><Status value={project.status} /></div><p>{project.description}</p><small>Owner: {project.owner}</small></div>)}</div></Panel>
      <Panel title="Aprovações" kicker="Gate humano" alert>{snapshot.approvals.items.map((approval) => <div className={styles.approval} key={approval.id}><div><strong>{approval.title}</strong><p>{approval.impact} · por {approval.requestedBy}</p></div><ApprovalActions approval={approval} /></div>)}</Panel>
      <Panel title="Cards ativos" kicker="Kora · estado operacional" wide><div className={styles.cardGrid}>{snapshot.cards.filter((card) => card.status !== 'blocked').map((card) => <div className={styles.card} key={card.id}><div className={styles.row}><span className={styles.cardId}>{card.id}</span><Status value={card.status} /></div><h3>{card.title}</h3><p>{card.detail}</p><small>{card.assignee} · {card.project}</small>{snapshot.artifacts.filter((artifact) => artifact.cardId === card.id).map((artifact) => <small key={artifact.id}>Artefato: {artifact.name}</small>)}</div>)}</div></Panel>
      <Panel title="Bloqueios" kicker="Exigem ação" alert>{snapshot.blockers.length ? snapshot.blockers.map((card) => <div className={styles.blocker} key={card.id}><strong>{card.title}</strong><p>{card.detail}</p><small>Responsável: {card.assignee}</small></div>) : <p>Sem bloqueios registrados</p>}</Panel>
      <Panel title="Eventos recentes" kicker="Auditoria" wide><ol className={styles.events}>{snapshot.recentEvents.map((event) => <li key={event.id}><span className={styles.eventDot} /><div><strong>{event.actor}</strong> {event.action}{event.cardId && <span className={styles.muted}> · {event.cardId}</span>}<small>{event.time}</small></div></li>)}</ol></Panel>
    </div><footer>Fluxo local: revisão → aprovação simulada → verificação · LOCAL/NO EXTERNAL EFFECT</footer>
  </main>
}
function Metric({ label, value, note, accent, danger }: { label: string; value: number; note: string; accent?: boolean; danger?: boolean }) { return <div className={`${styles.metric} ${accent ? styles.metricAccent : ''} ${danger ? styles.metricDanger : ''}`}><span>{label}</span><strong>{value}</strong><small>{note}</small></div> }
function Panel({ title, kicker, children, wide, alert }: { title: string; kicker: string; children: React.ReactNode; wide?: boolean; alert?: boolean }) { return <section className={`${styles.panel} ${wide ? styles.wide : ''} ${alert ? styles.alert : ''}`}><div className={styles.panelHeader}><div><span className={styles.kicker}>{kicker}</span><h2>{title}</h2></div></div>{children}</section> }
function Status({ value }: { value: string }) { return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}>{statusLabels[value] || value}</span> }
