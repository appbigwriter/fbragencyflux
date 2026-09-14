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
  })

  it('makes handoffs filterable, expandable and action-oriented', async () => {
    const source = await read('handoffs/handoffs-client.tsx')
    expect(source).toContain('Todos os Handoffs')
    expect(source).toContain('Abrir detalhes')
    expect(source).toContain('setStatus')
    expect(source).toContain('setOwner')
    expect(source).toContain('setProject')
    expect(source).toContain('/resume')
    expect(source).toContain('Consultar no dashboard')
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
