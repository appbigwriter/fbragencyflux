import { getSnapshot } from '@/lib/flux-repository'
import JobsClient from './jobs-client'
export const dynamic = 'force-dynamic'
export default async function JobsPage() { return <JobsClient initial={(await getSnapshot()).jobs || []} /> }
