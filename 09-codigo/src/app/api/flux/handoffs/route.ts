import { NextResponse } from 'next/server'
import { createHandoff, getScopedSnapshot } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { getSession, requireRole } from '@/lib/auth'
import { readScopeFromRequest } from '@/lib/read-scope'

export async function GET(request: Request) {
 try {
  const scope = readScopeFromRequest(request)
  if (scope.visibility === 'private') getSession(request)
  return NextResponse.json((await getScopedSnapshot(scope, process.env.NODE_ENV === 'test' ? process.env.FLUX_DATA_FILE : undefined)).handoffs.map((handoff) => ({ ...handoff, status: handoff.status || 'received' })))
 } catch (e) { return jsonError(e) }
}
export async function POST(request: Request) {
 try {
  const session = requireRole(request, 'coordinator')
  const body = await request.json()
  if (body.from && body.from !== session.actor) return NextResponse.json({ error: 'OWNERSHIP_REQUIRED', message: 'Handoff origin must match authenticated actor' }, { status: 403 })
  return NextResponse.json(await createHandoff({ ...body, from: session.actor }, { actor: session.actor, scope: 'local' }, undefined), { status: 201 })
 } catch (e) { return jsonError(e) }
}
