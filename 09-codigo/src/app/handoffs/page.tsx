import { getSnapshot } from '@/lib/flux-repository'
import HandoffsClient from './handoffs-client'
export const dynamic = 'force-dynamic'
export default async function HandoffsPage() { return <HandoffsClient initial={(await getSnapshot()).handoffs} /> }
