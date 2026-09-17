import { getScopedSnapshot } from '@/lib/flux-repository'
import { publicReadScope } from '@/lib/read-scope'
import JobsClient from './jobs-client'
export const dynamic = 'force-dynamic'
export default async function JobsPage() {
  const scopes = publicReadScope()
  if (!scopes) return <main><h1>Agency Flux indisponível</h1><p>O escopo público do dashboard não está configurado.</p></main>
  let jobs
  try { jobs = (await getScopedSnapshot({ scopes, visibility: 'public' })).jobs || [] } catch { return <main><h1>Agency Flux indisponível</h1><p>Não foi possível ler o estado persistido.</p></main> }
  return <JobsClient initial={jobs} />
}
