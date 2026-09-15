'use client'

import { FormEvent, useState } from 'react'
import type { Blocker, Card, DashboardSnapshot, ResolutionAction } from '../lib/flux-repository'
import { buildBlockerChatPrompt, hermesFallbackMessage, sendHermesPrompt } from '../lib/hermes-chat'
import { normalizeBlocker } from '../lib/flux-repository'
import { requestAuth, useAuthSession } from './auth-control'
import styles from './page.module.css'

const fields: Array<{ key: keyof ResolutionAction; label: string; required?: boolean }> = [
  { key: 'from', label: 'De' }, { key: 'to', label: 'Destinatário / owner', required: true },
  { key: 'objective', label: 'Objetivo', required: true }, { key: 'deliverable', label: 'Entregável', required: true },
  { key: 'acceptanceCriteria', label: 'Critérios de aceite', required: true }, { key: 'evidenceRequired', label: 'Evidência necessária', required: true },
  { key: 'nextStep', label: 'Próximo passo', required: true }, { key: 'fallback', label: 'Fallback / ação requerida' },
]
const defaults = (blocker: Blocker): ResolutionAction => ({ ...blocker.resolutionAction, fallback: 'Escalar a Sergio se o owner não entregar a evidência.' })

export default function BlockerAttention({ blockers, snapshot }: { blockers: Blocker[]; snapshot: DashboardSnapshot }) {
  const { session } = useAuthSession()
  const [selected, setSelected] = useState<Blocker | null>(null)
  const [form, setForm] = useState<ResolutionAction | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const visible = blockers.slice(0, 6)
  function open(blocker: Blocker) { if (!session) { setMessage('Entre para passar este problema'); requestAuth('Entre para passar este problema'); return }; if (blocker.status !== 'open') return; setSelected(blocker); setForm(defaults(blocker)); setError(null); setMessage('') }
  async function forward(event: FormEvent) {
    event.preventDefault(); if (!selected || !form || !session) return
    const missing = fields.filter((field) => field.required && !form[field.key]?.trim()).map((field) => field.label)
    if (missing.length) { setError(`Preencha: ${missing.join(', ')}.`); return }
    const handoff = snapshot.handoffs.find((item) => item.id === selected.sourceId)
    const job = (snapshot.jobs || []).find((item) => item.jobId === selected.sourceId || item.cardId === selected.cardId || (handoff?.jobId && item.jobId === handoff.jobId))
    setBusy(true); setError(null); setMessage('Enviando encaminhamento…')
    try {
      const response = await fetch(`/api/flux/blockers/${selected.id}/forward`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: selected.cardId || handoff?.cardId, jobId: job?.jobId, correlationId: crypto.randomUUID(), resolutionAction: form }) })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) { setError(`${body.error || 'Erro'}: ${body.message || 'não foi possível encaminhar'}`); setMessage(''); return }
      setMessage(body.idempotent ? 'Encaminhamento já registrado; nenhum evento duplicado foi criado.' : `Handoff liberado; encaminhado para ${body.handoff?.to || form.to}; blocker continua open aguardando evidência.`)
      setSelected(null); setForm(null)
    } catch { setError('Não foi possível conectar ao serviço. Tente novamente.'); setMessage('') } finally { setBusy(false) }
  }
  return <section className={styles.panel}><div className={styles.panelHeader}><h2>Atenção necessária <span className={styles.muted}>(até 6 blockers)</span></h2></div>{!session && <p className={styles.notice}>Leitura permitida; encaminhamento exige login.</p>}{message && <p role="status" className={styles.notice}>{message}</p>}{error && <p role="alert" className={styles.errorNotice}>{error}</p>}{!visible.length && <p className={styles.muted}>Nenhum blocker aberto.</p>}{visible.map((blocker) => {
    const actionable = blocker.status === 'open'
    return <article className={styles.blocker} key={blocker.id}><div className={styles.row}><strong>{blocker.id}</strong><Status value={blocker.status}/></div><p className={styles.blockerText}><strong>Resumo do problema:</strong> {blocker.cause}</p><p><strong>Owner atual:</strong> {blocker.owner || 'não declarado'} · <strong>Próximo check:</strong> {blocker.nextAction || 'não declarado'}</p><div className={styles.actions}><ChatWithBlocker blocker={blocker} snapshot={snapshot} /> <button type="button" disabled={Boolean(session) && !actionable} onClick={() => open(blocker)}>{blocker.resolutionAction?.to === 'Sergio' ? 'Consultar Sergio' : 'Passar problema'}</button>{!session && <small role="note">Leitura permitida; encaminhamento exige login</small>}</div></article>
  })}<div className={styles.actions}><a href="/handoffs">Ver detalhes completos em Handoffs</a></div>
  {selected && form && <div className={styles.detail} role="dialog" aria-modal="true" aria-labelledby="forward-title"><div className={styles.row}><h2 id="forward-title">Encaminhar {selected.id}</h2><button type="button" onClick={() => setSelected(null)} disabled={busy}>Cancelar</button></div><p className={styles.notice}>Resumo do problema: {selected.cause}<br />Sessão ativa; o actor é obtido pela API. Editar não encerra o blocker.</p><form className={styles.forwardForm} onSubmit={forward}>{fields.map(({ key, label, required }) => <label className={styles.forwardField} key={key} htmlFor={`forward-${key}`}>{label}{required && <span aria-hidden="true"> *</span>}<textarea id={`forward-${key}`} name={key} required={required} value={form[key] || ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} rows={key === 'objective' || key === 'deliverable' ? 3 : 2} /></label>)}<div className={styles.actions}><button type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar encaminhamento'}</button></div></form></div>}
  </section>
}
function ChatWithBlocker({ blocker, snapshot, handoff }: { blocker: Blocker; snapshot: DashboardSnapshot; handoff?: DashboardSnapshot['handoffs'][number] }) {
  const card = snapshot.cards.find((item) => item.id === blocker.cardId)
  const source = handoff || snapshot.handoffs.find((item) => item.id === blocker.sourceId)
  const prompt = buildBlockerChatPrompt({ project: card?.project || source?.project, card, handoff: source, blocker })
  const [status, setStatus] = useState<'sent' | 'fallback' | ''>('')
  async function chat() { setStatus(await sendHermesPrompt(prompt)) }
  return <><button type="button" className={styles.chatButton} data-hermes-send={prompt} onClick={() => void chat()}>Chat with blocker<span className={styles.srOnly}> / Conversar sobre este blocker</span></button>{status === 'sent' && <small role="status">Contexto enviado ao chat do Hermes</small>}{status === 'fallback' && <details className={styles.chatFallback}><summary>{hermesFallbackMessage()}</summary><pre>{prompt}</pre></details>}</>
}
function Status({ value }: { value: string }) { return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}>{value}</span> }
