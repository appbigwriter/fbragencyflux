import { NextResponse } from 'next/server';
import { getProjectDetail, countBacklogTasks } from '@/lib/projects';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const detail = await getProjectDetail(slug);
    const counts = countBacklogTasks(detail.backlog);

    return NextResponse.json({
      success: true,
      canonical: {
        slug: detail.slug,
        name: detail.metadata.name,
        gestorName: detail.metadata.gestorName,
        niche: detail.metadata.niche,
        domain: detail.metadata.domain,
        language: detail.metadata.language,
        progress: {
          completedTasks: counts.completedTasks,
          totalTasks: counts.totalTasks,
          percent: counts.percent
        },
        hasBrief: !!detail.brief,
        hasBacklog: !!detail.backlog,
        hasPrompt: !!detail.prompt,
        hasUpdates: !!detail.updates,
        pendingUpdatesCount: detail.pendingUpdatesCount,
        filesCount: detail.files.length,
        files: detail.files,
        timestamp: new Date().toISOString()
      },
      content: {
        brief: detail.brief,
        backlog: detail.backlog,
        prompt: detail.prompt,
        updates: detail.updates
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
