'use client'

import { useState } from 'react'
import type { Approval } from '../lib/flux-repository'
import styles from '../app/page.module.css'

export default function ApprovalActions({ approval }: { approval: Approval }) {
  const [status, setStatus] = useState(approval.status)
  const [message, setMessage] = useState('')
  async function decide(decision: 'approved' | 'rejected') {
    const response = await fetch(`/api/flux/approvals/${approval.id}/decision`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ decision, actor: 'Sergio', scope: 'local' }) })
    const body = await response.json() as { approval?: Approval; message?: string }
    if (!response.ok) { setMessage(body.message || 'Falha ao registrar'); return }
    setStatus(body.approval?.status || decision); setMessage('Registrado localmente')
  }
  if (status !== 'pending') return <span className={styles.pending}>{status === 'approved' ? 'Aprovado local' : 'Rejeitado local'}</span>
  return <div className={styles.actions}><button type="button" onClick={() => decide('approved')}>Aprovar local</button><button type="button" onClick={() => decide('rejected')}>Rejeitar local</button>{message && <small>{message}</small>}</div>
}
