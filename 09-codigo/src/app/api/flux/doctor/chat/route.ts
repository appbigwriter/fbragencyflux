import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { getSnapshot } from '@/lib/flux-repository'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

const KNOWLEDGE_BASE: Record<string, string> = {
  'authority_engine': 'O **Authority Engine** é a fase 1 da esteira da FBR Agency. É responsável por definir a persona, o briefing de autoridade, diretrizes de marca e pesquisa inicial de referências através da **Bia** e da **Íris**.',
  'audience': 'O **Audience Builder** é a fase 2 da esteira. Responsável por estruturar a audiência, segmentação, mapeamento de dores e público-alvo com apoio de **Caio** e **Rick** (pesquisa de mercado e afiliados).',
  'sales_engine': 'O **Sales Engine** é a fase 3 da esteira. Criação das cartas de vendas, copys de conversão, páginas, ofertas e canais de tráfego com **Caio**, **Lia** (design) e **Rafa** (mídia).',
  'control_tower': 'O **Control Tower** é a fase 4 da esteira. Gerencia o provisionamento de banco de dados no Supabase, domínios, DNS, deploy e integrações de produção com **Théo**, **Kora** e **Gabe** (QA).',
  'gates': 'Os **Gates (G0 a G4)** são pontos de parada obrigatórios onde apenas **Sergio** pode aprovar:\n- **G0 — Escopo**: Briefing completo\n- **G1 — Fundação**: Arquitetura e schema aprovados\n- **G2 — Produção**: Artefatos e QA verificados\n- **G3 — Sergio**: Autorização formal para deploy, gasto ou publicação\n- **G4 — Verificação**: Confirmação do estado em produção e encerramento.',
  'iris': '**Íris** é a Agente Coordenadora Geral. Ela lê o briefing, decompõe o escopo em trilhas operacionais, calcula as dependências entre tarefas e coordena os Handoffs entre todos os agentes especialistas.',
  'n8n': 'O **N8N** atua como *Glue Code* (disparador e conector). Ele ouve os webhooks de novos cards no Flux, formata os prompts com contexto e chama a API dos agentes Hermes, além de enviar alertas no Telegram para Sergio.',
}

function generateDoctorResponse(prompt: string, snapshotData?: any): string {
  const query = prompt.toLowerCase()

  if (query.includes('diagnost') || query.includes('status') || query.includes('problema') || query.includes('erro') || query.includes('/diagnose')) {
    const blockers = snapshotData?.blockers || []
    const pendingGates = snapshotData?.pendingGates || 0
    const activeCards = snapshotData?.activeCards || 0

    let diag = `🩺 **Diagnóstico do Sistema Agency Flux:**\n\n`
    diag += `• **Cards Ativos:** ${activeCards}\n`
    diag += `• **Gates Pendentes de Aprovação:** ${pendingGates}\n`
    diag += `• **Blockers Abertos:** ${blockers.length}\n\n`

    if (blockers.length > 0) {
      diag += `⚠️ **Atenção aos seguintes blockers:**\n`
      blockers.forEach((b: any, idx: number) => {
        diag += `${idx + 1}. *${b.id}*: ${b.cause} (Owner: ${b.owner || 'Não declarado'})\n`
      })
      diag += `\n*Recomendação:* Acesse o painel de "Atenção Necessária" no Dashboard para encaminhar a resolução ou abrir um ticket no Manual.`
    } else {
      diag += `✅ **Nenhum blocker impeditivo no momento.** O fluxo está operando normalmente.`
    }
    return diag
  }

  if (query.includes('gate') || query.includes('aprova')) return KNOWLEDGE_BASE['gates']
  if (query.includes('iris') || query.includes('íris') || query.includes('coorden')) return KNOWLEDGE_BASE['iris']
  if (query.includes('authority')) return KNOWLEDGE_BASE['authority_engine']
  if (query.includes('audience')) return KNOWLEDGE_BASE['audience']
  if (query.includes('sales')) return KNOWLEDGE_BASE['sales_engine']
  if (query.includes('control tower') || query.includes('deploy') || query.includes('banco')) return KNOWLEDGE_BASE['control_tower']
  if (query.includes('n8n') || query.includes('webhook') || query.includes('carteiro')) return KNOWLEDGE_BASE['n8n']
  if (query.includes('ticket') || query.includes('ajuda') || query.includes('manual')) {
    return 'Você pode consultar a documentação completa e abrir chamados diretamente no **FluxManual** através da página `/manual` no menu ou formulário de tickets.'
  }

  return `Olá! Sou o **FluxDoctor**, seu assistente de diagnóstico e suporte da FBR Agency.\n\nPosso te ajudar com:\n1. 🔍 **Diagnóstico do Sistema** (digite \`/diagnose\` ou "verificar status")\n2. 📋 **Regras da Esteira** (Authority → Audience → Sales → Control Tower)\n3. 🤖 **Papéis dos Agentes Hermes** (Íris, Bia, Théo, Caio, Lia...)\n4. 🛡️ **Central de Aprovações & Gates (G0 a G4)**\n5. 🎫 **Abertura de Tickets no FluxManual**\n\nComo posso ajudar você agora?`
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages?: ChatMessage[] }
    const messages = body.messages || []
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || ''

    // Obtém snapshot para contextualizar diagnóstico se possível
    let snapshot
    try {
      snapshot = await getSnapshot()
    } catch {}

    const reply = generateDoctorResponse(lastUserMessage, snapshot)

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      },
    }, { status: 200 })
  } catch (error) {
    console.error('[FLUX DOCTOR CHAT ERROR]', error)
    return jsonError(error)
  }
}
