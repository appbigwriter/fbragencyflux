import { NextResponse } from 'next/server'
import { getJobs, upsertJob, type AgentRun } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'

export async function GET(request: Request) {
  try { const url = new URL(request.url); return NextResponse.json({ jobs: await getJobs(undefined, { agent: url.searchParams.get('agent') || undefined, status: url.searchParams.get('status') || undefined, card: url.searchParams.get('card') || undefined }), realtime: false, source: 'filesystem/Handoff readback', limitation: 'Filesystem é histórico; tempo real depende de eventos do dispatcher/runtime' }) } catch (e) { return jsonError(e) }
}
export async function POST(request: Request) {
  try { const session = requireRole(request, 'operator'); const body = await request.json() as Partial<AgentRun> & { actor?: string }; const { actor: _actor, ...input } = body; return NextResponse.json(await upsertJob(input, { actor: session.actor, scope: 'local' }), { status: 201 }) } catch (e) { return jsonError(e) }
}
