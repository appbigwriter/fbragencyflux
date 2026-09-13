import { NextResponse } from 'next/server'
import { decideGate, type GateDecision } from '../../../../../../lib/flux-repository'
import { jsonError } from '../../../../../../lib/api'

type Params = { params: Promise<{ id: string }> }
export async function POST(request: Request, { params }: Params) {
  try {
    const body = await request.json() as { decision?: GateDecision; actor?: string; scope?: string }
    const { id } = await params
    return NextResponse.json(await decideGate(id, body.decision as GateDecision, { actor: body.actor || '', scope: body.scope as 'local' }))
  } catch (error) { return jsonError(error) }
}
