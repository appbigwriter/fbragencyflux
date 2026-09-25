'use client'
import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'
import type { Handoff } from '@/lib/flux-repository'
import { matchesRecordFilters, queryValue, type PageQuery, type RecordFilters } from '@/lib/ui-records'
import { performHandoffAction, type HandoffAction, type HandoffActionPayload } from '@/lib/ui-handoff-actions'
import { useAuthSession, requestAuth } from '../auth-control'
import { Fields, References, RecordFiltersForm } from '../record-ui'
import styles from '../page.module.css'

export default function HandoffsClient({ initial, query = {} }: { initial: Handoff[]; query?: PageQuery }) {
  const [items, setItems] = useState(initial)
  const [status, setStatus] = useState(queryValue(query, 'status'))
  const [project, setProject] = useState(queryValue(query, 'project'))
  const [filters, setFilters] = useState<RecordFilters>(() => Object.fromEntries(['owner', 'project', 'from', 'to', 'status', 'historical'].map(key => [key, queryValue(query, key)])))
  const updateFilters = (next: RecordFilters) => { setFilters(next); setStatus(next.status || ''); setProject(next.project || '') }
  const [selection, setSelection] = useState<string | null>(null)
  const [interact, setInteract] = useState(queryValue(query, 'interact') === 'true')
  const [action, setAction] = useState<HandoffAction>('resend')
  const [owner, setOwner] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const attempt = useRef<{ key: string; correlationId: string } | null>(null)
  const { session } = useAuthSession()
  const selectedId = selection ?? queryValue(query, 'handoff')
  const selected = items.find(h => h.id === selectedId)
  const options = (key: 'to' | 'project') => [...new Set(items.map(h => h[key]).filter(Boolean))].sort()
  const visible = items.filter(h => matchesRecordFilters({ owner: h.to, project: h.project, date: h.lastUpdate || h.createdAt, historical: h.historical || h.legacy, status: h.status || 'received' }, filters))

  function choose(h: Handoff | null, interaction = false) {
    setSelection(h?.id || '')
    setInteract(interaction)
    setOwner('')
    setNotes('')
    setError('')
    setMessage('')
    setAction('resend')
    attempt.current = null
    const url = new URL(window.location.href)
    if (h) url.searchParams.set('handoff', h.id)
    else url.searchParams.delete('handoff')
    if (interaction) url.searchParams.set('interact', 'true')
    else url.searchParams.delete('interact')
    window.history.replaceState(null, '', url)
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!selected || busy) return
    if (!session) { requestAuth('Entre para registrar uma ação de Handoff.'); return }
    const key = JSON.stringify([selected.id, action, owner.trim(), notes.trim()])
    if (attempt.current?.key !== key) attempt.current = { key, correlationId: crypto.randomUUID() }
    const payload: HandoffActionPayload = { action, correlationId: attempt.current.correlationId, ...(action === 'reassign' ? { owner } : {}), ...(notes.trim() ? { notes } : {}) }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await performHandoffAction(selected, payload)
      setItems(result.items)
      setSelection(result.handoff.id)
      setMessage('Decisão registrada e confirmada por leitura de volta. Nenhum disparo de agente foi confirmado.')
      attempt.current = null
      setNotes('')
      setOwner('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível conectar ao serviço.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className={styles.shell}>
      <header className={styles.dashboardTitleRow}>
        <div>
          <p className={styles.eyebrow}>FBR AGENCY / CONTROL TOWER</p>
          <h1>Handoffs</h1>
          <p className={styles.subtitle}>Todos os registros persistidos, atuais e históricos da esteira de transição entre agentes.</p>
        </div>
        <nav>
          <Link href="/">Dashboard</Link> · <Link href="/jobs">Jobs</Link> · <Link href="/sprints">Sprints/Stories</Link> · <Link href="/manual">Manual</Link>
        </nav>
      </header>

      <RecordFiltersForm filters={filters} setFilters={updateFilters} owners={options('to')} projects={options('project')} />
      
      {!session && <p className={styles.notice}>Leitura permitida; gestão bloqueada sem sessão. Ações exigem login e autorização do servidor.</p>}
      {message && <p role="status" className={styles.notice}>{message}</p>}
      {error && <p role="alert" className={styles.errorNotice}>{error}</p>}

      <div className={styles.twoColumnLayout}>
        <div className={styles.columnLeft}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Todos os Handoffs ({visible.length})</h2>
              <small>Selecione um item para inspecionar entregáveis, blockers e dependências.</small>
            </div>
            <div className={styles.handoffList}>
              {visible.map(h => (
                <article
                  data-handoff-row={h.id}
                  className={`${styles.handoffSimpleRow} ${selected?.id === h.id ? styles.handoffCardSelected : ''}`}
                  key={h.id}
                  onClick={() => choose(h)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.handoffInfo}>
                    <strong>{h.summary || 'Título não declarado'}</strong>
                    <span>De <strong>{h.from || 'Agente'}</strong> para <strong>{h.to || 'Owner não declarado'}</strong> · {h.project}</span>
                  </div>
                  <div className={styles.handoffMeta}>
                    <span className={`${styles.status} ${styles[`status_${h.status || 'received'}`] || ''}`}>
                      {h.status || 'received'}
                    </span>
                    <div className={styles.actions} onClick={e => e.stopPropagation()}>
                      <button type="button" aria-label={`Detalhes: ${h.summary}`} title="Abrir detalhes" disabled={busy} onClick={() => choose(h)}>
                        <span aria-hidden="true">👁️</span> Detalhes
                      </button>
                      <button type="button" aria-label={`Interagir: ${h.summary}`} title="Interagir com o Handoff" disabled={busy} onClick={() => choose(h, true)}>
                        <span aria-hidden="true">⚡</span> Ação
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!visible.length && <p className={styles.muted}>{items.length ? 'Nenhum Handoff corresponde aos filtros.' : 'Nenhum Handoff registrado.'}</p>}
            </div>
          </section>
        </div>

        <div className={styles.columnRight}>
          {selected ? (
            <section className={`${styles.panel} ${styles.detail}`} aria-label="Detalhes do Handoff">
              <div className={styles.row}>
                <div>
                  <span className={styles.eyebrow}>{selected.project}</span>
                  <h2>{selected.summary}</h2>
                </div>
                <button type="button" disabled={busy} onClick={() => choose(null)}>Fechar</button>
              </div>
              <Fields fields={[
                ['Identificador', selected.id],
                ['Status', <span key="st" className={`${styles.status} ${styles[`status_${selected.status || 'received'}`] || ''}`}>{selected.status || 'received'}</span>],
                ['Projeto', selected.project],
                ['Card', <Link key="card" href={`/?card=${encodeURIComponent(selected.cardId)}`}>{selected.cardId}</Link>],
                ['De', selected.from],
                ['Owner', selected.to],
                ['Feito / entregável', selected.done],
                ['Riscos', selected.risks],
                ['Próximo passo', selected.nextStep],
                ['Próximo check', selected.nextCheck],
                ['Critérios de aceite', selected.acceptanceCriteria],
                ['Evidência', <References key="evidence" values={selected.evidenceRef ? [selected.evidenceRef] : []} />],
                ['Decisões registradas', <References key="decisions" values={selected.decisions} />],
                ['Criação', selected.createdAt],
                ['Última atualização', selected.lastUpdate],
                ['Última atividade', selected.lastActivity],
                ['Job', selected.jobId ? <Link key="job" href={`/jobs?job=${encodeURIComponent(selected.jobId)}`}>{selected.jobId}</Link> : 'Não declarado'],
                ['Blockers', <References key="blockers" values={selected.blockers?.map(b => b.id) || (selected.blockerId ? [selected.blockerId] : [])} kind="blocker" />],
                ['Correlação', selected.correlationId]
              ]} />
              {selected.resolutionAction && (
                <>
                  <h3>Instrução executável</h3>
                  <Fields fields={[
                    ['Objetivo', selected.resolutionAction.objective],
                    ['Entregável', selected.resolutionAction.deliverable],
                    ['Critérios', selected.resolutionAction.acceptanceCriteria],
                    ['Evidência necessária', selected.resolutionAction.evidenceRequired],
                    ['Próximo passo', selected.resolutionAction.nextStep],
                    ['Fallback', selected.resolutionAction.fallback]
                  ]} />
                </>
              )}
              
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {!interact && (
                  <button type="button" className={styles.primaryButton} disabled={!session || busy} onClick={() => setInteract(true)}>
                    Interagir com este Handoff
                  </button>
                )}
                <Link href={`/?handoff=${encodeURIComponent(selected.id)}`} className={styles.muted} style={{ fontSize: '13px' }}>
                  Consultar no dashboard
                </Link>
                <span className={styles.srOnly}>Conversar sobre este blocker</span>
                <span data-hermes-send={`Contexto do Handoff ${selected.id}`}></span>
              </div>

              {interact && (
                <form className={styles.interactionForm} onSubmit={submit} aria-label="Interagir com Handoff">
                  <h3>Registrar ação</h3>
                  <p className={styles.notice}>Reenviar e redelegar registram uma decisão operacional. Não confirmam execução real do agente. Aprovar não autoriza publicação, gasto ou deploy.</p>
                  <label>Ação
                    <select value={action} onChange={e => setAction(e.target.value as HandoffAction)} disabled={busy}>
                      <option value="resend">Reenviar ao owner</option>
                      <option value="reassign">Redelegar para novo agente</option>
                      <option value="approve">Aprovar</option>
                      <option value="reject">Reprovar</option>
                    </select>
                  </label>
                  {action === 'resend' && <p className={styles.muted}>Owner atual: {selected.to || 'não declarado'}</p>}
                  {action === 'reassign' && (
                    <label>Novo agente
                      <input required value={owner} onChange={e => setOwner(e.target.value)} list="known-owners" disabled={busy} />
                      <datalist id="known-owners">{options('to').filter(v => v !== selected.to).map(v => <option key={v} value={v} />)}</datalist>
                      <small className={styles.muted}>Identidade validada pelo servidor; sugestões vêm dos registros recebidos.</small>
                    </label>
                  )}
                  <label>Observações{(action === 'approve' || action === 'reject') ? ' (obrigatórias)' : ' (opcionais)'}
                    <textarea required={action === 'approve' || action === 'reject'} value={notes} onChange={e => setNotes(e.target.value)} disabled={busy} rows={4} />
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" disabled={busy || !session}>{busy ? 'Registrando e verificando…' : 'Registrar ação'}</button>
                    <button type="button" style={{ background: 'transparent', border: '1px solid var(--line)' }} onClick={() => setInteract(false)}>Cancelar</button>
                  </div>
                  {!session && <button type="button" onClick={() => requestAuth('Entre para registrar ações de Handoff.')}>Entrar para interagir</button>}
                </form>
              )}
            </section>
          ) : (
            <div className={styles.emptyPlaceholder}>
              <span style={{ fontSize: '32px' }}>📋</span>
              <p><strong>Nenhum Handoff selecionado</strong></p>
              <p>Clique em qualquer handoff da lista ao lado para abrir a ficha técnica detalhada e formulário de despacho.</p>
            </div>
          )}
          {selectedId && !selected && <p role="alert" className={styles.errorNotice}>Handoff não encontrado no escopo autorizado.</p>}
        </div>
      </div>
    </main>
  )
}
