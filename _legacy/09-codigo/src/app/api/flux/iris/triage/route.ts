import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
import { runIrisTriage } from '@/lib/flux-repository'

export async function POST(request: Request) {
  try {
    const session = requireRole(request, 'coordinator')
    const body = await request.json() as { handoff?: Record<string, unknown>; blockerId?: string; tenantId?: string; plan?: string; trigger?: 'intake' | 'handoff' | 'event'; correlationId?: string; dryRun?: boolean }
    return NextResponse.json(await runIrisTriage({ handoff: body.handoff as never, blockerId: body.blockerId, tenantId: body.tenantId, plan: body.plan, trigger: body.trigger, correlationId: body.correlationId || '', dryRun: body.dryRun }, { actor: session.actor, scope: 'local' }))
  } catch (error) { return jsonError(error) }
}
