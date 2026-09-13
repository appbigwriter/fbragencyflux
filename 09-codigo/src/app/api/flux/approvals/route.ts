import { NextResponse } from 'next/server'
import { createApproval, getState } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
export async function GET() { try { return NextResponse.json((await getState()).approvals) } catch (e) { return jsonError(e) } }
export async function POST(request: Request) { try { const body = await request.json(); const { actor, authScope, actionScope, ...rest } = body; return NextResponse.json(await createApproval({ ...rest, scope: actionScope || body.scope || '' }, { actor: String(actor || ''), scope: (authScope || 'local') as 'local' }, undefined), { status: 201 }) } catch (e) { return jsonError(e) } }
