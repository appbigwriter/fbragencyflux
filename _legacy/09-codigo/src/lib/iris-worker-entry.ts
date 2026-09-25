import { runIrisWorker } from './iris-worker'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const file = process.env.FLUX_DATA_FILE

if (args.has('--once')) {
  const report = await runIrisWorker({ dryRun, file })
  console.log(JSON.stringify(report, null, 2))
} else if (args.has('--continuous')) {
  const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 30000)
  console.log(`[iris-worker] Starting continuous daemon with interval ${intervalMs}ms...`)
  let running = true
  const shutdown = () => {
    console.log('[iris-worker] Shutting down daemon gracefully...')
    running = false
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  const cycle = async () => {
    if (!running) return
    try {
      const report = await runIrisWorker({ dryRun, file })
      console.log(`[iris-worker] Cycle completed at ${new Date().toISOString()}: ${report.idle.length} idle, ${report.dispatched.length} dispatched, ${report.holds.length} holds`)
    } catch (err) {
      console.error('[iris-worker] Cycle error:', err)
    }
  }

  await cycle()
  const timer = setInterval(cycle, intervalMs)
  timer.unref?.()
} else {
  throw new Error('IRIS_WORKER_REQUIRES_ONCE_OR_CONTINUOUS: execute com --once ou --continuous')
}
