import { NextResponse } from 'next/server'
import { createApproval, getState } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
export async function GET() { try { return NextResponse.json((await getState()).approvals) } catch (e) { return jsonError(e) } }
export async function POST(request: Request) { try { const session = requireRole(request, 'operator'); const body = await request.json(); const { actor: _actor, authScope: _authScope, actionScope, ...rest } = body; return NextResponse.json(await createApproval({ ...rest, scope: actionScope || body.scope || '', requestedBy: session.actor }, { actor: session.actor, scope: 'local' }, undefined), { status: 201 }) } catch (e) { return jsonError(e) } }
