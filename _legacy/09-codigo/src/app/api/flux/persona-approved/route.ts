import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
import { receivePersonaApproved, type PersonaApprovedEnvelope } from '@/lib/persona-approved'

/** Local-only contract boundary; no Authority, Blogs, Control Tower or network call. */
export async function POST(request: Request) {
  try {
    const session = requireRole(request, 'coordinator')
    const envelope = await request.json() as PersonaApprovedEnvelope
    const result = await receivePersonaApproved(envelope, { actor: session.actor, scope: 'local' })
    return NextResponse.json(result, { status: result.status === 'failed' ? 502 : 200 })
  } catch (error) { return jsonError(error) }
}
