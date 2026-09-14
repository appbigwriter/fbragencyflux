#!/usr/bin/env node

const urlValue = process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const stateKey = process.env.FLUX_STATE_KEY || 'default'
const writeTest = process.argv.includes('--write-test')

function fail(message, status = 2) {
  console.error(`status=${status}`)
  console.error(`solution=${message}`)
  process.exit(status)
}

if (!urlValue || !serviceRoleKey) fail('Set FLUX_SUPABASE_URL and FLUX_SUPABASE_SERVICE_ROLE_KEY in runtime Environment/Secrets (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are accepted aliases)')

let url
try { url = new URL(urlValue) } catch { fail('Use an absolute HTTPS Supabase project URL without query, credentials, or a path') }
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') fail('Use an absolute HTTPS Supabase project URL without query, credentials, or a path')

const endpoint = `${url.host}/rest/v1/flux_state`
const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'content-type': 'application/json' }
const query = `${url.origin}/rest/v1/flux_state?state_key=eq.${encodeURIComponent(stateKey)}&select=state`

function solutionFor(status, operation) {
  if (status === 401) return 'Verify the service role key belongs to the same project, is in runtime Environment/Secrets, and is not a Build Arg, anon key, Control Tower token, or Easypanel token'
  if (status === 403) return 'Verify database permissions and the runtime service role secret for this project'
  if (status === 404) return 'Verify migration 011 is applied and the flux_state REST table is exposed'
  if (status >= 500) return 'Check Supabase service health and retry; do not replace production persistence with JSON fallback'
  return `Inspect the ${operation} status and runtime configuration without printing credentials`
}

async function request(operation, requestUrl, options) {
  let response
  try { response = await fetch(requestUrl, options) } catch { fail(`Network failure during ${operation}; verify the runtime endpoint and connectivity`) }
  console.log(`status=${response.status}`)
  console.log(`endpoint=${endpoint}`)
  console.log(`state_key=${stateKey}`)
  console.log(`receipt=${operation}:${response.status}`)
  console.log(`solution=${response.ok ? 'Readback succeeded; no remote validation claim beyond this local smoke result' : solutionFor(response.status, operation)}`)
  if (!response.ok) process.exitCode = 1
}

await request('GET', query, { headers, cache: 'no-store' })
if (writeTest) await request('POST', `${url.origin}/rest/v1/flux_state`, { method: 'POST', headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ state_key: stateKey, state: { smoke_test: true }, updated_at: new Date().toISOString() }) })
