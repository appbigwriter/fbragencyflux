import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { getRepository } from '@/lib/persistence'

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
    const repo = await getRepository().catch(() => null)
    if (repo && body.cardId && body.status) {
      try {
        await repo.transitionCard(body.cardId, body.status as any, 'local', body.agent || 'HermesAgent')
      } catch (err) {
        console.warn('[INBOX] Não foi possível transicionar card automaticamente:', err)
      }
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
