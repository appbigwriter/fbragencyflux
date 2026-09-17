import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
import { createSprint, createStory, listPlanning } from '@/lib/planning'
export async function GET(request: Request) { try { return NextResponse.json(await listPlanning(process.env.NODE_ENV === 'test' ? process.env.FLUX_DATA_FILE : undefined)) } catch (e) { return jsonError(e) } }
export async function POST(request: Request) { try { const session = requireRole(request, 'coordinator'); const body = await request.json() as { type?: 'sprint'|'story'; input?: any }; if (body.type === 'sprint') return NextResponse.json(await createSprint(body.input, { actor: session.actor, scope: 'local' }), { status: 201 }); if (body.type === 'story') return NextResponse.json(await createStory(body.input, { actor: session.actor, scope: 'local' }), { status: 201 }); return NextResponse.json({ error: 'INVALID_TYPE', message: 'type must be sprint or story' }, { status: 422 }) } catch (e) { return jsonError(e) } }
