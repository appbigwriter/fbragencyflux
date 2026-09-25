'use client'

import { useState } from 'react'
import type { Approval } from '../lib/flux-repository'
import styles from '../app/page.module.css'

export default function ApprovalActions({ approval }: { approval: Approval }) {
  const [status, setStatus] = useState(approval.status)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  async function decide(decision: 'approved' | 'rejected' | 'revision_requested') {
    if ((decision !== 'approved') && !reason.trim()) { setMessage('Informe o motivo para rejeitar ou devolver.'); return }
    const response = await fetch(`/api/flux/approvals/${approval.id}/decision`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ decision, reason, packageVersion: approval.packageVersion || 1 }) })
    const body = await response.json() as { approval?: Approval; message?: string }
    if (!response.ok) { setMessage(body.message || 'Falha ao registrar'); return }
    setStatus(body.approval?.status || decision); setMessage('Registrado localmente')
  }
  if (status !== 'pending') return <span className={styles.pending}>{status === 'approved' ? 'Aprovado local' : status === 'rejected' ? 'Rejeitado local' : 'Devolvido para revisão'}</span>
  return <div className={styles.actions}><textarea aria-label="Motivo da decisão" value={reason} onChange={event => setReason(event.target.value)} placeholder="Motivo obrigatório para rejeitar/devolver"/><button type="button" onClick={() => decide('approved')}>Aprovar local</button><button type="button" onClick={() => decide('rejected')}>Rejeitar local</button><button type="button" onClick={() => decide('revision_requested')}>Devolver para revisão</button>{message && <small>{message}</small>}</div>
}
