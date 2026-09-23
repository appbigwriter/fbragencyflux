import { NextResponse } from 'next/server'
import { getState } from '@/lib/flux-repository'
import { sanitizeError } from '@/lib/observability'

export async function GET() {
  try {
    const state = await getState()
    return NextResponse.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'agency',
      projectId: process.env.CONTROL_TOWER_PROJECT_ID || '9c8ababb-7cb6-4b67-b0a4-c9c6f9e78c2f',
      version: state.version,
      projectsCount: state.projects?.length || 0,
      activeJobs: (state.jobs || []).filter((j) => ['planned', 'started', 'in_progress', 'ready'].includes(j.status)).length,
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: sanitizeError(error),
    }, { status: 503 })
  }
}
