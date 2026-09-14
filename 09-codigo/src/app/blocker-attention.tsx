'use client'

import { useState } from 'react'
import type { Blocker, DashboardSnapshot } from '../lib/flux-repository'
import { useAuthSession } from './auth-control'
import styles from './page.module.css'

export default function BlockerAttention({ blockers, snapshot }: { blockers: Blocker[]; snapshot: DashboardSnapshot }) {
  const { session } = useAuthSession()
  const [message, setMessage] = useState('')
  const visible = blockers.slice(0, 6)
  async function forward(blocker: Blocker) {
    if (!session || blocker.status !== 'open' || !blocker.owner || !blocker.nextAction || !blocker.resolutionPlan) return
    const handoff = snapshot.handoffs.find((item) => item.id === blocker.sourceId)
    const job = (snapshot.jobs || []).find((item) => item.jobId === blocker.sourceId || item.cardId === blocker.cardId || (handoff?.jobId && item.jobId === handoff.jobId))
    const response = await fetch(`/api/flux/blockers/${blocker.id}/forward`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: blocker.cardId || handoff?.cardId, jobId: job?.jobId, correlationId: crypto.randomUUID() }) })
    const body = await response.json()
    setMessage(response.ok ? 'Readback registrado; card/job encaminhado para o owner sem marcar resolução.' : `${body.error || 'Erro'}: ${body.message || 'não foi possível encaminhar'}`)
  }
  return <section className={styles.panel}><div className={styles.panelHeader}><h2>Atenção necessária <span className={styles.muted}>(até 6 blockers)</span></h2></div>{!session && <p className={styles.notice}>Leitura permitida; gestão bloqueada sem sessão.</p>}{message && <p role="status" className={styles.notice}>{message}</p>}{!visible.length && <p className={styles.muted}>Nenhum blocker aberto.</p>}{visible.map((blocker) => {
    const handoff = snapshot.handoffs.find((item) => item.id === blocker.sourceId)
    const job = (snapshot.jobs || []).find((item) => item.cardId === blocker.cardId || (handoff?.jobId && item.jobId === handoff.jobId))
    const actionable = blocker.status === 'open' && Boolean(blocker.owner && blocker.nextAction && blocker.resolutionPlan)
    const reason = blocker.status === 'resolved' ? 'Resolvido: não há ação operacional disponível.' : blocker.status === 'legacy' ? 'Legacy: somente leitura, sem alteração do histórico.' : !actionable ? 'Ação bloqueada: solução não declarada.' : ''
    return <article className={styles.blocker} key={blocker.id}><div className={styles.row}><strong>{blocker.id}</strong><Status value={blocker.status}/></div><p><strong>Causa:</strong> {blocker.cause}</p><p><strong>Local:</strong> card {blocker.cardId || handoff?.cardId || 'não declarado'} · job {job?.jobId || handoff?.jobId || 'não declarado'} · Handoff {handoff?.id || 'não declarado'}</p><p><strong>Owner:</strong> {blocker.owner || 'não declarado'} · <strong>nextAction:</strong> {blocker.nextAction || 'não declarado'}</p><p><strong>resolutionPlan:</strong> {blocker.resolutionPlan || 'não declarado'} · <strong>resolutionEvidence:</strong> {blocker.resolutionEvidence || 'não declarada'}</p><div className={styles.actions}><button type="button" disabled={!session || !actionable} onClick={() => void forward(blocker)}>Prosseguir / liberar para owner</button>{reason && <small role="note">{reason}</small>}</div></article>
  })}<div className={styles.actions}><a href="/handoffs">Ver detalhes completos em Handoffs</a></div></section>
}
function Status({ value }: { value: string }) { return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}>{value}</span> }
