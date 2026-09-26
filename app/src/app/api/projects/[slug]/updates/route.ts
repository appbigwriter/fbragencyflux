import { NextResponse } from 'next/server';
import { getProjectDetail, addProjectUpdate, toggleProjectUpdate } from '@/lib/projects';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const detail = await getProjectDetail(slug);
    return NextResponse.json({
      success: true,
      updates: detail.updates,
      pendingCount: detail.pendingUpdatesCount
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();

    if (!body.instruction) {
      return NextResponse.json({ success: false, error: 'Instrução / cobrança é obrigatória' }, { status: 400 });
    }

    const result = await addProjectUpdate(slug, {
      author: body.author || 'Sergio Castro (Publisher)',
      type: body.type || '⚡ Cobrança / Diretriz',
      instruction: body.instruction,
      deliverable: body.deliverable,
      priority: body.priority || 'Alta'
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await req.json();

    if (body.updateLine === undefined || body.currentlyChecked === undefined) {
      return NextResponse.json({ success: false, error: 'Parâmetros updateLine e currentlyChecked são obrigatórios' }, { status: 400 });
    }

    const result = await toggleProjectUpdate(slug, body.updateLine, body.currentlyChecked);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
