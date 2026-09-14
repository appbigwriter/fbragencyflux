# Flux external persistence and dispatcher status

## Verified Hermes interface

Hermes does expose a real outbound event interface. The official contract is `hooks.outbound` in the active profile `config.yaml`; it POSTs signed JSON to a configured HTTP endpoint from CLI and gateway sessions. The documented lifecycle hooks include `kanban_task_claimed`, `kanban_task_completed`, `kanban_task_blocked`, `on_kanban_worker_spawned`, `on_kanban_worker_exited`, `on_kanban_worker_stale_claim`, `on_kanban_task_updated` and `on_kanban_dispatch_tick`. Kanban claim/complete/block events are durable-board lifecycle events, not guesses from log text

The interface is not a Flux-specific dispatcher API, and Hermes does not expose a documented outbound `kanban_heartbeat` hook. `kanban_heartbeat` updates Hermes' SQLite board and appends a board event, but it is not delivered by the listed plugin-hook/outbound-webhook contract. Therefore this bridge maps lifecycle events only; it does not fabricate heartbeat events or claim real-time heartbeat delivery

Evidence: Hermes source `hermes_cli/kanban_db.py` (`_fire_kanban_lifecycle_hook`), `hermes_cli/kanban_db_dispatch.py` (`heartbeat_worker`), and official docs `user-guide/features/hooks` sections `Plugin Hooks`, `Kanban lifecycle observers`, and `Outbound Webhooks`

## Implemented bridge

- `src/lib/persistence.ts` defines the server-side `FluxStateRepository` contract, JSON fixture adapter, Supabase REST adapter and in-memory fake adapter
- `src/lib/dispatcher.ts` defines the Flux job/agent-run/heartbeat event contract, HTTP adapter, fake adapter, bearer protection and process-local replay idempotency
- `POST /api/flux/dispatcher` remains the explicit Flux-to-Flux server endpoint
- `POST /api/flux/hermes-events` is the local Hermes sink: it verifies `X-Hermes-Signature-256`, maps documented Kanban lifecycle payloads, creates a local job on first delivery, and applies the event server-side as actor `Hermes`
- `src/lib/hermes-webhook.ts` contains the strict translation table; unknown events or events without `extra.task_id` return `ignored` and are not converted into fake jobs

### Mapping

| Hermes event | Flux event | Job identity | Evidence boundary |
|---|---|---|---|
| `kanban_task_claimed` | `started` | `hermes-kanban-<board>-<task_id>` | claim committed before hook |
| `on_kanban_worker_spawned` | `progress` | same | worker PID persisted before hook |
| `kanban_task_completed` | `completed` | same | completion/cleanup committed before hook |
| `kanban_task_blocked` | `blocked` | same | blocked transition committed |
| `on_kanban_worker_exited` | `failed` | same | reclaim committed |
| `on_kanban_task_updated` | `progress` | same | task mutation committed |
| `on_kanban_worker_stale_claim` | not mapped | — | stale claim is not proof of a heartbeat |
| `on_kanban_dispatch_tick` | not mapped | — | tick has no stable task identity contract |
| `kanban_heartbeat` | not mapped | — | Hermes does not expose this as outbound hook |

## Exact local enablement

1. Start the Flux app with `FLUX_DATA_FILE` (or the approved persistent backend) and `HERMES_FLUX_WEBHOOK_SECRET` set only in the server process environment
2. Configure the active Hermes profile `config.yaml` with the following non-secret shape; put the HMAC secret in the profile `.env`, not YAML. `HERMES_FLUX_CARD_ID` is an optional Flux server setting and defaults to `FLUX-001` for newly observed Hermes tasks:

```yaml
hooks:
  outbound:
    - name: fbr-flux-local
      url: http://localhost:3000/api/flux/hermes-events
      events: [kanban_task_claimed, on_kanban_worker_spawned, kanban_task_completed, kanban_task_blocked, on_kanban_worker_exited, on_kanban_task_updated]
      secret_env: HERMES_FLUX_WEBHOOK_SECRET
      timeout: 10
```

3. Restart the Hermes gateway or start a new CLI session; outbound-hook changes are not hot-reloaded
4. Confirm `hermes hooks list` shows the target as signed, then exercise a disposable local Kanban task and read back `GET /api/flux/jobs`
5. Do not enable this against production or a remote endpoint without Sergio Gate authorization

## Security, retry and idempotency

Hermes signs the raw body with `sha256=<HMAC-SHA256>` in `X-Hermes-Signature-256`, includes `X-Hermes-Delivery`/`delivery_id`, retries connection errors and 5xx once, and does not follow redirects or retry 4xx. The Flux sink verifies the signature before parsing and uses `delivery_id` as `eventId`; duplicate protection is currently process-local in `dispatchIncoming`. A durable production inbox keyed by `eventId` is still required before treating this as cross-restart delivery

## Local verification

- `npm test -- --run tests/external-adapters.test.ts tests/hermes-webhook.test.ts`: required verification after implementation
- `npm run typecheck`: required
- `npm run lint`: required
- `npm run build`: required
- `scripts/smoke-e2e-local.sh`: local Docker smoke remains optional and does not contact Hermes or a remote provider

## Blockers

1. **Heartbeat:** cause: Hermes' documented outbound hook set has no `kanban_heartbeat` event and the heartbeat writer does not call the outbound hook dispatcher; solution: Hermes maintainers or a separately approved plugin must expose a stable heartbeat observer, owner: Hermes/plugin owner, evidence expected: signed delivery containing stable `task_id`, `run_id`, and heartbeat timestamp for a real `kanban_heartbeat` call
2. **Durable dedupe:** cause: Flux `seen` is process-local; solution: persist an inbox/unique `eventId` before applying events in the approved persistence backend, owner: Flux persistence owner, evidence expected: same signed delivery replayed after restart is acknowledged without a second state mutation
3. **Remote enablement:** cause: no remote URL, secret, Gate or readback authorization was provided; solution: Sergio Gate authorizes endpoint/scope and operator runs a remote readback, owner: Sergio/operator, evidence expected: `hermes hooks list`, HTTP receipt, Flux job readback and no secret in logs

No remote database, migration, service, deploy, publication, commit or push was performed
