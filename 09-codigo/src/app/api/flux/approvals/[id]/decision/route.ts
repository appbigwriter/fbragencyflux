import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { approveApproval, FluxError, type ApprovalDecision } from '@/lib/flux-repository'
import { requireRole } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }
export async function POST(request: Request, { params }: Params) {
  try {
    const session = requireRole(request, 'gatekeeper')
    if (session.scope !== 'local') throw new FluxError('LOCAL_SCOPE_REQUIRED', 'Approval decisions require a local session', 403)
    const body = await request.json() as { decision?: ApprovalDecision; reason?: string; packageVersion?: number; version?: number; tenantId?: string; actor?: string; scope?: string }
    const { id } = await params
    return NextResponse.json(await approveApproval(id, body.decision as ApprovalDecision, { actor: session.actor, scope: 'local' }, undefined, { reason: body.reason, packageVersion: body.packageVersion, version: body.version, tenantId: body.tenantId }))
  } catch (error) { return jsonError(error) }
}
