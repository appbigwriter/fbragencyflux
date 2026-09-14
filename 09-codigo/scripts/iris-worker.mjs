#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const args = process.argv.slice(2)
if (!args.includes('--once')) args.push('--once')
if (!args.includes('--dry-run') && process.env.IRIS_WORKER_DRY_RUN === '1') args.push('--dry-run')
const viteNode = path.resolve('node_modules', 'vite-node', 'vite-node.mjs')
const result = spawnSync(process.execPath, [viteNode, 'src/lib/iris-worker-entry.ts', ...args], { stdio: 'inherit', env: process.env })
process.exit(result.status ?? 1)
