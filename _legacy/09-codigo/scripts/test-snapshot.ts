import { getScopedSnapshot } from '../src/lib/flux-repository'
import { publicReadScope } from '../src/lib/read-scope'

async function run() {
  process.env.FLUX_PERSISTENCE = 'json'
  process.env.FLUX_PUBLIC_READ_SCOPE = 'local/*,fbr/*,after-forty/*,agency/*,default/*,talk-to-your-crowd/*,00000000-0000-0000-0000-000000000001/*,00000000-0000-0000-0000-000000000002/*,00000000-0000-0000-0000-000000000003/*,00000000-0000-0000-0000-000000000004/*,00000000-0000-0000-0000-000000000005/*,00000000-0000-0000-0000-000000000030/*'
  const scopes = publicReadScope()
  console.log('Scopes parsed:', scopes?.length)
  const snapshot = await getScopedSnapshot({ scopes: scopes || [], visibility: 'public' })
  console.log('Projects count:', snapshot.projects.length)
  console.log('Projects:', snapshot.projects.map(p => ({ id: p.id, name: p.name, tenantId: p.tenantId })))
  console.log('Cards count:', snapshot.cards.length)
  console.log('Cards:', snapshot.cards.map(c => ({ id: c.id, project: c.project, title: c.title })))
  console.log('Approvals pending:', snapshot.approvals.pending)
  console.log('Approvals items:', snapshot.approvals.items.length)
}

run().catch(console.error)
