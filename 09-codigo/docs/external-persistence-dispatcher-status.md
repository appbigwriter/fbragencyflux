# Flux external persistence and dispatcher status

## Implemented

- `src/lib/persistence.ts` defines the server-side `FluxStateRepository` contract, JSON fixture adapter, Supabase REST adapter and in-memory fake adapter
- `FLUX_PERSISTENCE=json` is local-only; production defaults to Supabase and fails closed when URL/key/state are absent
- Supabase uses `flux_state` keyed snapshots and runtime-only service-role credentials
- `src/lib/dispatcher.ts` defines the job/agent-run/heartbeat event contract, HTTP adapter, fake adapter, bearer protection and replay idempotency
- `POST /api/flux/dispatcher` is server-side only and rejects missing/invalid runtime credentials
- `scripts/smoke-e2e-local.sh` covers Docker build/run, login, approval, Handoff, restart readback and secret absence in response/log

## Local verification

- `npm test -- --run tests/external-adapters.test.ts`: passed (2 tests)
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed; Next emitted dynamic filesystem tracing warnings because legacy fixture synchronization scans configured history paths
- Docker smoke: executable, but requires Docker Desktop and a free local port; it does not provision or contact a remote provider

## Blocked / Gate required

1. Hermes does not expose a discoverable, approved authenticated HTTP contract for Flux job/agent-run event delivery in this execution. The adapter is explicit and ready at `FLUX_DISPATCHER_URL` + `FLUX_DISPATCHER_TOKEN`; unblock by approving the endpoint, token scope, event mapping and replay/readback test, then run the smoke against that endpoint
2. Supabase persistence is not verified remotely. Apply `supabase/migrations/011_flux_external_state.sql` only after Sergio Gate, inject `FLUX_SUPABASE_URL` and `FLUX_SUPABASE_SERVICE_ROLE_KEY` at runtime, seed one state row, and run a read-only local integration test; no remote migration was executed
3. Dispatcher idempotency is process-local until an approved durable event inbox is connected; production integration must persist unique `eventId` before applying events

No remote database, migration, service, deploy, publication, commit or push was performed
