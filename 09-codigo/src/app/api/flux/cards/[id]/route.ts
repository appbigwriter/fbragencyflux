import { NextResponse } from 'next/server'
import { getState, transitionCard, type CardStatus } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
type Params = { params: Promise<{ id: string }> }
export async function GET(_: Request, { params }: Params) { try { const { id } = await params; const state = await getState(); const card = state.cards.find((c) => c.id === id); if (!card) return NextResponse.json({ error: 'CARD_NOT_FOUND' }, { status: 404 }); return NextResponse.json({ card, artifacts: state.artifacts.filter((a) => a.cardId === id), handoffs: state.handoffs.filter((h) => h.cardId === id), approvals: state.approvals.filter((a) => a.cardId === id), events: state.events.filter((e) => e.cardId === id) }) } catch (e) { return jsonError(e) } }
async function handle(request: Request, { params }: Params) { try { const body = await request.json() as { status?: CardStatus; actor?: string; scope?: 'local'; reason?: string }; const { id } = await params; return NextResponse.json(await transitionCard(id, body.status as CardStatus, { actor: body.actor || '', scope: body.scope as 'local' }, undefined, body.reason)) } catch (e) { return jsonError(e) } }
export const POST = handle
export const PATCH = handle
