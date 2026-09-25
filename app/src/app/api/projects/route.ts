import { NextResponse } from 'next/server';
import { listProjects, createProject } from '@/lib/projects';
import { ProjectCreationData } from '@/lib/generator';

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data: ProjectCreationData = await req.json();

    if (!data.name || !data.slug) {
      return NextResponse.json({ success: false, error: 'Nome e slug são obrigatórios' }, { status: 400 });
    }

    const result = await createProject(data);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
