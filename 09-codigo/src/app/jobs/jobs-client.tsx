'use client'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAuthSession } from '../auth-control'
import type { AgentRun } from '@/lib/flux-repository'
import { classifyJob, filterJobs, getJobSummary, getPriorityJobs, type JobFilter, type JobWithStale } from '@/lib/jobs'
import styles from '../page.module.css'

const labels: Record<string, string> = { review: 'Review', blocked: 'Blocked', in_progress: 'Em evolução', completed: 'Concluído', awaiting_owner: 'Aguardando owner', failed: 'Falhou', planned: 'Planejado', not_verified: 'Não verificado' }
const lifecycle = (job: AgentRun) => classifyJob(job) === 'historical' ? 'Histórico' : classifyJob(job) === 'realtime' ? 'Realtime' : 'Planejado'
const sourceLabel = (job: AgentRun) => job.sourceType === 'filesystem' || job.source.toLowerCase().includes('filesystem') ? 'filesystem readback' : job.source
const short = (value: string | undefined, fallback = 'não declarado') => value?.trim() || fallback

export default function JobsClient({ initial }: { initial: AgentRun[] }) {
  const [filter, setFilter] = useState<JobFilter>({})
  const [selected, setSelected] = useState<JobWithStale | null>(null)
  const [message, setMessage] = useState('')
  const { session } = useAuthSession()
  const visible = useMemo(() => filterJobs(initial, filter), [initial, filter])
  const summary = useMemo(() => getJobSummary(initial), [initial])
  const priority = useMemo(() => getPriorityJobs(visible), [visible])
  const values = (key: keyof JobFilter) => [...new Set(initial.map((job) => {
    if (key === 'origin') return job.sourceType === 'filesystem' ? 'filesystem' : 'local'
    if (key === 'lifecycle') return classifyJob(job) === 'historical' ? 'historical' : classifyJob(job) === 'realtime' ? 'live' : 'planned'
    if (key === 'project') return job.project
    if (key === 'card') return job.cardId
    if (key === 'agent') return job.agent
    if (key === 'status') return job.status
    if (key === 'owner') return job.owner || ''
    return ''
  }).filter(Boolean))]
  function set(key: keyof JobFilter, value: string) { setFilter((current) => ({ ...current, [key]: value || undefined })) }
  async function update(event: 'progress' | 'waiting_input', job: JobWithStale) {
    const response = await fetch(`/api/flux/jobs/${job.jobId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event, nextStep: job.nextStep, owner: job.owner, currentStep: job.currentStep }) })
    const result = await response.json()
    setMessage(response.ok ? 'Registro local atualizado; nenhuma conclusão foi presumida.' : `${result.error || 'Erro'}: ${result.message || 'não foi possível registrar'}`)
  }
  return <main className={styles.shell}>
    <header className={styles.header}><div><p className={styles.eyebrow}>FBR Agency / Control Tower</p><h1>Jobs</h1><p className={styles.subtitle}>Readback operacional: Planejado, Histórico e Realtime só quando há evidência de execução.</p></div><nav><Link href="/">Dashboard</Link> · <Link href="/handoffs">Handoffs</Link></nav></header>
    <section className={styles.metrics}>{[['Total', summary.total], ['Review', summary.byStatus.review || 0], ['Blocked', summary.byStatus.blocked || 0], ['Planejado', summary.planned], ['Histórico', summary.historical], ['Realtime', summary.realtime], ['Stale', summary.stale], ['Blockers ativos', summary.activeBlocker]].map(([label, value]) => <div className={styles.metric} key={String(label)}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className={styles.panel}><div className={styles.panelHeader}><h2>Filtros</h2></div><div className={styles.toolbar}>{(['project', 'card', 'agent', 'status', 'owner', 'origin'] as const).map((key) => <label key={key}>{key}<select aria-label={key} value={String(filter[key] || '')} onChange={(event) => set(key, event.target.value)}><option value="">Todos</option>{values(key).map((value) => <option key={value} value={value}>{key === 'status' ? labels[value] || value : value}</option>)}</select></label>)}<label>classificação<select aria-label="classificação" value={filter.lifecycle || ''} onChange={(event) => set('lifecycle', event.target.value)}><option value="">Todos</option><option value="planned">Planejado</option><option value="historical">Histórico</option><option value="live">Realtime</option></select></label><label>stale<select aria-label="stale" value={filter.stale === undefined ? '' : String(filter.stale)} onChange={(event) => setFilter({ ...filter, stale: event.target.value === '' ? undefined : event.target.value === 'true' })}><option value="">Todos</option><option value="true">Stale</option><option value="false">Não stale</option></select></label><label>blocker<select aria-label="blocker" value={filter.blocker === undefined ? '' : String(filter.blocker)} onChange={(event) => setFilter({ ...filter, blocker: event.target.value === '' ? undefined : event.target.value === 'true' })}><option value="">Todos</option><option value="true">Ativo</option><option value="false">Sem blocker</option></select></label><button onClick={() => setFilter({})}>Limpar</button></div></section>
    {message && <div role="status" className={styles.notice}>{message}</div>}{!session && <div className={styles.notice}>Leitura permitida; gestão bloqueada sem sessão.</div>}
    <section className={styles.panel}><div className={styles.panelHeader}><h2>Prioridade operacional <span className={styles.muted}>(máx. 6)</span></h2></div><div className={styles.cardGrid}>{priority.map((job) => <JobCard key={job.jobId} job={job} onClick={() => setSelected(job)} />)}</div></section>
    <section className={styles.panel}><div className={styles.panelHeader}><h2>Todos os jobs <span className={styles.muted}>({visible.length})</span></h2></div><div className={styles.jobList}>{visible.map((job) => <button className={styles.jobRow} key={job.jobId} onClick={() => setSelected(job)}><span><strong>{job.agent || 'agent não declarado'}</strong><small>{short(job.objective, 'objetivo não declarado')}</small></span><span>{job.project} / {job.cardId}</span><Status value={job.status} /><span>{new Date(job.updatedAt).toLocaleString('pt-BR')}<small>{sourceLabel(job)}</small></span></button>)}</div></section>
    {selected && <JobDetails job={selected} session={Boolean(session)} close={() => setSelected(null)} update={update} />}
  </main>
}
function JobDetails({ job, session, close, update }: { job: JobWithStale; session: boolean; close: () => void; update: (event: 'progress' | 'waiting_input', job: JobWithStale) => void }) {
  const fields: [string, string][] = [['Objetivo', job.objective], ['Role', job.role], ['Projeto/card', `${job.project} / ${job.cardId}`], ['Owner', short(job.owner)], ['Started', short(job.startedAt)], ['Updated', job.updatedAt], ['Last seen', short(job.lastSeen)], ['Último evento', short(job.lastEvent)], ['Progresso', job.progress === undefined ? 'não declarado' : `${job.progress}%`], ['Current step', short(job.currentStep)], ['Artefatos', job.artifactRefs.join(', ')], ['Evidências', job.evidenceRefs.join(', ')], ['Handoffs relacionados', job.handoffRefs.join(', ')], ['Riscos/pendências históricas', job.blockers.join('; ')], ['Tracks paralelo/dependências', `${short(job.track)} · ${job.parallelGroup || 'não declarado'} · depende de: ${(job.dependsOn || []).join(', ') || 'nenhum'}`], ['Can start', job.canStart === undefined ? 'não calculado' : String(job.canStart)], ['Motivo de espera', short(job.dependencyReason)], ['Blockers ativos', job.activeBlocker ? job.blockers.join('; ') : 'nenhum'], ['Next step', short(job.nextStep)], ['Correlation ID', job.correlationId], ['Source', job.source]]
  return <section className={styles.panel} role="dialog" aria-label="detalhes do job"><div className={styles.row}><h2>{job.agent}: {short(job.objective)}</h2><button onClick={close}>Fechar</button></div><p><Status value={job.status} /> · <strong>{job.stale ? 'stale' : 'não stale'}</strong> · <strong>{lifecycle(job)}</strong> · <strong>{sourceLabel(job)}</strong></p><div className={styles.detailGrid}>{fields.map(([key, value]) => <div key={key}><small>{key}</small><p>{short(value)}</p></div>)}</div><div className={styles.actions}><button onClick={() => update('progress', job)} disabled={!session || !job.historical || !job.nextStep || !job.owner}>Retomar evolução</button><button onClick={() => update('waiting_input', job)} disabled={!session || !job.activeBlocker || !job.owner || !job.nextStep}>Encaminhar para owner</button><button onClick={() => update('progress', job)} disabled={!session}>Registrar progresso / readback</button></div><small role="note">Ações preservam o status real, usam owner/nextStep declarados e não marcam conclusão sem evidência.</small></section>
}
function JobCard({ job, onClick }: { job: JobWithStale; onClick: () => void }) { return <button className={styles.card} onClick={onClick}><span className={styles.cardId}>{job.agent} · {job.cardId}</span><h3>{short(job.objective)}</h3><Status value={job.status} /><p>{job.stale ? 'stale · ' : ''}{lifecycle(job)} · {sourceLabel(job)}</p></button> }
function Status({ value }: { value: string }) { return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}>{labels[value] || value}</span> }
