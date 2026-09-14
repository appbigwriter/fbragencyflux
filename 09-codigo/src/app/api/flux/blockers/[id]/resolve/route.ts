import { NextResponse } from 'next/server'
import { resolveBlocker } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = requireRole(request, 'operator')
    const body = await request.json() as { cardId?: string; evidenceRef?: string; artifactId?: string; correlationId?: string }
    const { id } = await params
    return NextResponse.json(await resolveBlocker(id, { cardId: body.cardId, evidenceRef: body.evidenceRef || '', artifactId: body.artifactId, correlationId: body.correlationId || '' }, { actor: session.actor, scope: 'local' }))
  } catch (error) { return jsonError(error) }
}