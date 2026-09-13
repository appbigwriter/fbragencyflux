import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { approveApproval, type ApprovalStatus } from '@/lib/flux-repository'
import { requireRole } from '@/lib/auth'

type Params = { params: Promise<{ id: string }> }
export async function POST(request: Request, { params }: Params) {
  try {
    const session = requireRole(request, 'gatekeeper')
    const body = await request.json() as { decision?: ApprovalStatus }
    const { id } = await params
    return NextResponse.json(await approveApproval(id, body.decision as Exclude<ApprovalStatus, 'pending'>, { actor: session.actor, scope: 'local' }))
  } catch (error) { return jsonError(error) }
}
