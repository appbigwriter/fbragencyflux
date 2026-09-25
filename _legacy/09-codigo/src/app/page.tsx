import { getScopedSnapshot } from '@/lib/flux-repository'
import { publicReadScope } from '@/lib/read-scope'
import DashboardClient from './dashboard-client'
import DashboardDetails from './dashboard-details'
import { queryValue, type PageQuery } from '@/lib/ui-records'
export const dynamic = 'force-dynamic'
export default async function Home({ searchParams }: { searchParams: PageQuery }) {
  const scopes = publicReadScope()
  if (!scopes) return <main><h1>Agency Flux indisponível</h1><p>O escopo público do dashboard não está configurado. Defina FLUX_PUBLIC_READ_SCOPE como tenantId/* para autorizar todos os projetos de um tenant, ou use pares tenantId/projectId.</p></main>
  let initial
  try {
    initial = await getScopedSnapshot({ scopes, visibility: 'public' })
  } catch (error) {
    console.error('[Agency Flux Load Error]:', error)
    const message = (error as Error)?.message || String(error)
    const code = (error as { code?: string })?.code || 'DATABASE_ERROR'
    return (
      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <h1 style={{ color: '#e53e3e' }}>Agency Flux indisponível</h1>
        <p>Não foi possível ler o estado persistido. Verifique o schema e a conexão do Supabase no runtime.</p>
        <div style={{ background: '#1a202c', color: '#feb2b2', padding: '1rem', borderRadius: '6px', marginTop: '1rem', border: '1px solid #e53e3e' }}>
          <strong style={{ color: '#fff' }}>Diagnóstico:</strong> [{code}] {message}
        </div>
      </main>
    )
  }
  return <> <DashboardClient initial={initial} /> <DashboardDetails snapshot={initial} query={searchParams} /> </>
}