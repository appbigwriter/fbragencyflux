#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const args = process.argv.slice(2)
if (!args.includes('--once')) args.push('--once')
if (!args.includes('--dry-run') && process.env.IRIS_WORKER_DRY_RUN === '1') args.push('--dry-run')
const viteNode = path.resolve('node_modules', 'vite-node', 'dist', 'cli.mjs')
const env = { ...process.env }
let tempDir
if (args.includes('--dry-run') && !env.FLUX_DATA_FILE) {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'iris-worker-dry-run-'))
  const tempFile = path.join(tempDir, 'flux-state.json')
  copyFileSync(path.resolve('data', 'flux-state.json'), tempFile)
  env.FLUX_DATA_FILE = tempFile
  env.FLUX_PERSISTENCE = 'json'
  env.FLUX_LOCAL_MODE = '1'
}
const result = spawnSync(process.execPath, [viteNode, 'src/lib/iris-worker-entry.ts', ...args], { stdio: 'inherit', env })
if (tempDir) rmSync(tempDir, { recursive: true, force: true })
if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}
process.exit(result.status ?? 1)
