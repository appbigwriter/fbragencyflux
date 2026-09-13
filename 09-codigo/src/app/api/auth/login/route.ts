import { NextResponse } from 'next/server'
import { authenticate, cookieHeader } from '../../../../lib/auth'
import { jsonError } from '../../../../lib/api'
export async function POST(request: Request) { try { const body = await request.json() as { actor?: string; secret?: string }; const result = authenticate(String(body.actor || ''), String(body.secret || '')); const response = NextResponse.json({ actor: result.actor.actor, scope: result.actor.scope, roles: result.actor.roles }); response.headers.set('set-cookie', cookieHeader(result.sessionId, result.actor.scope)); return response } catch (error) { return jsonError(error) } }
