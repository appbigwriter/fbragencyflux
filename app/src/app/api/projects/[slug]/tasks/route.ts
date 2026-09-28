import { NextResponse } from 'next/server';
import { getProjectDetail, countBacklogTasks } from '@/lib/projects';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const detail = await getProjectDetail(slug);
    const backlog = detail.backlog || '';

    const lines = backlog.split('\n');
    const tasks: Array<{ title: string; completed: boolean; rawLine: string }> = [];

    for (const line of lines) {
      if (line.trim().startsWith('- [')) {
        const isCompleted = line.trim().startsWith('- [x]') || line.trim().startsWith('- [X]');
        const title = line.replace(/^-\s*\[[ xX]\]\s*/, '').trim();
        tasks.push({
          title,
          completed: isCompleted,
          rawLine: line.trim()
        });
      }
    }

    const { completedTasks, totalTasks, percent } = countBacklogTasks(backlog);
    const hash = crypto.createHash('sha256').update(backlog).digest('hex').substring(0, 12);
    const revisionId = `rev-${hash}`;

    return NextResponse.json({
      success: true,
      project: slug,
      gestorName: detail.metadata.gestorName,
      totalTasks,
      completedTasks,
      percentComplete: percent,
      revisionId,
      tasks
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Revision-Id': revisionId
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
