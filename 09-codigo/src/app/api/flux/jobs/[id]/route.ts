import { NextResponse } from 'next/server'
import { getJob, updateJobEvent, type AgentRunEvent, type AgentRun } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
type Params = { params: Promise<{ id: string }> }
export async function GET(_: Request, { params }: Params) { try { return NextResponse.json(await getJob((await params).id)) } catch (e) { return jsonError(e) } }
export async function PATCH(request: Request, { params }: Params) {
  try { const session = requireRole(request, 'operator'); const body = await request.json() as Partial<AgentRun> & { event?: AgentRunEvent; actor?: string }; const { id } = await params; const { event, actor: _actor, ...patch } = body; if (!event) return NextResponse.json({ error: 'EVENT_REQUIRED', message: 'event is required for a run update' }, { status: 400 }); return NextResponse.json(await updateJobEvent(id, event, patch, { actor: session.actor, scope: 'local' })) } catch (e) { return jsonError(e) }
}
