import { getSnapshot } from '../lib/flux-repository'
import DashboardClient from './dashboard-client'
export const dynamic = 'force-dynamic'
export default async function Home() { return <DashboardClient initial={await getSnapshot()} /> }
