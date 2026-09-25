import { describe, expect, it, vi, afterEach } from 'vitest'
import { buildBlockerChatPrompt, hermesFallbackMessage, sendHermesPrompt } from '../src/lib/hermes-chat'
import { normalizeBlocker } from '../src/lib/flux-repository'

const blocker = normalizeBlocker({ id: 'b-1', cause: 'API token=super-secret is unavailable', status: 'open', owner: 'Théo', author: 'Íris', nextAction: 'Validar contrato', resolutionPlan: 'Validar e registrar resultado', resolutionEvidence: 'readback.md', resolutionAction: { from: 'Flux', to: 'Théo', objective: 'Confirmar contrato', deliverable: 'Readback', acceptanceCriteria: 'Contrato confirmado', evidenceRequired: 'readback.md', nextStep: 'Anexar evidência' } })
const handoff = { id: 'h-1', cardId: 'C-1', project: 'Projeto', from: 'Íris', to: 'Théo', summary: 'Handoff', done: 'n/a', risks: '', nextStep: 'Validar', acceptanceCriteria: 'Aceite', evidenceRef: 'evidence.md', createdAt: 'now', status: 'awaiting_owner' as const }

afterEach(() => { vi.unstubAllGlobals() })

describe('Hermes blocker chat context', () => {
  it('preserves explicit blocker author and distinguishes owner', () => {
    const prompt = buildBlockerChatPrompt({ handoff, blocker })
    expect(prompt).toContain('Autor do bloqueio: Íris')
    expect(prompt).toContain('Owner: Théo')
    expect(prompt).toContain('Handoff ID: h-1')
    expect(prompt).toContain('Blocker ID: b-1')
    expect(prompt).toContain('resolutionAction/HOLD: HOLD')
    expect(prompt).toContain('Analise este impasse')
  })

  it('sanitizes secrets and uses a safe author fallback', () => {
    const prompt = buildBlockerChatPrompt({ blocker: { ...blocker, author: undefined } })
    expect(prompt).toContain('Autor do bloqueio: não declarado')
    expect(prompt).toContain('não inferir')
    expect(prompt).not.toContain('super-secret')
    expect(prompt).not.toContain('token=')
  })

  it('sends through the supported bridge without changing blocker state', async () => {
    const send = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('hermes', { send })
    const before = blocker.status
    expect(await sendHermesPrompt('prompt')).toBe('sent')
    expect(send).toHaveBeenCalledWith('prompt')
    expect(blocker.status).toBe(before)
  })

  it('reports a visible fallback when the Hermes bridge is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await sendHermesPrompt('safe context')).toBe('fallback')
    expect(writeText).toHaveBeenCalledWith('safe context')
    expect(hermesFallbackMessage()).toContain('copie o contexto')
  })
})
