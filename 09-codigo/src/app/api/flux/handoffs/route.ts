import { NextResponse } from 'next/server'
import { createHandoff, getState } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
export async function GET() { try { return NextResponse.json((await getState()).handoffs) } catch (e) { return jsonError(e) } }
export async function POST(request: Request) { try { const body = await request.json(); return NextResponse.json(await createHandoff(body, { actor: String(body.actor || ''), scope: body.scope }, undefined), { status: 201 }) } catch (e) { return jsonError(e) } }
