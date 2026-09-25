import { describe, expect, it } from 'vitest'
import { readFile } from 'node:fs/promises'

const read = (name: string) => readFile(`src/app/${name}`, 'utf8')

describe('operational UX contracts', () => {
  it('renders an accessible, editable forward form with visible feedback', async () => {
    const source = await read('blocker-attention.tsx')
    expect(source).toContain('forward-${key}')
    expect(source).toContain('aria-modal="true"')
    expect(source).toContain('Enviando…')
    expect(source).toContain('role="alert"')
    expect(source).not.toContain('actor: session.actor')
    expect(source).toContain('Chat with blocker')
    expect(source).toContain('data-hermes-send')
    expect(source).toContain('Contexto enviado ao chat do Hermes')
  })

  it('makes handoffs filterable, expandable and action-oriented', async () => {
    const source = await read('handoffs/handoffs-client.tsx')
    expect(source).toContain('Todos os Handoffs')
    expect(source).toContain('Abrir detalhes')
    expect(source).toContain('setStatus')
    expect(source).toContain('setOwner')
    expect(source).toContain('setProject')
    expect(source).toContain('performHandoffAction')
    expect(source).toContain('Consultar no dashboard')
    expect(source).toContain('Conversar sobre este blocker')
    expect(source).toContain('data-hermes-send')
  })

  it('keeps jobs executive by default and makes technical JSON optional', async () => {
    const source = await read('jobs/jobs-client.tsx')
    expect(source).toContain('Visão executiva')
    expect(source).toContain('Progresso')
    expect(source).toContain('Dependências')
    expect(source).toContain('Última atividade')
    expect(source).toContain('Ver JSON técnico / readback')
    expect(source).toContain('<details')
  })
})
