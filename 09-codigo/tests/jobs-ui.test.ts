import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { classifyJob, filterJobs, getJobSummary, getPriorityJobs, isJobStale, type JobFilter } from '../src/lib/jobs'
import type { AgentRun } from '../src/lib/flux-repository'

const job = (patch: Partial<AgentRun> = {}): AgentRun => ({
  jobId: 'job-1', cardId: 'AF-001', project: 'After Forty', agent: 'Íris', role: 'researcher', objective: 'Validar o fluxo', status: 'review', updatedAt: '2026-09-14T10:00:00Z',
  artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'Revisar evidência', correlationId: 'corr-1', source: 'local/dispatcher', sourceType: 'local', historical: false, activeBlocker: false, lastSeen: '2026-09-14T10:00:00Z', progress: 40, currentStep: 'Leitura', owner: 'Gabe', ...patch,
 })

 const fixture = JSON.parse(readFileSync(new URL('../data/after-forty-intake.fixture.json', import.meta.url), 'utf8')) as { jobs: AgentRun[] }

describe('jobs operational view', () => {
  it('counts status, origin, live/historical, stale and blockers from real jobs', () => {
    const items = [job(), job({ jobId: 'job-2', status: 'blocked', historical: true, sourceType: 'filesystem', activeBlocker: true, lastSeen: '2026-01-01T00:00:00Z' })]
    const summary = getJobSummary(items, new Date('2026-09-14T10:00:01Z'))
    expect(summary.total).toBe(2); expect(summary.byStatus.review).toBe(1); expect(summary.byStatus.blocked).toBe(1)
    expect(summary.byOrigin.filesystem).toBe(1); expect(summary.historical).toBe(1); expect(summary.live).toBe(1); expect(summary.stale).toBe(1); expect(summary.activeBlocker).toBe(1)
  })
  it('filters by project, card, agent, owner, origin, history, stale and blocker', () => {
    const items = [job(), job({ jobId: 'job-2', project: 'FBR Agency Flux', cardId: 'FLUX-001', agent: 'Kora', owner: 'Sergio', historical: true, sourceType: 'filesystem', activeBlocker: true, lastSeen: '2026-01-01T00:00:00Z' })]
    const filter: JobFilter = { project: 'FBR Agency Flux', card: 'FLUX-001', agent: 'Kora', owner: 'Sergio', origin: 'filesystem', lifecycle: 'historical', stale: true, blocker: true }
    expect(filterJobs(items, filter, new Date('2026-09-14T10:00:01Z'))).toHaveLength(1)
  })
  it('limits priority cards to six and keeps detail data intact', () => {
    const items = Array.from({ length: 8 }, (_, i) => job({ jobId: `job-${i}`, status: i === 7 ? 'review' : 'blocked', activeBlocker: i < 7 }))
    expect(getPriorityJobs(items, new Date('2026-09-14T10:00:01Z'))).toHaveLength(6)
    expect(items[0].objective).toBe('Validar o fluxo'); expect(items[0].correlationId).toBe('corr-1')
  })
  it('classifies the public intake fixture as planned, never realtime or stale', () => {
    const summary = getJobSummary(fixture.jobs, new Date('2026-09-14T12:00:31-03:00'))
    expect(summary.planned).toBe(4); expect(summary.live).toBe(0); expect(summary.realtime).toBe(0); expect(summary.stale).toBe(0)
    expect(fixture.jobs.every((item) => classifyJob(item) === 'planned')).toBe(true)
    expect(fixture.jobs.every((item) => isJobStale(item, new Date('2026-09-14T12:00:31-03:00')) === false)).toBe(true)
  })
  it('marks only an initiated live job with an old heartbeat as stale', () => {
    const live = job({ source: 'live/dispatcher', sourceType: 'live', status: 'in_progress', startedAt: '2026-09-14T09:00:00Z', lastSeen: '2026-09-14T09:00:00Z', lastEvent: 'started' })
    const summary = getJobSummary([live], new Date('2026-09-14T10:00:01Z'))
    expect(classifyJob(live)).toBe('realtime'); expect(isJobStale(live, new Date('2026-09-14T10:00:01Z'))).toBe(true)
    expect(summary.realtime).toBe(1); expect(summary.stale).toBe(1); expect(summary.planned).toBe(0)
  })
})
