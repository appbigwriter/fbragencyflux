import { runIrisWorker } from './iris-worker'

const args = new Set(process.argv.slice(2))
if (!args.has('--once')) throw new Error('IRIS_WORKER_REQUIRES_ONCE: daemon permanente não é iniciado sem --once')
const report = await runIrisWorker({ dryRun: args.has('--dry-run'), file: process.env.FLUX_DATA_FILE })
console.log(JSON.stringify(report, null, 2))
