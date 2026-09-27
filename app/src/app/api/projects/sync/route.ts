import { NextRequest, NextResponse } from 'next/server';
import { syncProjectFromDiskAndAgent } from '@/lib/projects';

export async function POST(req: NextRequest) {
  try {
    let slug: string | undefined = undefined;
    try {
      const body = await req.json();
      if (body?.slug) slug = body.slug;
    } catch {}

    const searchParams = req.nextUrl.searchParams;
    if (!slug && searchParams.get('slug')) {
      slug = searchParams.get('slug') as string;
    }

    const result = await syncProjectFromDiskAndAgent(slug);
    return NextResponse.json({
      success: true,
      message: slug
        ? `Projeto '${slug}' sincronizado com sucesso com os artefatos e backlog do agente!`
        : `Todos os ${result.syncedCount} projetos foram sincronizados com os backlogs dos agentes!`,
      ...result
    });
  } catch (err: any) {
    console.error('Erro na rota POST /api/projects/sync:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Erro ao sincronizar projetos' },
      { status: 500 }
    );
  }
}
