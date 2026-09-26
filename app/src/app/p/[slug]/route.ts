import { NextResponse } from 'next/server';
import { getProjectDetail } from '@/lib/projects';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const detail = await getProjectDetail(slug);

    if (!detail || !detail.prompt) {
      return new NextResponse(`# Projeto '${slug}' não encontrado no FBR Agency Flux.\n`, {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Monta um documento markdown consolidado perfeito para consumo direto por agentes Hermes
    const consolidatedContext = `
${detail.prompt}

---

# ANEXO I: BRIEFING COMPLETO DO PROJETO
${detail.brief || 'Nenhum brief.md cadastrado.'}

---

# ANEXO II: BACKLOG DE ENTREGÁVEIS ATUALIZADO
${detail.backlog || 'Nenhum backlog.md cadastrado.'}

---

# ANEXO III: 📢 OBSERVAÇÕES, FEEDBACKS E COBRANÇAS ATIVAS (UPDATES)
${detail.updates || 'Nenhum updates.md cadastrado.'}
`.trim();

    return new NextResponse(consolidatedContext, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    return new NextResponse(`Erro ao carregar contexto do projeto: ${err.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}
