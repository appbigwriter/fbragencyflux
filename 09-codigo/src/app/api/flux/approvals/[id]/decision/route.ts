import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { approveApproval, type ApprovalStatus } from '@/lib/flux-repository'

type Params = { params: Promise<{ id: string }> }
export async function POST(request: Request, { params }: Params) {
  try {
    const body = await request.json() as { decision?: ApprovalStatus; actor?: string; scope?: 'local' }
    const { id } = await params
    return NextResponse.json(await approveApproval(id, body.decision as Exclude<ApprovalStatus, 'pending'>, { actor: body.actor || '', scope: body.scope as 'local' }))
  } catch (error) { return jsonError(error) }
}
