import { importHistory } from '../src/lib/flux-repository'

const state = await importHistory()
console.log(JSON.stringify({ status: 'history-imported', counts: {
  handoffs: state.handoffs.length,
  jobs: state.jobs?.length || 0,
  artifacts: state.artifacts.length,
} }))