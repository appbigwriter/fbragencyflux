import { describe, expect, it } from 'vitest'
import { filterJobs, getJobSummary, getPriorityJobs, isJobStale, type JobFilter } from '../src/lib/jobs'
import type { AgentRun } from '../src/lib/flux-repository'

const job = (patch: Partial<AgentRun> = {}): AgentRun => ({
  jobId: 'job-1', cardId: 'AF-001', project: 'After Forty', agent: 'Íris', role: 'researcher', objective: 'Validar o fluxo', status: 'review', updatedAt: '2026-09-14T10:00:00Z',
  artifactRefs: [], handoffRefs: [], evidenceRefs: [], blockers: [], nextStep: 'Revisar evidência', correlationId: 'corr-1', source: 'local/dispatcher', sourceType: 'local', historical: false, activeBlocker: false, lastSeen: '2026-09-14T10:00:00Z', progress: 40, currentStep: 'Leitura', owner: 'Gabe', ...patch,
})

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
  it('distinguishes stale historical readback from realtime jobs', () => {
    expect(isJobStale(job({ historical: true, sourceType: 'filesystem' }), new Date('2026-09-14T10:00:01Z'))).toBe(true)
    expect(isJobStale(job({ historical: false, sourceType: 'local', lastSeen: '2026-09-14T10:00:00Z' }), new Date('2026-09-14T10:00:01Z'))).toBe(false)
  })
})
