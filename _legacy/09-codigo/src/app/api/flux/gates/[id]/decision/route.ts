import { NextResponse } from 'next/server'
import { decideGate, type GateDecision } from '../../../../../../lib/flux-repository'
import { jsonError } from '../../../../../../lib/api'
import { requireRole } from '../../../../../../lib/auth'

type Params = { params: Promise<{ id: string }> }
export async function POST(request: Request, { params }: Params) {
  try {
    const session = requireRole(request, 'gatekeeper')
    const body = await request.json() as { decision?: GateDecision }
    const { id } = await params
    return NextResponse.json(await decideGate(id, body.decision as GateDecision, { actor: session.actor, scope: 'local' }))
  } catch (error) { return jsonError(error) }
}
