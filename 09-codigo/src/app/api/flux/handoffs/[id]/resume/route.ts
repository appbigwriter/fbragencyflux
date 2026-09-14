import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
import { resumeHandoff, resumeLegacyHandoff } from '@/lib/flux-repository'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = requireRole(request, 'coordinator')
    const body = await request.json()
    const id = (await params).id
    const current = (await import('@/lib/flux-repository')).getState
    const handoff = (await current()).handoffs.find((item) => item.id === id)
    if (body.action === 'resume' && (handoff?.historical || handoff?.legacy || handoff?.status === 'legacy')) return NextResponse.json(await resumeLegacyHandoff(id, body, { actor: session.actor, scope: 'local' }))
    return NextResponse.json(await resumeHandoff(id, body, { actor: session.actor, scope: 'local' }))
  } catch (error) { return jsonError(error) }
}
