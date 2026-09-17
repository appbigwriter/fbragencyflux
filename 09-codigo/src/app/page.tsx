import { getScopedSnapshot } from '../lib/flux-repository'
import { publicReadScope } from '../lib/read-scope'
import DashboardClient from './dashboard-client'
export const dynamic = 'force-dynamic'

export default async function Home() {
  const scopes = publicReadScope()
  if (!scopes) return <main><h1>Agency Flux indisponível</h1><p>O escopo público do dashboard não está configurado. Defina FLUX_PUBLIC_READ_SCOPE como tenantId/* para autorizar todos os projetos de um tenant, ou use pares tenantId/projectId.</p></main>
  let initial
  try {
    initial = await getScopedSnapshot({ scopes, visibility: 'public' })
  } catch {
    return <main><h1>Agency Flux indisponível</h1><p>Não foi possível ler o estado persistido. Verifique o schema e a conexão do Supabase no runtime.</p></main>
  }
  return <DashboardClient initial={initial} />
}
