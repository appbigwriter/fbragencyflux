import { getScopedSnapshot } from '@/lib/flux-repository'
import { publicReadScope } from '@/lib/read-scope'
import HandoffsClient from './handoffs-client'
export const dynamic = 'force-dynamic'
export default async function HandoffsPage() {
  const scopes = publicReadScope()
  if (!scopes) return <main><h1>Agency Flux indisponível</h1><p>O escopo público do dashboard não está configurado.</p></main>
  let handoffs
  try { handoffs = (await getScopedSnapshot({ scopes, visibility: 'public' })).handoffs } catch { return <main><h1>Agency Flux indisponível</h1><p>Não foi possível ler o estado persistido.</p></main> }
  return <HandoffsClient initial={handoffs} />
}
