import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
import { createProjectPlan, parseBriefing, persistIntake } from '@/lib/intake'

export async function POST(request: Request) {
  try {
    const session = requireRole(request, 'coordinator')
    const body = await request.json() as { briefing?: string; correlationId?: string }
    const projectInput = parseBriefing(body.briefing || '')
    const plan = createProjectPlan(projectInput, body.correlationId?.trim() || `intake-${projectInput.source.checksum.slice(0, 16)}`)
    const persisted = await persistIntake(plan, { actor: session.actor, scope: 'local' })
    return NextResponse.json({ project: persisted.project, input: persisted.input, cards: persisted.cards, jobs: persisted.jobs, correlationId: persisted.jobs[0]?.correlationId, receipt: persisted.receipt }, { status: 201 })
  } catch (error) { return jsonError(error) }
}
