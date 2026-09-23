'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from '../page.module.css'
import type { FluxTicket } from '../api/flux/tickets/route'

export default function ManualClient() {
  const [activeTab, setActiveTab] = useState<'manual' | 'helpdesk'>('manual')
  const [tickets, setTickets] = useState<FluxTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  // Form de novo ticket
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<FluxTicket['category']>('authority_engine')
  const [severity, setSeverity] = useState<FluxTicket['severity']>('medium')
  const [description, setDescription] = useState('')
  const [reportedBy, setReportedBy] = useState('Sergio')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const loadTickets = async () => {
    setLoadingTickets(true)
    try {
      const res = await fetch('/api/flux/tickets')
      if (res.ok) {
        const data = await res.json()
        setTickets(data.tickets || [])
      }
    } catch {} finally {
      setLoadingTickets(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const submitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setMessage('Preencha título e descrição do problema.')
      return
    }

    setBusy(true)
    setMessage('')
    try {
      const res = await fetch('/api/flux/tickets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          severity,
          description: description.trim(),
          reportedBy,
        }),
      })

      if (res.ok) {
        setMessage('Ticket aberto com sucesso! A equipe de orquestração foi notificada.')
        setTitle('')
        setDescription('')
        await loadTickets()
      } else {
        setMessage('Erro ao abrir ticket.')
      }
    } catch {
      setMessage('Falha ao conectar com o serviço.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className={styles.shell}>
      <header className={styles.dashboardTitleRow}>
        <div>
          <p className={styles.eyebrow}>FBR Agency / Control Tower</p>
          <h1>FluxManual & Helpdesk</h1>
        </div>
        <nav aria-label="Menu de navegação">
          <Link href="/">Dashboard</Link> · <Link href="/handoffs">Handoffs</Link> · <Link href="/jobs">Jobs</Link>
        </nav>
      </header>

      {/* Tabs de Seleção */}
      <div style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          style={{
            background: activeTab === 'manual' ? '#2563eb' : '#171c2b',
            color: '#fff',
            border: '1px solid #2a3247',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📖 Manual de Operações
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('helpdesk')}
          style={{
            background: activeTab === 'helpdesk' ? '#2563eb' : '#171c2b',
            color: '#fff',
            border: '1px solid #2a3247',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🎫 Helpdesk & Tickets de Incidentes ({tickets.length})
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Seção 1: A Esteira */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>1. A Esteira Completa da FBR Agency</h2>
            </div>
            <p>O FBR Agency Flux é a camada transversal de orquestração durável e governança:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '6px', border: '1px solid #2a3247' }}>
                <strong style={{ color: '#5b8cff' }}>1. Authority Engine</strong>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '6px 0 0' }}>Criação da persona, briefing de autoridade, diretrizes editoriais e fontes com Bia e Íris.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '6px', border: '1px solid #2a3247' }}>
                <strong style={{ color: '#a979ff' }}>2. Audience Builder</strong>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '6px 0 0' }}>Mapeamento de público-alvo, dores, oportunidades e produtos de afiliados com Caio e Rick.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '6px', border: '1px solid #2a3247' }}>
                <strong style={{ color: '#f5bd5a' }}>3. Sales Engine</strong>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '6px 0 0' }}>Cartas de vendas, copys de conversão, assets visuais com Caio, Lia e campanhas com Rafa.</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '6px', border: '1px solid #2a3247' }}>
                <strong style={{ color: '#57d6a0' }}>4. Control Tower</strong>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '6px 0 0' }}>Provisionamento de banco Supabase, governança de domínios, deploy e QA com Théo, Kora e Gabe.</p>
              </div>
            </div>
          </section>

          {/* Seção 2: Agentes Hermes */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>2. Agentes Hermes & Matriz de Papéis</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a3247', color: '#8f9ab2', textAlign: 'left' }}>
                  <th style={{ padding: '8px' }}>Agente</th>
                  <th style={{ padding: '8px' }}>Função Principal</th>
                  <th style={{ padding: '8px' }}>Entregáveis</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '0.9rem' }}>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}><strong>Íris</strong></td>
                  <td>Coordenação e Triagem</td>
                  <td>Decomposição de escopo, cálculo de dependências e Handoffs.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}><strong>Bia</strong></td>
                  <td>Pesquisa de Persona & Mercado</td>
                  <td>Dossiê de público, dores, concorrentes e referências.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}><strong>Théo</strong></td>
                  <td>Arquitetura & Infraestrutura</td>
                  <td>Schemas de banco, rotas de API, migrations e deploy.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}><strong>Caio</strong></td>
                  <td>Copywriting & Mensagens</td>
                  <td>Landing pages, cartas de vendas, títulos e copies de anúncio.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}><strong>Lia</strong></td>
                  <td>Design Visual & Assets</td>
                  <td>Identidade visual, imagens, layouts e especificações de UI.</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 8px' }}><strong>Gabe</strong></td>
                  <td>Auditoria de QA & Segurança</td>
                  <td>Verificação de critérios de aceite, SEO, conformidade e links.</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Seção 3: Gates de Aprovação */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>3. Central de Aprovações & Gates (G0 a G4)</h2>
            </div>
            <p>Ações de risco (gastos, deploys, publicações públicas) <strong>exigem aprovação formal de Sergio</strong>:</p>
            <ul style={{ lineHeight: '1.8', color: '#e5e7eb' }}>
              <li><strong>G0 — Escopo:</strong> Validação do briefing inicial e objetivos do projeto.</li>
              <li><strong>G1 — Fundação:</strong> Aprovação da arquitetura, schema de banco e integrações técnicas.</li>
              <li><strong>G2 — Produção:</strong> Verificação dos artefatos completos e aceite de QA do Gabe.</li>
              <li><strong>G3 — Decisão Executiva:</strong> Autorização formal de Sergio para publicação em produção ou gastos.</li>
              <li><strong>G4 — Verificação:</strong> Confirmação de funcionamento em produção e encerramento.</li>
            </ul>
          </section>
        </div>
      ) : (
        /* Seção Helpdesk & Abertura de Tickets */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Formulário de Abertura de Ticket */}
          <section className={styles.panel} style={{ border: '1px solid #3b82f6' }}>
            <div className={styles.panelHeader}>
              <h2>Abrir Novo Ticket de Solução de Problemas</h2>
              <small>Suporte em qualquer ponto da esteira da FBR Agency</small>
            </div>

            <form onSubmit={submitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Título do Problema</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Falha na resposta da Bia na pesquisa de persona"
                  style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Fase Afetada</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FluxTicket['category'])}
                    style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="authority_engine">Authority Engine</option>
                    <option value="audience">Audience Builder</option>
                    <option value="sales_engine">Sales Engine</option>
                    <option value="control_tower">Control Tower</option>
                    <option value="hermes_agent">Agentes Hermes</option>
                    <option value="n8n_integration">Integração N8N</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Severidade</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as FluxTicket['severity'])}
                    style={{ width: '100%', padding: '8px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="low">Baixa (Dúvida / Ajuste)</option>
                    <option value="medium">Média (Alerta operacional)</option>
                    <option value="high">Alta (Bloqueio parcial)</option>
                    <option value="critical">Crítica (Esteira parada)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Relator</label>
                  <input
                    type="text"
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '4px' }}>Descrição Detalhada do Problema</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Explique o que aconteceu, qual agente ou card falhou, mensagens de erro e o comportamento esperado..."
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
                  }}
                >
                  {busy ? 'Registrando...' : 'Registrar Ticket no Helpdesk'}
                </button>
                {message && <small style={{ color: message.includes('sucesso') ? '#4ade80' : '#f87171' }}>{message}</small>}
              </div>
            </form>
          </section>

          {/* Lista de Tickets Registrados */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Tickets e Incidentes em Acompanhamento</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {tickets.map(t => (
                <article
                  key={t.id}
                  style={{
                    background: '#171c2b',
                    padding: '14px',
                    borderRadius: '6px',
                    border: '1px solid #2a3247',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ color: '#fff' }}>[{t.id}] {t.title}</strong>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: t.severity === 'critical' ? '#ef4444' : t.severity === 'high' ? '#f59e0b' : '#3b82f6', color: '#fff' }}>
                        {t.severity.toUpperCase()}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: t.status === 'resolved' ? '#57d6a0' : '#f5bd5a' }}>
                      Status: {t.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.9rem' }}>{t.description}</p>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <span>Categoria: {t.category}</span>
                    <span>Relator: {t.reportedBy}</span>
                    <span>Data: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </article>
              ))}
              {!tickets.length && !loadingTickets && <p className={styles.muted}>Nenhum ticket aberto no momento.</p>}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
