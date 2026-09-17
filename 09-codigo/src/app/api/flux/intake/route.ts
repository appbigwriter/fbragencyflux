import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
import { createProjectPlan, parseBriefing, persistIntake } from '@/lib/intake'

export async function POST(request: Request) {
  try {
    const session = requireRole(request, 'coordinator')
    const body = await request.json() as { briefing?: string; correlationId?: string; preview?: boolean }
    const projectInput = parseBriefing(body.briefing || '')
    const plan = createProjectPlan(projectInput, body.correlationId?.trim() || `intake-${projectInput.source.checksum.slice(0, 16)}`)
    if (body.preview) return NextResponse.json({ preview: true, project: plan.project, input: plan.input, cards: plan.cards, jobs: plan.jobs, correlationId: plan.jobs[0]?.correlationId }, { status: 200 })
    const persisted = await persistIntake(plan, { actor: session.actor, scope: 'local' })
    return NextResponse.json({ preview: false, project: persisted.project, input: persisted.input, cards: persisted.cards, jobs: persisted.jobs, correlationId: persisted.jobs[0]?.correlationId, receipt: persisted.receipt }, { status: 201 })
  } catch (error) { return jsonError(error) }
}
