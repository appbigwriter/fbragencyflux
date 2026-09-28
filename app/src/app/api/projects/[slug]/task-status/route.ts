import { NextResponse } from 'next/server';
import { setProjectTaskStatus } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const taskIdentifier = body.task || body.taskName || body.taskId || body.deliverable || body.title;

    if (!taskIdentifier) {
      return NextResponse.json({
        success: false,
        error: 'Campo obrigatório ausente: taskIdentifier (ex: "Artigo 04 — Hyaluronic Acid" ou "02-conteudo/artigo-04.md")'
      }, { status: 400 });
    }

    const result = await setProjectTaskStatus(slug, {
      taskIdentifier,
      newStatus: body.newStatus !== undefined ? Boolean(body.newStatus) : (body.status !== undefined ? Boolean(body.status) : true),
      author: body.author || body.agent || 'Heidi Braun Manager',
      expectedRevisionId: body.expectedRevisionId || body.revisionId
    });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Revision-Id': result.revisionId
      }
    });
  } catch (err: any) {
    const isConflict = err.message.includes('CONFLITO DE VERSÃO');
    return NextResponse.json({
      success: false,
      error: err.message,
      conflict: isConflict
    }, { status: isConflict ? 409 : 500 });
  }
}
