import { NextResponse } from 'next/server'
import { createHandoff, getState } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
export async function GET() { try { return NextResponse.json((await getState()).handoffs.map((handoff) => ({ ...handoff, status: handoff.status || 'received' }))) } catch (e) { return jsonError(e) } }
export async function POST(request: Request) { try { const session = requireRole(request, 'coordinator'); const body = await request.json(); if (body.from && body.from !== session.actor) return NextResponse.json({ error: 'OWNERSHIP_REQUIRED', message: 'Handoff origin must match authenticated actor' }, { status: 403 }); return NextResponse.json(await createHandoff({ ...body, from: session.actor }, { actor: session.actor, scope: 'local' }, undefined), { status: 201 }) } catch (e) { return jsonError(e) } }
