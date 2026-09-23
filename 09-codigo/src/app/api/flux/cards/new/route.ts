import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { configuredRepository } from '@/lib/persistence'
import { dispatchWebhook } from '@/lib/webhook-dispatcher'

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      title?: string
      project?: string
      stage?: 'authority_engine' | 'audience' | 'sales_engine' | 'control_tower'
      detail?: string
      assignee?: string
      priority?: 'low' | 'medium' | 'high'
    }

    if (!body.title) {
      return NextResponse.json({ error: 'Título do card é obrigatório' }, { status: 400 })
    }

    const cardId = `CARD-${Date.now().toString().slice(-5)}`
    const newCard = {
      id: cardId,
      title: body.title,
      project: body.project || 'After Forty',
      status: 'pending' as const,
      assignee: body.assignee || 'Íris',
      priority: body.priority || 'high',
      detail: body.detail || '',
      acceptanceCriteria: ['Revisão de qualidade e evidência entregue'],
      updatedAt: new Date().toISOString(),
    }

    // Tenta gravar no repositório persistido se disponível
    try {
      const repo = configuredRepository()
      if (repo && 'update' in repo) {
        await repo.update((state) => {
          state.cards.push(newCard as any)
          state.events.push({
            id: `EVT-${Date.now().toString().slice(-6)}`,
            time: new Date().toISOString(),
            actor: body.assignee || 'Íris',
            action: `Card criado na esteira (${body.stage || 'authority_engine'}): ${body.title}`,
            cardId,
          })
        })
      }
    } catch (repoErr) {
      console.warn('[CREATE CARD] Aviso ao persistir via driver:', repoErr)
    }

    // Dispara webhook de saída para o N8N / Hermes
    await dispatchWebhook({
      event: 'card_created',
      timestamp: new Date().toISOString(),
      project: body.project,
      stage: body.stage,
      cardId,
      agent: body.assignee,
      data: {
        title: body.title,
        detail: body.detail,
        priority: body.priority,
      },
    })

    return NextResponse.json({
      success: true,
      card: newCard,
      message: 'Card criado e despachado com sucesso',
    }, { status: 201 })
  } catch (error) {
    console.error('[CREATE CARD ERROR]', error)
    return jsonError(error)
  }
}
