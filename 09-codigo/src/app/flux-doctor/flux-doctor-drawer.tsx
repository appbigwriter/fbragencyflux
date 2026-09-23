'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export default function FluxDoctorDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá! Sou o **FluxDoctor**, seu assistente de inteligência e diagnóstico da FBR Agency.\n\nComo posso ajudar você na esteira hoje?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMsg: Message = {
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/flux/doctor/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      })

      if (!res.ok) throw new Error('Erro na resposta do FluxDoctor')
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message?.content || 'Não consegui processar a resposta.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Não foi possível conectar ao FluxDoctor no momento. Verifique a conexão com o servidor.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botão Flutuante */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir FluxDoctor"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: '#fff',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 20px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 12px rgba(59, 130, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>🩺</span>
        <span>FluxDoctor</span>
      </button>

      {/* Drawer Lateral Retrátil */}
      {isOpen && (
        <aside
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '420px',
            maxWidth: '100vw',
            background: '#121622',
            borderLeft: '1px solid #2a3247',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideIn 0.25s ease-out',
          }}
        >
          {/* Header do Drawer */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #2a3247',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#0e111a',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🩺</span>
              <div>
                <strong style={{ display: 'block', color: '#f5f7fb', fontSize: '1rem' }}>FluxDoctor</strong>
                <span style={{ fontSize: '0.75rem', color: '#57d6a0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#57d6a0' }} />
                  Assistente & Diagnóstico Online
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                href="/manual"
                style={{
                  fontSize: '0.8rem',
                  color: '#5b8cff',
                  textDecoration: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #2a3247',
                  background: 'rgba(91, 140, 255, 0.1)',
                }}
              >
                📖 Manual
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8f9ab2',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderBottom: '1px solid #2a3247',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
            }}
          >
            <button
              type="button"
              onClick={() => handleSend('/diagnose')}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: '#171c2b',
                border: '1px solid #2a3247',
                borderRadius: '12px',
                color: '#f5bd5a',
                whiteSpace: 'nowrap',
              }}
            >
              🔍 Diagnosticar
            </button>
            <button
              type="button"
              onClick={() => handleSend('Como funcionam os Gates de aprovação?')}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: '#171c2b',
                border: '1px solid #2a3247',
                borderRadius: '12px',
                color: '#5b8cff',
                whiteSpace: 'nowrap',
              }}
            >
              🛡️ Gates
            </button>
            <button
              type="button"
              onClick={() => handleSend('Qual o papel da Íris e dos Agentes Hermes?')}
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                background: '#171c2b',
                border: '1px solid #2a3247',
                borderRadius: '12px',
                color: '#a979ff',
                whiteSpace: 'nowrap',
              }}
            >
              🤖 Agentes
            </button>
          </div>

          {/* Área de Mensagens com Scroll */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#2563eb' : '#171c2b',
                  color: '#f5f7fb',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  border: m.role === 'user' ? 'none' : '1px solid #2a3247',
                  fontSize: '0.88rem',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                }}
              >
                <div>{m.content}</div>
                <div
                  style={{
                    fontSize: '0.65rem',
                    color: m.role === 'user' ? 'rgba(255,255,255,0.7)' : '#8f9ab2',
                    marginTop: '4px',
                    textAlign: 'right',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            ))}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#171c2b',
                  color: '#8f9ab2',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                }}
              >
                🩺 FluxDoctor analisando...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form de Envio */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #2a3247',
              background: '#0e111a',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida ou comando..."
              style={{
                flex: 1,
                padding: '10px 14px',
                background: '#171c2b',
                border: '1px solid #2a3247',
                borderRadius: '8px',
                color: '#fff',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                padding: '0 16px',
                borderRadius: '8px',
                fontWeight: 600,
              }}
            >
              Enviar
            </button>
          </form>
        </aside>
      )}
    </>
  )
}
