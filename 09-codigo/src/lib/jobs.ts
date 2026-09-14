import type { AgentRun } from './flux-repository'

export type JobWithStale = AgentRun & { stale: boolean }
export type JobFilter = { project?: string; card?: string; agent?: string; status?: string; owner?: string; origin?: 'filesystem' | 'local'; lifecycle?: 'historical' | 'live'; stale?: boolean; blocker?: boolean }
export type JobClassification = 'planned' | 'historical' | 'realtime'
export type JobSummary = { total: number; byStatus: Record<string, number>; byOrigin: { filesystem: number; local: number }; planned: number; realtime: number; live: number; historical: number; stale: number; activeBlocker: number }

const REAL_EVENTS = new Set(['accepted', 'started', 'progress', 'waiting_input', 'blocked', 'artifact_created', 'handoff_sent', 'review', 'completed', 'failed', 'cancelled'])
const liveSource = (job: AgentRun) => job.sourceType === 'live' || /(?:^|[/:\s])(?:live|dispatcher)(?:$|[/:\s])/i.test(job.source) || /hermes outbound webhook/i.test(job.source)
const historicalSource = (job: AgentRun) => Boolean(job.historical || job.sourceType === 'filesystem' || job.source.toLowerCase().includes('filesystem'))
const startedLive = (job: AgentRun) => liveSource(job) && Boolean(job.startedAt) && (Boolean(job.lastEvent && REAL_EVENTS.has(job.lastEvent)) || Boolean(job.lastSeen && Date.parse(job.lastSeen) > Date.parse(job.startedAt!)))

export function classifyJob(job: AgentRun): JobClassification {
  if (historicalSource(job)) return 'historical'
  if (job.status === 'planned' || job.status === 'ready') {
    if (job.source.toLowerCase() === 'local/intake-fixture' && !job.startedAt && job.lastEvent === 'dispatched') return 'planned'
  }
  return startedLive(job) ? 'realtime' : 'planned'
}

export function isJobStale(job: AgentRun, now = new Date()): boolean {
  return startedLive(job) && Boolean(job.lastSeen && now.getTime() - Date.parse(job.lastSeen) > 30_000)
}

export function withStale(jobs: AgentRun[], now = new Date()): JobWithStale[] { return jobs.map((job) => ({ ...job, stale: isJobStale(job, now) })) }

export function getJobSummary(jobs: AgentRun[], now = new Date()): JobSummary {
  const result: JobSummary = { total: jobs.length, byStatus: {}, byOrigin: { filesystem: 0, local: 0 }, planned: 0, realtime: 0, live: 0, historical: 0, stale: 0, activeBlocker: 0 }
  for (const job of jobs) {
    result.byStatus[job.status] = (result.byStatus[job.status] || 0) + 1
    const filesystem = job.sourceType === 'filesystem' || job.source.toLowerCase().includes('filesystem')
    result.byOrigin[filesystem ? 'filesystem' : 'local']++
    const classification = classifyJob(job)
    if (classification === 'planned') result.planned++
    if (classification === 'historical') result.historical++
    if (classification === 'realtime') { result.realtime++; result.live++ }
    if (isJobStale(job, now)) result.stale++
    if (job.activeBlocker) result.activeBlocker++
  }
  return result
}

export function filterJobs(jobs: AgentRun[], filter: JobFilter, now = new Date()): JobWithStale[] {
  return withStale(jobs, now).filter((job) => {
    const origin = job.sourceType === 'filesystem' || job.source.toLowerCase().includes('filesystem') ? 'filesystem' : 'local'
    return (!filter.project || job.project === filter.project) && (!filter.card || job.cardId === filter.card) && (!filter.agent || job.agent === filter.agent) && (!filter.status || job.status === filter.status) && (!filter.owner || job.owner === filter.owner) && (!filter.origin || origin === filter.origin) && (!filter.lifecycle || (filter.lifecycle === 'historical' ? classifyJob(job) === 'historical' : classifyJob(job) === 'realtime')) && (filter.stale === undefined || job.stale === filter.stale) && (filter.blocker === undefined || job.activeBlocker === filter.blocker)
  })
}

export function getPriorityJobs(jobs: AgentRun[], now = new Date()): JobWithStale[] {
  return withStale(jobs, now).sort((a, b) => Number(b.activeBlocker) - Number(a.activeBlocker) || Number(b.stale) - Number(a.stale) || Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 6)
}
