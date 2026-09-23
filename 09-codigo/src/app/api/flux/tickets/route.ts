import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { configuredRepository } from '@/lib/persistence'

export interface FluxTicket {
  id: string
  title: string
  category: 'authority_engine' | 'audience' | 'sales_engine' | 'control_tower' | 'hermes_agent' | 'n8n_integration' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_investigation' | 'resolved'
  description: string
  affectedCardOrProject?: string
  reportedBy: string
  createdAt: string
  resolutionNotes?: string
}

// Armazenamento em memória / eventos de tickets
const inMemoryTickets: FluxTicket[] = [
  {
    id: 'TCK-1001',
    title: 'Exemplo: Verificação de conectividade com Supabase Auth',
    category: 'control_tower',
    severity: 'low',
    status: 'resolved',
    description: 'Suporte à autenticação com e-mail e senha configurado com sucesso.',
    reportedBy: 'Sergio',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    resolutionNotes: 'Resolvido com suporte nativo em auth.ts.',
  }
]

export async function GET() {
  return NextResponse.json({ tickets: inMemoryTickets }, { status: 200 })
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<FluxTicket>

    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Título e descrição são obrigatórios para abrir um ticket.' }, { status: 400 })
    }

    const ticketId = `TCK-${Date.now().toString().slice(-4)}`
    const newTicket: FluxTicket = {
      id: ticketId,
      title: body.title,
      category: body.category || 'other',
      severity: body.severity || 'medium',
      status: 'open',
      description: body.description,
      affectedCardOrProject: body.affectedCardOrProject || 'Geral',
      reportedBy: body.reportedBy || 'Usuário',
      createdAt: new Date().toISOString(),
    }

    inMemoryTickets.unshift(newTicket)

    // Registra evento no Flux se disponível
    try {
      const repo = configuredRepository()
      if (repo && 'update' in repo) {
        await repo.update((state) => {
          state.events.push({
            id: `EVT-${Date.now().toString().slice(-6)}`,
            time: new Date().toISOString(),
            actor: newTicket.reportedBy,
            action: `Ticket de Suporte Aberto [${newTicket.severity.toUpperCase()}]: ${newTicket.title}`,
          })
        })
      }
    } catch (err) {
      console.warn('[TICKETS] Aviso ao registrar evento no repositório:', err)
    }

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      message: 'Ticket registrado no Helpdesk com sucesso!',
    }, { status: 201 })
  } catch (error) {
    console.error('[TICKETS ERROR]', error)
    return jsonError(error)
  }
}
