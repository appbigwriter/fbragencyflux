#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const STATE_KEY = 'fbr-agency-flux'

/** @typedef {(url: string, init?: RequestInit) => Promise<Response>} SeedFetch */

export class SeedError extends Error {
  constructor(message, code = 'SEED_FAILED') {
    super(message)
    this.name = 'SeedError'
    this.code = code
  }
}

const ARRAY_FIELDS = ['projects', 'cards', 'approvals', 'gates', 'events', 'handoffs', 'artifacts']

function countsFor(state) {
  return Object.fromEntries(ARRAY_FIELDS.map((field) => [field, Array.isArray(state[field]) ? state[field].length : 0]))
}

function parseSnapshot(raw) {
  let state
  try {
    state = JSON.parse(raw)
  } catch {
    throw new SeedError('data/flux-state.json is not valid JSON', 'SNAPSHOT_INVALID')
  }
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    throw new SeedError('data/flux-state.json must contain a JSON object', 'SNAPSHOT_INVALID')
  }
  return state
}

function runtime(env) {
  const urlValue = env.FLUX_SUPABASE_URL
  const serviceRoleKey = env.FLUX_SUPABASE_SERVICE_ROLE_KEY
  if (!urlValue || !serviceRoleKey) {
    throw new SeedError('Set FLUX_SUPABASE_URL and FLUX_SUPABASE_SERVICE_ROLE_KEY in runtime Environment/Secrets', 'RUNTIME_NOT_CONFIGURED')
  }
  let url
  try { url = new URL(urlValue) } catch {
    throw new SeedError('FLUX_SUPABASE_URL must be an absolute HTTPS Supabase project URL', 'URL_INVALID')
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new SeedError('FLUX_SUPABASE_URL must contain only the HTTPS project origin', 'URL_INVALID')
  }
  return { origin: url.origin, serviceRoleKey }
}

function headers(serviceRoleKey, extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'content-type': 'application/json',
    ...extra,
  }
}

function stateUrl(origin) {
  return `${origin}/rest/v1/flux_state?state_key=eq.${encodeURIComponent(STATE_KEY)}&select=state`
}

async function request(fetchImpl, url, init, operation) {
  try {
    const response = await fetchImpl(url, init)
    if (!response.ok) throw new SeedError(`${operation} rejected with HTTP ${response.status}`, `${operation.toUpperCase()}_FAILED`)
    return response
  } catch (error) {
    if (error instanceof SeedError) throw error
    throw new SeedError(`${operation} network request failed`, `${operation.toUpperCase()}_FAILED`)
  }
}

async function readRows(response, operation) {
  try {
    const rows = await response.json()
    if (!Array.isArray(rows)) throw new Error('not an array')
    return rows
  } catch {
    throw new SeedError(`${operation} returned an invalid JSON response`, `${operation.toUpperCase()}_INVALID`)
  }
}

/**
 * @param {{ env?: NodeJS.ProcessEnv, args?: string[], fetchImpl?: SeedFetch, readState?: () => Promise<unknown> }} options
 */
export async function runSeed({ env = process.env, args = process.argv.slice(2), fetchImpl = fetch, readState = async () => parseSnapshot(await readFile(path.resolve(process.cwd(), 'data', 'flux-state.json'), 'utf8')) } = {}) {
  if (!args.includes('--confirm-seed')) throw new SeedError('Refusing remote seed without explicit --confirm-seed', 'CONFIRMATION_REQUIRED')
  const { origin, serviceRoleKey } = runtime(env)
  const state = await readState()
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new SeedError('data/flux-state.json must contain a JSON object', 'SNAPSHOT_INVALID')

  const getInit = { headers: headers(serviceRoleKey), cache: 'no-store' }
  const existingRows = await readRows(await request(fetchImpl, stateUrl(origin), getInit, 'read'), 'read')
  const forceReplace = args.includes('--force-replace')
  if (existingRows.length > 0 && !forceReplace) {
    throw new SeedError('State already exists; pass --force-replace to replace it explicitly', 'STATE_EXISTS')
  }

  await request(fetchImpl, `${origin}/rest/v1/flux_state?on_conflict=state_key`, {
    method: 'POST',
    headers: headers(serviceRoleKey, { Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify({ state_key: STATE_KEY, state, updated_at: new Date().toISOString() }),
  }, 'write')

  const readbackRows = await readRows(await request(fetchImpl, stateUrl(origin), getInit, 'readback'), 'readback')
  if (readbackRows.length === 0 || !readbackRows[0]?.state || typeof readbackRows[0].state !== 'object') {
    throw new SeedError('Readback did not return the seeded state', 'READBACK_EMPTY')
  }
  return {
    status: forceReplace ? 'replaced' : 'seeded',
    receipt: 'readback:200',
    counts: countsFor(readbackRows[0].state),
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(await runSeed()))
  } catch (error) {
    console.error(JSON.stringify({ status: 'error', receipt: error instanceof SeedError ? error.code : 'SEED_FAILED', counts: {} }))
    process.exitCode = 1
  }
}
