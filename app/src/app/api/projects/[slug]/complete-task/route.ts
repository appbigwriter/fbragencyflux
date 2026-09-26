import { NextResponse } from 'next/server';
import { completeProjectTask } from '@/lib/projects';

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const identifier = body.taskName || body.deliverable || body.task || body.id;

    if (!identifier) {
      return NextResponse.json({
        success: false,
        error: 'É necessário informar taskName ou deliverable (ex: "01-pesquisa/analise-nicho.md" ou "Briefing e Escopo Definido")'
      }, { status: 400 });
    }

    const result = await completeProjectTask(slug, identifier);
    return NextResponse.json({
      success: true,
      message: `Tarefa '${identifier}' marcada como concluída com sucesso!`,
      completedTasks: result.completedTasks,
      totalTasks: result.totalTasks,
      percentComplete: Math.round((result.completedTasks / (result.totalTasks || 1)) * 100)
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
