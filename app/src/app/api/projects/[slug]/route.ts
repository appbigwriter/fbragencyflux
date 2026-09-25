import { NextResponse } from 'next/server';
import { getProjectDetail, updateProjectFile } from '@/lib/projects';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const detail = await getProjectDetail(slug);
    return NextResponse.json({ success: true, project: detail });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { fileName, content } = await req.json();

    if (!fileName || content === undefined) {
      return NextResponse.json({ success: false, error: 'Nome do arquivo e conteúdo são obrigatórios' }, { status: 400 });
    }

    await updateProjectFile(slug, fileName, content);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
