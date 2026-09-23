'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuthSession } from '../auth-control'
import type { AgentRun } from '@/lib/flux-repository'
import { isJobStale } from '@/lib/jobs'
import { matchesRecordFilters, queryValue, type PageQuery, type RecordFilters } from '@/lib/ui-records'
import { Fields, References, RecordFiltersForm } from '../record-ui'
import styles from '../page.module.css'

export default function JobsClient({ initial, query = {} }: { initial: AgentRun[]; query?: PageQuery }) {
  const { session } = useAuthSession()
  const [filters, setFilters] = useState<RecordFilters>(() => Object.fromEntries(['owner', 'project', 'from', 'to', 'status', 'historical', 'current', 'stale'].map(key => [key, queryValue(query, key)])))
  const [selection, setSelection] = useState<string | null>(null)
  const selectedId = selection ?? queryValue(query, 'job')
  const selected = initial.find(j => j.jobId === selectedId)
  const visible = initial.filter(j => matchesRecordFilters({ owner: j.owner || j.agent, project: j.project, date: j.lastActivity || j.updatedAt, historical: j.historical, status: j.status, stale: isJobStale(j) }, filters))
  const options = (key: 'owner' | 'project') => [...new Set(initial.map(j => key === 'owner' ? j.owner || j.agent : j.project).filter(Boolean))].sort()

  function choose(id: string) {
    setSelection(id)
    const url = new URL(window.location.href)
    if (id) url.searchParams.set('job', id)
    else url.searchParams.delete('job')
    window.history.replaceState(null, '', url)
  }

  return (
    <main className={styles.shell}>
      <header className={styles.dashboardTitleRow}>
        <div>
          <p className={styles.eyebrow}>FBR AGENCY / CONTROL TOWER</p>
          <h1>Jobs</h1>
          <p className={styles.subtitle}>Visão executiva: situação, progresso, dependências e próxima ação. O JSON técnico fica nos detalhes.</p>
        </div>
        <nav>
          <Link href="/">Dashboard</Link> · <Link href="/handoffs">Handoffs</Link> · <Link href="/sprints">Sprints/Stories</Link> · <Link href="/manual">Manual</Link>
        </nav>
      </header>

      <RecordFiltersForm filters={filters} setFilters={setFilters} owners={options('owner')} projects={options('project')} />
      
      {!session && <p className={styles.notice}>Leitura permitida; gestão bloqueada sem sessão.</p>}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Todos os jobs ({visible.length})</h2>
          <small>Status de execução, dependências e rastreabilidade técnica.</small>
        </div>
        <div className={styles.cardGrid}>
          {visible.map(job => (
            <button
              type="button"
              data-job-card={job.jobId}
              className={`${styles.card} ${selected?.jobId === job.jobId ? styles.handoffCardSelected : ''}`}
              key={job.jobId}
              onClick={() => choose(job.jobId)}
              aria-label={`Detalhes de ${job.objective}`}
            >
              <span className={styles.cardId}>{job.jobId}</span>
              <h3>{job.objective || 'Objetivo não declarado'}</h3>
              <p style={{ margin: '4px 0', color: 'var(--muted)', fontSize: '12px' }}>
                {job.owner || job.agent || 'Owner não declarado'} · {job.project}
              </p>
              <div>
                <span className={`${styles.status} ${styles[`status_${job.status}`] || ''}`}>{job.status}</span>
              </div>
              <p style={{ margin: '6px 0 2px', color: 'var(--muted)', fontSize: '12px' }}>
                {job.historical ? 'Histórico' : 'Atual'} · {job.currentStep || 'Etapa não declarada'}
              </p>
              <p style={{ margin: '0', color: 'var(--text)', fontSize: '12px', fontWeight: 600 }}>
                Progresso: {job.progress === undefined ? 'não declarado' : `${job.progress}%`}
              </p>
            </button>
          ))}
        </div>
        {!visible.length && <p className={styles.muted} style={{ marginTop: '14px' }}>{initial.length ? 'Nenhum job corresponde aos filtros.' : 'Nenhum job registrado.'}</p>}
      </section>

      {selected && (
        <section className={`${styles.panel} ${styles.detail}`} style={{ marginTop: '20px' }} aria-label="Detalhes do job">
          <div className={styles.row}>
            <div>
              <span className={styles.eyebrow}>{selected.project}</span>
              <h2>Detalhes do job: {selected.objective}</h2>
            </div>
            <button type="button" onClick={() => choose('')}>Fechar</button>
          </div>
          <Fields fields={[
            ['Identificador', selected.jobId],
            ['Status', <span key="st" className={`${styles.status} ${styles[`status_${selected.status}`] || ''}`}>{selected.status}</span>],
            ['Owner', selected.owner || selected.agent],
            ['Agente / papel', `${selected.agent} / ${selected.role || 'não declarado'}`],
            ['Projeto', selected.project],
            ['Card', <Link key="card" href={`/?card=${encodeURIComponent(selected.cardId)}`}>{selected.cardId}</Link>],
            ['Objetivo', selected.objective],
            ['Etapa atual', selected.currentStep],
            ['Progresso', selected.progress === undefined ? 'Não declarado' : `${selected.progress}%`],
            ['Próxima ação', selected.nextStep],
            ['Próximo check', selected.nextCheck],
            ['Início', selected.startedAt],
            ['Última atualização', selected.updatedAt],
            ['Última atividade', selected.lastActivity || selected.lastSeen],
            ['Conclusão registrada', selected.completedAt],
            ['Critério de verificação', selected.verification || 'Não verificado'],
            ['Dependências', <References key="depends" values={selected.dependsOn} kind="job" />],
            ['Bloqueia', <References key="blocks" values={selected.blocks} kind="job" />],
            ['Blockers', <References key="blockers" values={selected.blockers} />],
            ['Handoffs', <References key="handoffs" values={selected.handoffRefs} kind="handoff" />],
            ['Artefatos', <References key="artifacts" values={selected.artifactRefs} />],
            ['Evidências', <References key="evidence" values={selected.evidenceRefs} />],
            ['Fonte', selected.source],
            ['Correlação', selected.correlationId]
          ]} />
          <details className={styles.technicalDetails}>
            <summary style={{ cursor: 'pointer', fontWeight: 600, color: 'var(--blue)' }}>Ver JSON técnico / readback</summary>
            <pre>{JSON.stringify(selected, null, 2)}</pre>
          </details>
          <p className={styles.notice}>Apenas readback persistido. Esta tela não presume execução de agente nem conclusão sem evidência.</p>
        </section>
      )}
      {selectedId && !selected && <p role="alert" className={styles.errorNotice}>Job não encontrado no escopo autorizado.</p>}
    </main>
  )
}
