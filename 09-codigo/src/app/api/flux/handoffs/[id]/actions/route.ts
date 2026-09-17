import { NextRequest, NextResponse } from 'next/server'
import { forwardBlocker, getState, resumeHandoff, resumeLegacyHandoff } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { requireRole } from '@/lib/auth'
export async function POST(request: NextRequest, {params}:{params:Promise<{id:string}>}) {
 try {
  const session = requireRole(request, 'coordinator')
  const body = await request.json()
  const {id} = await params
  const {action, owner, notes, correlationId} = body as {action:string;owner?:string;notes?:string;correlationId:string}
  if (!correlationId?.trim()) return NextResponse.json({error:'CORRELATION_REQUIRED',message:'correlationId is required'},{status:400})
  const state = await getState()
  const handoff = state.handoffs.find(h=>h.id===id)
  if (!handoff) return NextResponse.json({error:'HANDOFF_NOT_FOUND',message:`Handoff ${id} not found`},{status:404})
  const idempotent = state.events.some(e=>e.action==='released handoff' && e.correlationId===correlationId)
  if (idempotent) return NextResponse.json({handoff, idempotent: true})
  if (action === 'resend' || action === 'reassign') {
   const to = action === 'reassign' ? owner : handoff.to
   if (!to?.trim()) return NextResponse.json({error:'OWNER_REQUIRED',message:'Owner é obrigatório'},{status:400})
   if (action === 'reassign' && to === handoff.to) return NextResponse.json({error:'SAME_OWNER',message:'Informe um novo agente, diferente do owner atual'},{status:400})
   const result = await forwardBlocker(handoff.blockerId || handoff.id, {cardId:handoff.cardId, jobId:handoff.jobId, correlationId, resolutionAction:{from:session.actor, to, objective:handoff.summary, deliverable:handoff.done, acceptanceCriteria:handoff.acceptanceCriteria, evidenceRequired:handoff.evidenceRef, nextStep:handoff.nextStep, fallback:'Escalar a Sergio se o owner não entregar a evidência.'}, interaction:{message:notes, type:action, actor:session.actor, status:action==='reassign'?'reassigned':'resent'}}, {actor:session.actor, scope:'local'})
   if (result.handoff) return NextResponse.json({handoff:result.handoff, idempotent:false})
   return NextResponse.json({handoff:null, idempotent:false})
  }
  if (action === 'resume') {
   if (!notes?.trim() || !owner?.trim()) return NextResponse.json({error:'SOLUTION_REQUIRED',message:'cause, solution, nextAction and owner are required'},{status:422})
   const result = await resumeHandoff(id, {action:'release', correlationId, cause:handoff.risks||handoff.summary, solution:notes, nextAction:handoff.nextStep, owner}, {actor:session.actor, scope:'local'})
   return NextResponse.json({handoff:result.handoff, idempotent:result.idempotent})
  }
  return NextResponse.json({error:'INVALID_ACTION',message:'Ação não suportada'},{status:400})
 } catch (e) { return jsonError(e) }
}