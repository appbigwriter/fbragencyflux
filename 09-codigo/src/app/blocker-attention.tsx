'use client'

import { useState } from 'react'
import type { Blocker, DashboardSnapshot, ResolutionAction } from '../lib/flux-repository'
import { requestAuth, useAuthSession } from './auth-control'
import styles from './page.module.css'

const blank = (blocker: Blocker): ResolutionAction => blocker.resolutionAction

export default function BlockerAttention({ blockers, snapshot }: { blockers: Blocker[]; snapshot: DashboardSnapshot }) {
  const { session } = useAuthSession()
  const [selected, setSelected] = useState<Blocker | null>(null)
  const [form, setForm] = useState<ResolutionAction | null>(null)
  const [message, setMessage] = useState('')
  const visible = blockers.slice(0, 6)
  function open(blocker: Blocker) { if (!session) { setMessage('Entre para passar este problema'); requestAuth('Entre para passar este problema'); return } if (blocker.status !== 'open' || !blocker.resolutionAction) return; setSelected(blocker); setForm(blank(blocker)); setMessage('') }
  async function forward() {
    if (!selected || !form || !session) return
    const handoff = snapshot.handoffs.find((item) => item.id === selected.sourceId)
    const job = (snapshot.jobs || []).find((item) => item.jobId === selected.sourceId || item.cardId === selected.cardId || (handoff?.jobId && item.jobId === handoff.jobId))
    const response = await fetch(`/api/flux/blockers/${selected.id}/forward`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: selected.cardId || handoff?.cardId, jobId: job?.jobId, correlationId: crypto.randomUUID(), resolutionAction: form }) })
    const body = await response.json()
    setMessage(response.ok ? 'Encaminhamento persistido; blocker permanece aberto até evidência real.' : `${body.error || 'Erro'}: ${body.message || 'não foi possível encaminhar'}`)
    if (response.ok) setSelected(null)
  }
  return <section className={styles.panel}><div className={styles.panelHeader}><h2>Atenção necessária <span className={styles.muted}>(até 6 blockers)</span></h2></div>{!session && <p className={styles.notice}>Leitura permitida; encaminhamento exige login.</p>}{message && <p role="status" className={styles.notice}>{message}</p>}{!visible.length && <p className={styles.muted}>Nenhum blocker aberto.</p>}{visible.map((blocker) => {
    const handoff = snapshot.handoffs.find((item) => item.id === blocker.sourceId)
    const actionable = blocker.status === 'open' && Boolean(blocker.resolutionAction?.to && blocker.resolutionAction?.objective && blocker.resolutionAction?.deliverable)
    return <article className={styles.blocker} key={blocker.id}><div className={styles.row}><strong>{blocker.id}</strong><Status value={blocker.status}/></div><p><strong>Causa:</strong> {blocker.cause}</p><p><strong>Encaminhar para:</strong> {blocker.resolutionAction?.to || blocker.owner || 'não declarado'}</p><p><strong>Objetivo:</strong> {blocker.resolutionAction?.objective || 'não declarado'}</p><p><strong>Entregável:</strong> {blocker.resolutionAction?.deliverable || 'não declarado'}</p><p><strong>Decisão da Íris:</strong> {blocker.resolutionAction?.to === 'Sergio' ? 'Escalar para Sergio' : actionable ? 'Encaminhar para agente' : 'needs_revision'}</p><p><strong>Base no planejamento:</strong> {blocker.resolutionAction?.objective || 'não declarado'}</p><p><strong>Por que este owner:</strong> {blocker.owner || 'matriz sem owner'}</p><p><strong>Próximo check:</strong> {blocker.nextAction || 'não declarado'}</p><div className={styles.actions}><button type="button" disabled={Boolean(session) && !actionable} onClick={() => open(blocker)}>{blocker.resolutionAction?.to === 'Sergio' ? 'Consultar Sergio' : 'Passar problema'}</button>{!session && <small role="note">Entre para passar este problema</small>}{session && !actionable && <small role="note">Ação executável não declarada.</small>}</div></article>
  })}<div className={styles.actions}><a href="/handoffs">Ver detalhes completos em Handoffs</a></div>
  {selected && form && <div className={styles.detail} role="dialog" aria-label="formulário de encaminhamento"><div className={styles.row}><h2>Encaminhar {selected.id}</h2><button type="button" onClick={() => setSelected(null)}>Cancelar</button></div><p className={styles.notice}>Login ativo como {session?.actor}. Editar antes de enviar não encerra o blocker; a decisão da Íris só cria passagem operacional.</p><ForwardField label="De" value={form.from} onChange={(v) => setForm({ ...form, from: v })}/><ForwardField label="Destinatário / owner" value={form.to} onChange={(v) => setForm({ ...form, to: v })}/><ForwardField label="Objetivo" value={form.objective} onChange={(v) => setForm({ ...form, objective: v })}/><ForwardField label="Entregável" value={form.deliverable} onChange={(v) => setForm({ ...form, deliverable: v })}/><ForwardField label="Critérios de aceite" value={form.acceptanceCriteria} onChange={(v) => setForm({ ...form, acceptanceCriteria: v })}/><ForwardField label="Evidência necessária" value={form.evidenceRequired} onChange={(v) => setForm({ ...form, evidenceRequired: v })}/><ForwardField label="Próximo passo" value={form.nextStep} onChange={(v) => setForm({ ...form, nextStep: v })}/><div className={styles.actions}><button type="button" onClick={() => void forward()}>Enviar encaminhamento</button></div></div>}
  </section>
}
function ForwardField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label>{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={2}/></label> }
function Status({ value }: { value: string }) { return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}>{value}</span> }
