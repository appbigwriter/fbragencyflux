import { it, expect, vi } from 'vitest'
import { performHandoffAction } from '../src/lib/ui-handoff-actions'
it('requires notes for decisions and a different owner for reassignment before transport', async () => {
 const transport=vi.fn()
 await expect(performHandoffAction({id:'h',to:'Kora'},{action:'reject',notes:' ',correlationId:'c'},transport)).rejects.toThrow('Observações')
 await expect(performHandoffAction({id:'h',to:'Kora'},{action:'approve',correlationId:'c'},transport)).rejects.toThrow('Observações')
 await expect(performHandoffAction({id:'h',to:'Kora'},{action:'reassign',owner:'Kora',correlationId:'c'},transport)).rejects.toThrow('novo agente')
 expect(transport).not.toHaveBeenCalled()
})
it('uses authenticated same-origin action then GET no-store exact readback', async () => {
 const saved={id:'h/a',to:'Íris',status:'awaiting_owner',correlationId:'c'}
 const transport=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({handoff:saved}))).mockResolvedValueOnce(new Response(JSON.stringify([saved])))
 const result=await performHandoffAction({id:'h/a',to:'Kora'},{action:'reassign',owner:'Íris',correlationId:'c'},transport)
 expect(transport.mock.calls[0][0]).toBe('/api/flux/handoffs/h%2Fa/actions')
 expect(JSON.parse(transport.mock.calls[0][1].body)).toEqual({action:'reassign',owner:'Íris',correlationId:'c'})
 expect(transport.mock.calls[1]).toEqual(['/api/flux/handoffs',{cache:'no-store',credentials:'same-origin'}])
 expect(result.handoff).toEqual(saved)
})
it('does not claim success when mutation fails or readback does not contain target', async () => {
 const failed=vi.fn().mockResolvedValue(new Response(JSON.stringify({message:'Sessão expirada'}),{status:401}))
 await expect(performHandoffAction({id:'h',to:'Kora'},{action:'resend',correlationId:'c'},failed)).rejects.toThrow('Sessão expirada')
 const missing=vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({handoff:{id:'h',to:'Kora'}}))).mockResolvedValueOnce(new Response('[]'))
 await expect(performHandoffAction({id:'h',to:'Kora'},{action:'resend',correlationId:'c'},missing)).rejects.toThrow('leitura de volta')
})
