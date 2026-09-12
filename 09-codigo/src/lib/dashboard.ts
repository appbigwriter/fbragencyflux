import { getSnapshot } from './flux-repository'
export type { ProjectStatus, CardStatus, Project, Card, Approval, Event, DashboardSnapshot } from './flux-repository'

export async function getDashboardSnapshot(): Promise<import('./flux-repository').DashboardSnapshot> {
  return getSnapshot()
}
