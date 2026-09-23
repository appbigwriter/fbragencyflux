'use client'

import { useState } from 'react'
import { STAGES, StageId } from './pipeline-stepper'
import styles from './page.module.css'

export default function NewCardForm({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [stage, setStage] = useState<StageId>('authority_engine')
  const [project, setProject] = useState('After Forty')
  const [detail, setDetail] = useState('')
  const [assignee, setAssignee] = useState('Íris')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !detail.trim()) {
      setMessage('Preencha o título e o detalhe/briefing.')
      return
    }

    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/flux/cards/new', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          project,
          stage,
          detail: detail.trim(),
          assignee,
          priority: 'high',
        }),
      })

      if (!response.ok) {
        // Fallback para inbox caso o endpoint dedicado não exista
        await fetch('/api/flux/inbox', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            source: 'dashboard_ui',
            event: 'briefing_created',
            cardId: `CARD-${Date.now().toString().slice(-4)}`,
            agent: assignee,
            notes: `${title}: ${detail}`,
          }),
        })
      }

      setMessage('Card / Briefing criado com sucesso e disparado para a esteira!')
      setTitle('')
      setDetail('')
      setOpen(false)
      if (onCreated) onCreated()
    } catch {
      setMessage('Falha ao conectar com o serviço.')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <div style={{ margin: '16px 0' }}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Novo Briefing / Card na Esteira
        </button>
      </div>
    )
  }

  return (
    <section className={styles.panel} style={{ margin: '16px 0', border: '1px solid #3b82f6' }}>
      <div className={styles.panelHeader}>
        <h2>Criar Novo Briefing / Tarefa na Esteira</h2>
        <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
          ✕ Cancelar
        </button>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Título do Card / Objetivo</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pesquisa de Persona para Nicho X ou Pauta Editorial"
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Fase da Esteira</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as StageId)}
              style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Projeto / Marca</label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Ex: After Forty ou Novo Projeto"
              style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Agente Responsável (15 Profiles)</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
            >
              <optgroup label="Orquestração & Controle">
                <option value="Íris">Íris (Intake, Decomposição & Direção)</option>
                <option value="Kora">Kora (Kanban, Sprints & Estado)</option>
              </optgroup>
              <optgroup label="Pesquisa & Inteligência">
                <option value="Bia">Bia (Pesquisa de Mercado & Amazon US)</option>
                <option value="Rick">Rick (Radar de Afiliados & ClickBank)</option>
              </optgroup>
              <optgroup label="Operação Editorial & Projetos">
                <option value="Heidi Braun">Heidi Braun (Gestora Editorial — After Forty)</option>
                <option value="Gestor Editorial">Gestor Editorial (Novo Projeto / Custom)</option>
                <option value="Rita">Rita (Listings Amazon & Oferta)</option>
              </optgroup>
              <optgroup label="Criação, Mensagem & Visual">
                <option value="Caio">Caio (Copywriting Comercial & Conversão)</option>
                <option value="Lia">Lia (Direção Visual & Motion)</option>
                <option value="Vito">Vito (Audiovisual & Redes Sociais)</option>
              </optgroup>
              <optgroup label="Mídia & Crescimento">
                <option value="Rafa">Rafa (Mídia Paga, Meta Ads & PPC)</option>
              </optgroup>
              <optgroup label="Engenharia, QA & Auditoria">
                <option value="Théo">Théo (Arquitetura, Banco & Deploy)</option>
                <option value="Gabe">Gabe (QA, Compliance & Gatekeeper)</option>
              </optgroup>
              <optgroup label="Relacionamento & Suporte">
                <option value="Duda">Duda (SDR Consultivo, CRM & SPIN)</option>
                <option value="Email Guardian">Email Guardian (Triagem Segura de E-mails)</option>
                <option value="Second Brain">Second Brain (Memória & Conhecimento)</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Instruções / Briefing Completo</label>
          <textarea
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
            placeholder="Descreva o escopo, persona/gestor editorial, nicho, fontes, critérios de aceite e o que o agente deve entregar..."
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="submit"
            disabled={busy}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {busy ? 'Enviando...' : 'Criar e Disparar na Esteira'}
          </button>
          {message && <small style={{ color: message.includes('sucesso') ? '#4ade80' : '#f87171' }}>{message}</small>}
        </div>
      </form>
    </section>
  )
}
