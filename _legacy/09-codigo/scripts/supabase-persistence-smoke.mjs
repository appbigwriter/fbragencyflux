#!/usr/bin/env node

const urlValue = process.env.FLUX_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
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

const endpoint = `${url.host}/rest/v1/rpc/flux_relational_read`
const headers = { apikey: serviceRoleKey, authorization: `Bearer ${serviceRoleKey}`, 'content-type': 'application/json', 'accept-profile': 'custom_agencyflux', 'content-profile': 'custom_agencyflux' }

function solutionFor(status, operation) {
  if (status === 401) return 'Verify the service role key belongs to the same project, is in runtime Environment/Secrets, and is not a Build Arg, anon key, Control Tower token, or Easypanel token'
  if (status === 403) return 'Verify RPC execute grants to service_role and runtime service role secret for this project'
  if (status === 404) return 'Verify canonical migration 004_flux_relational_rpcs.sql is applied; the legacy flux_state table smoke is obsolete'
  if (status >= 500) return 'Check Supabase service health and the relational RPC migration; do not replace production persistence with JSON fallback'
  return `Inspect the ${operation} status and runtime configuration without printing credentials`
}

async function request(operation, rpcName, body) {
  let response
  const requestUrl = `${url.origin}/rest/v1/rpc/${rpcName}`
  try { response = await fetch(requestUrl, { method: 'POST', headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' }) } catch { fail(`Network failure during ${operation}; verify the runtime endpoint and connectivity`) }
  const text = await response.text()
  console.log(`status=${response.status}`)
  console.log(`endpoint=${url.host}/rest/v1/rpc/${rpcName}`)
  console.log(`rpc=${rpcName}`)
  console.log(`receipt=${operation}:${response.status}`)
  console.log(`solution=${response.ok ? 'RPC responded; this is only an operator-run smoke result, not a remote readback claim by the implementation task' : solutionFor(response.status, operation)}`)
  if (!response.ok) process.exitCode = 1
  try { return text ? JSON.parse(text) : null } catch { fail(`RPC ${rpcName} returned non-JSON response`, 1) }
}

const read = await request('READ', 'flux_relational_read')
if (read && typeof read.version !== 'undefined') console.log(`version=${read.version}`)
if (writeTest && !process.exitCode) {
  const version = Number(read?.version)
  if (!Number.isFinite(version)) fail('Cannot run --write-test because flux_relational_read did not return a numeric version', 1)
  const committed = await request('COMMIT_NOOP', 'flux_relational_commit', { expected_version: version, changes: [], waiting_reasons: read?.waitingReasons ?? null })
  if (committed && typeof committed.version !== 'undefined') console.log(`commit_readback_version=${committed.version}`)
}
