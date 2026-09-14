import { NextResponse } from 'next/server'
import { forwardBlocker } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const session = requireRole(request, 'operator')
    const body = await request.json() as { cardId?: string; jobId?: string; correlationId?: string; actor?: string; resolutionAction?: Record<string, string> }
    const { id } = await params
    return NextResponse.json(await forwardBlocker(id, { cardId: body.cardId, jobId: body.jobId, correlationId: body.correlationId || '', resolutionAction: body.resolutionAction }, { actor: session.actor, scope: 'local' }))
  } catch (error) { return jsonError(error) }
}
