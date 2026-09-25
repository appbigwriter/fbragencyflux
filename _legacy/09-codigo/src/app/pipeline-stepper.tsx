'use client'

import { useState } from 'react'
import styles from './page.module.css'

export type StageId = 'authority_engine' | 'audience' | 'sales_engine' | 'control_tower'

export interface StageInfo {
  id: StageId
  title: string
  subtitle: string
  agent: string
  link: string
  description: string
}

export const STAGES: StageInfo[] = [
  {
    id: 'authority_engine',
    title: '1. Authority Engine',
    subtitle: 'Persona & Brand Engine',
    agent: 'Bia / Íris',
    link: 'https://sistemas-authority.pojxaz.easypanel.host/about',
    description: 'Definição da persona, briefing de autoridade, fontes de nicho e diretrizes de marca.',
  },
  {
    id: 'audience',
    title: '2. Audience',
    subtitle: 'Audience Builder & Segmentação',
    agent: 'Caio / Rick',
    link: '#audience',
    description: 'Pesquisa de mercado, estruturação de audiência, mapeamento de dores e público-alvo.',
  },
  {
    id: 'sales_engine',
    title: '3. Sales Engine',
    subtitle: 'Ofertas & Funis de Venda',
    agent: 'Caio / Rafa / Lia',
    link: '#sales-engine',
    description: 'Criação de copys, páginas de conversão, ofertas de afiliados e canais de tráfego.',
  },
  {
    id: 'control_tower',
    title: '4. Control Tower',
    subtitle: 'Provisionamento & Deploy',
    agent: 'Théo / Kora / Gabe',
    link: '#control-tower',
    description: 'Provisionamento de banco de dados, governança de domínios, automações e deploy em produção.',
  },
]

export default function PipelineStepper({ activeStage, onSelectStage }: { activeStage?: StageId; onSelectStage?: (stage: StageId) => void }) {
  const [selected, setSelected] = useState<StageId>(activeStage || 'authority_engine')

  const handleSelect = (stage: StageId) => {
    setSelected(stage)
    if (onSelectStage) onSelectStage(stage)
  }

  return (
    <section className={styles.panel} aria-label="Esteira de Execução FBR Agency">
      <div className={styles.panelHeader}>
        <h2>Esteira de Orquestração FBR Agency</h2>
        <small>Fluxo contínuo: Authority → Audience → Sales → Control Tower</small>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        margin: '16px 0',
      }}>
        {STAGES.map((s, idx) => {
          const isCurrent = selected === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s.id)}
              style={{
                background: isCurrent ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: isCurrent ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#fff',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: isCurrent ? '#60a5fa' : '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                  Fase {idx + 1}
                </span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                  {s.agent}
                </span>
              </div>
              <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '4px' }}>{s.title}</strong>
              <small style={{ display: 'block', color: '#9ca3af', lineHeight: '1.3' }}>{s.subtitle}</small>
            </button>
          )
        })}
      </div>

      {selected && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderLeft: '3px solid #3b82f6',
          padding: '12px 16px',
          borderRadius: '0 6px 6px 0',
          fontSize: '0.9rem',
          color: '#e5e7eb',
        }}>
          {STAGES.find(s => s.id === selected)?.description}
        </div>
      )}
    </section>
  )
}
