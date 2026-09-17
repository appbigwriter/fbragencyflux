import type { Handoff } from './flux-repository'
export type HandoffAction = 'resend' | 'reassign' | 'approve' | 'reject'
export type HandoffActionPayload = {action:HandoffAction;owner?:string;notes?:string;correlationId:string}
export async function performHandoffAction(current: Pick<Handoff,'id'|'to'>, input: HandoffActionPayload, transport: typeof fetch = fetch): Promise<{handoff:Handoff;items:Handoff[]}> {
 const notes=input.notes?.trim(), owner=input.owner?.trim()
 if ((input.action==='approve' || input.action==='reject') && !notes) throw new Error('Observações são obrigatórias para aprovar ou reprovar.')
 if(input.action==='reassign' && (!owner || owner===current.to)) throw new Error('Informe um novo agente, diferente do owner atual.')
 if(!input.correlationId.trim()) throw new Error('Correlação obrigatória.')
 const payload:HandoffActionPayload={action:input.action,correlationId:input.correlationId,...(notes?{notes}:{}),...(input.action==='reassign'?{owner}:input.action==='resend'?{owner:current.to}:{})}
 const response=await transport(`/api/flux/handoffs/${encodeURIComponent(current.id)}/actions`,{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify(payload)})
 const body=await response.json().catch(()=>null)
 if(!response.ok) throw new Error(body?.message || 'Não foi possível registrar a ação.')
 if(!body?.handoff?.id) throw new Error('Resposta sem Handoff; leitura de volta não confirmada.')
 const readback=await transport('/api/flux/handoffs',{cache:'no-store',credentials:'same-origin'})
 const items=await readback.json().catch(()=>null)
 if(!readback.ok || !Array.isArray(items)) throw new Error('Ação recebida, mas a leitura de volta falhou. Atualize antes de tentar novamente.')
 const handoff=items.find((item:Handoff)=>item.id===body.handoff.id) as Handoff|undefined
 if(!handoff || ['to','status','correlationId','lastUpdate'].some(key=>body.handoff[key]!==undefined && handoff[key as keyof Handoff]!==body.handoff[key])) throw new Error('Ação recebida, mas a leitura de volta diverge. Atualize antes de tentar novamente.')
 return {handoff,items}
}
