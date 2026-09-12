import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { transitionCard, type CardStatus } from '@/lib/flux-repository'

type Params = { params: Promise<{ id: string }> }

async function handle(request: Request, { params }: Params) {
  try {
    const body = await request.json() as { status?: CardStatus; actor?: string; scope?: 'local' }
    const { id } = await params
    return NextResponse.json(await transitionCard(id, body.status as CardStatus, { actor: body.actor || '', scope: body.scope as 'local' }))
  } catch (error) { return jsonError(error) }
}
export const POST = handle
export const PATCH = handle
