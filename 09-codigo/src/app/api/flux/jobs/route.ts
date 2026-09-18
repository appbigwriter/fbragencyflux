import { NextResponse } from 'next/server'
import { getScopedSnapshot, upsertJob, type AgentRun } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { getSession, requireRole } from '@/lib/auth'
import { readScopeFromRequest } from '@/lib/read-scope'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const scope = readScopeFromRequest(request)
    if (scope.visibility === 'private') getSession(request)
    const snapshot = await getScopedSnapshot(scope, process.env.NODE_ENV === 'test' ? process.env.FLUX_DATA_FILE : undefined)
    const filters = { agent: url.searchParams.get('agent') || undefined, status: url.searchParams.get('status') || undefined, card: url.searchParams.get('card') || undefined }
    const jobs = (snapshot.jobs || [])
      .filter((job) => (!filters.agent || job.agent === filters.agent) && (!filters.status || job.status === filters.status) && (!filters.card || job.cardId === filters.card))
    return NextResponse.json({ jobs, realtime: false, source: 'scoped relational/local readback', limitation: 'Readback respects explicit tenant/project scope; realtime depends on dispatcher/runtime events' })
  } catch (e) { return jsonError(e) }
}
export async function POST(request: Request) {
  try { const session = requireRole(request, 'operator'); const body = await request.json() as Partial<AgentRun> & { actor?: string }; const { actor: _actor, ...input } = body; return NextResponse.json(await upsertJob(input, { actor: session.actor, scope: 'local' }), { status: 201 }) } catch (e) { return jsonError(e) }
}
