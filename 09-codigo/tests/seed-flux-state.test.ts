import { describe, expect, it } from 'vitest'
// @ts-expect-error The executable .mjs module is covered by the runtime tests below.
import { runSeed } from '../scripts/seed-flux-state.mjs'

type SeedFetch = (url: string | URL, init?: RequestInit) => Promise<Response>

const state = {
  version: 1,
  projects: [{ id: 'project-flux' }],
  cards: [{ id: 'FLUX-001' }],
  approvals: [],
  gates: [],
  events: [],
  handoffs: [],
  artifacts: [],
}
const env = {
  FLUX_SUPABASE_URL: 'https://flux.example.test',
  FLUX_SUPABASE_SERVICE_ROLE_KEY: 'runtime-secret',
}
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

function fakeFetch(sequence: Response[]): SeedFetch & { calls: Array<[string, RequestInit | undefined]> } {
  const calls: Array<[string, RequestInit | undefined]> = []
  const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
    calls.push([String(url), init])
    const next = sequence.shift()
    if (!next) throw new Error('unexpected request')
    return next
  }) as SeedFetch & { calls: Array<[string, RequestInit | undefined]> }
  fetchImpl.calls = calls
  return fetchImpl
}

describe('seed-flux-state command', () => {
  it('rejects missing runtime environment before network access', async () => {
    const fetchImpl = fakeFetch([])
    await expect(runSeed({ env: {}, args: ['--confirm-seed'], fetchImpl, readState: async () => state }))
      .rejects.toThrow(/FLUX_SUPABASE_URL.*FLUX_SUPABASE_SERVICE_ROLE_KEY/)
    expect(fetchImpl.calls).toHaveLength(0)
  })

  it('requires explicit confirmation before network access', async () => {
    const fetchImpl = fakeFetch([])
    await expect(runSeed({ env, args: [], fetchImpl, readState: async () => state }))
      .rejects.toThrow(/--confirm-seed/)
    expect(fetchImpl.calls).toHaveLength(0)
  })

  it('posts the fixed state key and snapshot, then performs readback', async () => {
    const fetchImpl = fakeFetch([response([]), response([{ state }]), response([{ state }])])
    const result = await runSeed({ env, args: ['--confirm-seed'], fetchImpl, readState: async () => state })
    expect(fetchImpl.calls).toHaveLength(3)
    expect(fetchImpl.calls[0][0]).toContain('state_key=eq.fbr-agency-flux')
    expect(fetchImpl.calls[1][0]).toContain('on_conflict=state_key')
    expect(JSON.parse(String(fetchImpl.calls[1][1]?.body))).toMatchObject({ state_key: 'fbr-agency-flux', state })
    expect(fetchImpl.calls[1][1]?.headers).toMatchObject({ Prefer: 'resolution=merge-duplicates,return=minimal' })
    expect(fetchImpl.calls[2][0]).toContain('state_key=eq.fbr-agency-flux')
    expect(result).toMatchObject({ status: 'seeded', receipt: 'readback:200', counts: { projects: 1, cards: 1 } })
  })

  it('refuses an existing state without force replacement', async () => {
    const fetchImpl = fakeFetch([response([{ state }])])
    await expect(runSeed({ env, args: ['--confirm-seed'], fetchImpl, readState: async () => state }))
      .rejects.toThrow(/--force-replace/)
    expect(fetchImpl.calls).toHaveLength(1)
  })

  it('allows explicit force replacement and reports only readback counts', async () => {
    const fetchImpl = fakeFetch([response([{ state }]), response([]), response([{ state }])])
    const result = await runSeed({ env, args: ['--confirm-seed', '--force-replace'], fetchImpl, readState: async () => state })
    expect(fetchImpl.calls).toHaveLength(3)
    expect(result).toMatchObject({ status: 'replaced', receipt: 'readback:200' })
    expect(JSON.stringify(result)).not.toContain('runtime-secret')
    expect(JSON.stringify(result)).not.toContain('project-flux')
    expect(result.counts).toEqual({ projects: 1, cards: 1, approvals: 0, gates: 0, events: 0, handoffs: 0, artifacts: 0 })
  })
})
