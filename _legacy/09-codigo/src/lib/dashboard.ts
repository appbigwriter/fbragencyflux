import { getSnapshot } from './flux-repository'
export type { ProjectStatus, CardStatus, Project, Card, Approval, Gate, GateStatus, Event, DashboardSnapshot } from './flux-repository'

export async function getDashboardSnapshot(file?: string): Promise<import('./flux-repository').DashboardSnapshot> {
  return getSnapshot(file)
}
