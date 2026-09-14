'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuthSession } from '../auth-control'
import type { Handoff, ResolutionAction } from '@/lib/flux-repository'
import styles from '../page.module.css'
const labels: Record<string, string> = { received: 'Recebido', in_progress: 'Em evolução', awaiting_owner: 'Aguardando owner', blocked: 'Bloqueado', completed: 'Concluído', legacy: 'Histórico/legacy' }
const fields: Array<[keyof ResolutionAction, string]> = [['from', 'De'], ['to', 'Encaminhar para'], ['objective', 'Objetivo'], ['deliverable', 'Entregável'], ['acceptanceCriteria', 'Critérios'], ['evidenceRequired', 'Evidência necessária'], ['nextStep', 'Como resolver / próximo passo']]
export default function HandoffsClient({ initial }: { initial: Handoff[] }) {
  const [items, setItems] = useState(initial), [selected, setSelected] = useState<Handoff | null>(null), [query, setQuery] = useState(''), [message, setMessage] = useState(''), [form, setForm] = useState<ResolutionAction | null>(null)
  const { session } = useAuthSession()
  const filtered = items.filter((h) => `${h.id} ${h.summary} ${h.from} ${h.to} ${h.cardId} ${h.project}`.toLowerCase().includes(query.toLowerCase()))
  function choose(h: Handoff) { setSelected(h); setForm(h.resolutionAction || { from: h.from, to: h.to, objective: h.summary, deliverable: h.done, acceptanceCriteria: h.acceptanceCriteria, evidenceRequired: h.evidenceRef, nextStep: h.nextStep }) }
  async function forward() {
    if (!selected || !form || !session || !selected.blockerId) return
    const r = await fetch(`/api/flux/blockers/${selected.blockerId}/forward`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cardId: selected.cardId, jobId: selected.jobId, correlationId: crypto.randomUUID(), resolutionAction: form }) })
    const body = await r.json(); setMessage(r.ok ? 'Encaminhamento persistido; blocker continua open até evidência real.' : `${body.error}: ${body.message}`)
    if (r.ok && body.handoff) { setItems([...items, body.handoff]); setSelected(body.handoff) }
  }
  return <main className={styles.shell}><header className={styles.header}><div><p className={styles.eyebrow}>FBR Agency / Control Tower</p><h1>Handoffs</h1><p className={styles.subtitle}>Continuidade operacional com instrução executável e evidência.</p></div><nav><Link href="/">Dashboard</Link> · <Link href="/api/flux/jobs">Jobs</Link></nav></header>
    <div className={styles.toolbar}>{!session && <div className={styles.notice}>Leitura permitida; gestão bloqueada sem sessão. Encaminhamento exige login.</div>}<label>Pesquisar Handoffs<input aria-label="pesquisar Handoffs" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="título, card, de/para" /></label><Link href="/">Voltar ao dashboard</Link></div>{message && <div role="status" className={styles.notice}>{message}</div>}
    <section className={styles.panel}><div className={styles.panelHeader}><h2>Todos os Handoffs <span className={styles.muted}>({filtered.length})</span></h2></div><div className={styles.handoffList}>{filtered.map((h) => <button key={h.id} onClick={() => choose(h)}><span>{h.summary}</span><span>{h.cardId}</span><Status value={h.status || 'received'} /></button>)}</div></section>
    {selected && form && <div className={styles.detail} role="dialog" aria-label="detalhes e encaminhamento do Handoff"><div className={styles.row}><h2>{selected.summary}</h2><button onClick={() => setSelected(null)}>Fechar</button></div><p><strong>Status:</strong> <Status value={selected.status || 'received'} /> · <strong>Blocker:</strong> {selected.blockerId || selected.lastBlocker || 'não registrado'}</p>{fields.map(([key, label]) => <p key={key}><strong>{label}:</strong> {form[key] || 'não declarado'}</p>)}<p><strong>Regra:</strong> encaminhar cria Handoff/job/evento com correlationId; não resolve blocker.</p>{selected.blockerId && <>{fields.map(([key, label]) => <label key={`edit-${key}`}>{label}<textarea rows={2} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}<div className={styles.actions}><button disabled={!session || selected.status === 'legacy'} onClick={() => void forward()}>Enviar encaminhamento</button></div></>}{!session && <small role="note">Faça login para enviar.</small>}</div>}
  </main>
}
function Status({ value }: { value: string }) { return <span className={`${styles.status} ${styles[`status_${value}`] || ''}`}>{labels[value] || value}</span> }
