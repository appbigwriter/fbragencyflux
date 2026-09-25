import { NextResponse } from 'next/server';
import { getProjectDetail, updateProjectFile, updateProjectMetadata } from '@/lib/projects';

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
    const body = await req.json();

    if (body.updateMetadata && body.data) {
      const result = await updateProjectMetadata(slug, body.data);
      return NextResponse.json({ success: true, result });
    }

    const { fileName, content } = body;
    if (!fileName || content === undefined) {
      return NextResponse.json({ success: false, error: 'Nome do arquivo e conteúdo são obrigatórios' }, { status: 400 });
    }

    await updateProjectFile(slug, fileName, content);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
