import { NextResponse } from 'next/server'
import { forwardBlocker, type ForwardInteraction } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const session = requireRole(request, 'operator')
    const body = await request.json() as { cardId?: string; jobId?: string; correlationId?: string; tenantId?: string; actor?: string; resolutionAction?: Record<string, string>; interaction?: ForwardInteraction }
    const { id } = await params
    return NextResponse.json(await forwardBlocker(id, { cardId: body.cardId, jobId: body.jobId, correlationId: body.correlationId || '', tenantId: body.tenantId, resolutionAction: body.resolutionAction, interaction: body.interaction }, { actor: session.actor, scope: 'local' }, process.env.NODE_ENV === 'production' ? undefined : process.env.FLUX_DATA_FILE))
  } catch (error) { return jsonError(error) }
}
