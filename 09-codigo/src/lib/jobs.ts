import type { AgentRun } from './flux-repository'

export type JobWithStale = AgentRun & { stale: boolean }
export type JobFilter = { project?: string; card?: string; agent?: string; status?: string; owner?: string; origin?: 'filesystem' | 'local'; lifecycle?: 'historical' | 'live'; stale?: boolean; blocker?: boolean }
export type JobSummary = { total: number; byStatus: Record<string, number>; byOrigin: { filesystem: number; local: number }; live: number; historical: number; stale: number; activeBlocker: number }

export function isJobStale(job: AgentRun, now = new Date()): boolean {
  if (job.historical || job.sourceType === 'filesystem') return true
  return Boolean(job.lastSeen && now.getTime() - Date.parse(job.lastSeen) > 30_000)
}

export function withStale(jobs: AgentRun[], now = new Date()): JobWithStale[] { return jobs.map((job) => ({ ...job, stale: isJobStale(job, now) })) }

export function getJobSummary(jobs: AgentRun[], now = new Date()): JobSummary {
  const result: JobSummary = { total: jobs.length, byStatus: {}, byOrigin: { filesystem: 0, local: 0 }, live: 0, historical: 0, stale: 0, activeBlocker: 0 }
  for (const job of jobs) {
    result.byStatus[job.status] = (result.byStatus[job.status] || 0) + 1
    const filesystem = job.sourceType === 'filesystem' || job.source.toLowerCase().includes('filesystem')
    result.byOrigin[filesystem ? 'filesystem' : 'local']++
    if (job.historical) result.historical++; else result.live++
    if (isJobStale(job, now)) result.stale++
    if (job.activeBlocker) result.activeBlocker++
  }
  return result
}

export function filterJobs(jobs: AgentRun[], filter: JobFilter, now = new Date()): JobWithStale[] {
  return withStale(jobs, now).filter((job) => {
    const origin = job.sourceType === 'filesystem' || job.source.toLowerCase().includes('filesystem') ? 'filesystem' : 'local'
    return (!filter.project || job.project === filter.project) && (!filter.card || job.cardId === filter.card) && (!filter.agent || job.agent === filter.agent) && (!filter.status || job.status === filter.status) && (!filter.owner || job.owner === filter.owner) && (!filter.origin || origin === filter.origin) && (!filter.lifecycle || (filter.lifecycle === 'historical' ? job.historical : !job.historical)) && (filter.stale === undefined || job.stale === filter.stale) && (filter.blocker === undefined || job.activeBlocker === filter.blocker)
  })
}

export function getPriorityJobs(jobs: AgentRun[], now = new Date()): JobWithStale[] {
  return withStale(jobs, now).sort((a, b) => Number(b.activeBlocker) - Number(a.activeBlocker) || Number(b.stale) - Number(a.stale) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 6)
}
