import { getScopedSnapshot, type FluxReadScope } from '../lib/flux-repository'
import { publicReadScope } from '../lib/read-scope'
import DashboardClient from './dashboard-client'
export const dynamic = 'force-dynamic'

function configuredPublicScope(): FluxReadScope | null {
  const value = publicReadScope()?.trim() || ''
  const [tenantId, projectId, extra] = value.split('/')
  if (!tenantId || !projectId || extra) return null
  return { tenantId, projectId, visibility: 'public' }
}

export default async function Home() {
  const scope = configuredPublicScope()
  if (!scope) return <main><h1>Agency Flux indisponível</h1><p>O escopo público do dashboard não está configurado. Defina FLUX_PUBLIC_READ_SCOPE no runtime como tenantId/projectId.</p></main>
  let initial
  try {
    initial = await getScopedSnapshot(scope)
  } catch {
    return <main><h1>Agency Flux indisponível</h1><p>Não foi possível ler o estado persistido. Verifique o schema e a conexão do Supabase no runtime.</p></main>
  }
  return <DashboardClient initial={initial} />
}
