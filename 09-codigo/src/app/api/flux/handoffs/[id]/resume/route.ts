import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
import { resumeHandoff } from '@/lib/flux-repository'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = requireRole(request, 'coordinator')
    const body = await request.json()
    return NextResponse.json(await resumeHandoff((await params).id, body, { actor: session.actor, scope: 'local' }))
  } catch (error) { return jsonError(error) }
}
