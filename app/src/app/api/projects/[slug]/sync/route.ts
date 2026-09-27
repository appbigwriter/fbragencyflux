import { NextRequest, NextResponse } from 'next/server';
import { syncProjectFromDiskAndAgent } from '@/lib/projects';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug do projeto é obrigatório' }, { status: 400 });
    }

    const result = await syncProjectFromDiskAndAgent(slug);
    const proj = result.projects.find(p => p.slug === slug);

    return NextResponse.json({
      success: true,
      slug,
      completedTasks: proj?.completedTasks ?? 0,
      totalTasks: proj?.totalTasks ?? 0,
      percent: proj?.percent ?? 0,
      message: `Backlog do agente '${slug}' sincronizado com sucesso! ${proj?.completedTasks ?? 0}/${proj?.totalTasks ?? 0} tarefas concluídas.`,
      projects: result.projects
    });
  } catch (err: any) {
    console.error('Erro na rota POST /api/projects/[slug]/sync:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao sincronizar projeto' },
      { status: 500 }
    );
  }
}
