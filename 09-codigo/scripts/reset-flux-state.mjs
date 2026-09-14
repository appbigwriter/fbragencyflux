#!/usr/bin/env node

const confirmed = process.argv.includes('--confirm-reset')
const urlValue = process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const stateKey = 'fbr-agency-flux'

function fail(message, code = 2) {
  console.error(JSON.stringify({ status: 'error', code, solution: message }))
  process.exit(code)
}

if (!confirmed) fail('Confirmation required: rerun with --confirm-reset')
if (!urlValue || !serviceRoleKey) fail('Runtime requires FLUX_SUPABASE_URL and FLUX_SUPABASE_SERVICE_ROLE_KEY')

let base
try {
  base = new URL(urlValue)
  if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash || base.username || base.password) throw new Error('invalid')
} catch {
  fail('FLUX_SUPABASE_URL must be an absolute HTTPS project origin')
}

const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'content-type': 'application/json' }
const endpoint = `${base.origin}/rest/v1/flux_state`
const filter = `${endpoint}?state_key=eq.${encodeURIComponent(stateKey)}`
const emptyState = { version: 1, projects: [], cards: [], approvals: [], gates: [], events: [], handoffs: [], artifacts: [], blockers: [], jobs: [], agentRuns: [] }

async function request(url, options = {}) {
  let response
  try { response = await fetch(url, options) } catch { fail('Supabase network request failed') }
  if (!response.ok) fail(`Supabase request failed with HTTP ${response.status}`)
  return response
}

const before = await request(`${filter}&select=state_key,state`, { headers })
const beforeRows = await before.json()
const deleted = beforeRows.length
await request(filter, { method: 'DELETE', headers: { ...headers, Prefer: 'return=minimal' } })
await request(`${endpoint}?on_conflict=state_key`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ state_key: stateKey, state: emptyState, updated_at: new Date().toISOString() }) })
const after = await request(`${filter}&select=state_key,state`, { headers })
const rows = await after.json()
const state = rows[0]?.state
if (!state || stateKey !== rows[0]?.state_key) fail('Reset readback did not return the Flux state row')

console.log(JSON.stringify({ status: 'reset', stateKey, deletedRows: deleted, readbackRows: rows.length, counts: { projects: state.projects.length, cards: state.cards.length, approvals: state.approvals.length, gates: state.gates.length, events: state.events.length, handoffs: state.handoffs.length, jobs: state.jobs.length, agentRuns: state.agentRuns.length } }))
