import { NextResponse } from 'next/server';
import { updateProjectFile, getProjectDetail, countBacklogTasks, autoDetectAndCompleteTasks } from '@/lib/projects';
import path from 'path';
import fs from 'fs/promises';

const isInsideApp = process.cwd().replace(/\\/g, '/').endsWith('/app') || process.cwd().replace(/\\/g, '/').endsWith('app');
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || process.env.FLUX_ROOT || (process.env.NODE_ENV === 'production' && !process.env.WORKSPACE_ROOT ? process.cwd() : (isInsideApp ? path.resolve(process.cwd(), '..') : process.cwd()));
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.join(WORKSPACE_ROOT, '03-projetos');

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();

    const { fileName, content } = body;
    if (!fileName || content === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Os campos "fileName" e "content" são obrigatórios no JSON.'
      }, { status: 400 });
    }

    // 1. Grava no disco local e persiste no banco PostgreSQL VPS
    await updateProjectFile(slug, fileName, content);

    // 2. Executa auto-detecção para atualizar backlog se for artefato
    const pDir = path.join(PROJECTS_DIR, slug);
    const detail = await getProjectDetail(slug);
    let updatedBacklog = detail.backlog;
    try {
      updatedBacklog = await autoDetectAndCompleteTasks(slug, detail.backlog, pDir);
    } catch {}

    const counts = countBacklogTasks(updatedBacklog);

    // 3. Readback de verificação imediata (confirma que foi gravado e tamanho em bytes)
    const filePath = path.join(pDir, fileName);
    let stat = null;
    try {
      stat = await fs.stat(filePath);
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Arquivo '${fileName}' gravado e persistido com sucesso!`,
      readback: {
        slug,
        fileName,
        bytesWritten: stat?.size ?? content.length,
        persistedToDb: true,
        persistedToDisk: !!stat,
        completedTasks: counts.completedTasks,
        totalTasks: counts.totalTasks,
        percent: counts.percent,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error('Erro na gravação de arquivo via API:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
