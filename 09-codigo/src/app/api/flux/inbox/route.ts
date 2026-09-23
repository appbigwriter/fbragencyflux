import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { configuredRepository } from '@/lib/persistence'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      source?: string
      event?: string
      cardId?: string
      jobId?: string
      agent?: string
      status?: string
      artifact?: { name: string; content?: string; url?: string }
      evidence?: string
      notes?: string
    }

    console.log(`[INBOX RECEIVE] Evento recebido da fonte "${body.source || 'hermes/n8n'}" para card "${body.cardId || body.jobId}"`)

    if (!body.cardId && !body.jobId) {
      return NextResponse.json({ error: 'cardId ou jobId obrigatório' }, { status: 400 })
    }

    // Registra o evento no repositório persistido se configurado
    try {
      const repo = configuredRepository()
      if (repo && 'update' in repo && body.cardId) {
        await repo.update((state) => {
          const card = state.cards.find(c => c.id === body.cardId)
          if (card && body.status) {
            card.status = body.status as any
            card.updatedAt = new Date().toISOString()
          }
          state.events.push({
            id: `EVT-${Date.now().toString().slice(-6)}`,
            time: new Date().toISOString(),
            actor: body.agent || 'HermesAgent',
            action: `Inbox: Entrega recebida para ${body.cardId}. ${body.notes || ''}`,
            cardId: body.cardId,
          })
        })
      }
    } catch (err) {
      console.warn('[INBOX] Aviso ao persistir evento no repositório:', err)
    }

    return NextResponse.json({
      status: 'accepted',
      receivedAt: new Date().toISOString(),
      cardId: body.cardId,
      agent: body.agent,
    }, { status: 200 })
  } catch (error) {
    console.error('[INBOX ERROR]', error)
    return jsonError(error)
  }
}
