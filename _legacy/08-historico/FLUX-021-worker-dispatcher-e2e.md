# FLUX-021 — Worker contínuo, dispatcher e E2E operacional

Data da auditoria: 2026-09-17T21:19:29-03:00  
Projeto: FBR Agency Flux  
PROJECT_ROOT: `F:/Projetos/_FBR/FBR Agency Flux`  
EXECUTION_DIR: `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`  
PRD validado: `02-prd/FLUX-021-worker-dispatcher-e2e.md`

## 1. Escopo executado

Auditoria local, sem mensagem real, sem alteração de produção/cron/secrets e sem publicação After Forty.

Itens auditados:

- `scripts/iris-worker.mjs`
- `src/lib/iris-worker.ts`
- `src/lib/iris-worker-entry.ts`
- endpoints `api/flux/dispatcher`, `api/flux/hermes-events`, `api/flux/iris/worker`, `api/flux/intake`, `api/flux/handoffs`, `api/flux/blockers/:id/forward`
- eventos, heartbeat, receipts, Handoffs e blockers
- testes locais relacionados ao fluxo intake → triagem → job → handoff → blocker → readback

## 2. Evidências de execução local

### 2.1 Testes E2E/operacionais direcionados

COMMAND:

```bash
npx vitest run tests/flux-close-local.test.ts tests/iris-worker.test.ts tests/hermes-webhook.test.ts tests/blocker-forward.test.ts tests/handoffs-operational.test.ts
```

RESULT:

```text
Test Files  5 passed (5)
Tests  20 passed (20)
Duration  825ms
```

Cobertura factual desses testes:

- intake/planejamento local: `tests/flux-close-local.test.ts`
- dispatcher route com autenticação Bearer e dedupe por `eventId`: `tests/flux-close-local.test.ts`
- worker Íris, idle detection, HOLDS, Gate, dispatcher fake e heartbeat de ciclo: `tests/iris-worker.test.ts`
- Hermes webhook assinado e readback do job persistido: `tests/hermes-webhook.test.ts`
- blocker → handoff → requiredAction idempotente: `tests/blocker-forward.test.ts`
- Handoff operacional, legacy read-only e resume idempotente: `tests/handoffs-operational.test.ts`

### 2.2 Worker em dry-run sem envio real

COMMAND:

```bash
FLUX_DATA_FILE="$LOCALAPPDATA/Temp/flux021-worker/state.json" npx vite-node src/lib/iris-worker-entry.ts --once --dry-run
```

RESULT observado:

```text
result: dry_run
dispatched: []
idle: 6 itens
holds: [job-af-001-rick-affiliate-options, job-af-001-theo-provision-plan]
waitingReasons:
- Kora WHERE YOU AT?: 2 item(ns) sem resposta/readback
- job-af-001-kora-intake: dry-run não envia dispatcher
- job-af-001-bia-context-research: dry-run não envia dispatcher
- job-af-001-rick-affiliate-options: Gate requerido antes de risco
- job-af-001-theo-provision-plan: blocker aberto
```

Conclusão: o worker calcula ações, HOLDs, tracks paralelas e razões de espera sem disparar mensagem real em dry-run.

### 2.3 Suíte completa histórica

COMMAND:

```bash
npm test
```

RESULT:

```text
Test Files  6 failed | 25 passed (31)
Tests  14 failed | 123 passed (137)
```

Falhas observadas não foram corrigidas nesta story para evitar ampliar escopo:

- `tests/external-adapters.test.ts`: espera `SupabaseFluxRepository`, mas `src/lib/persistence.ts` não exporta esse membro.
- `tests/auth-control.test.ts` e `tests/ux-contract.test.ts`: contratos de texto/UI divergentes do código atual.
- `tests/backend-relacional.test.ts`: falha em PostgreSQL real por conflito/deadlock de schema.
- `tests/flux-recovery.test.ts`: timeout em concorrência de lock.
- Uma falha transitória `EBUSY` em cleanup apareceu na execução completa de `tests/iris-worker.test.ts`; a execução direcionada posterior passou.

### 2.4 Typecheck

COMMAND:

```bash
npm run typecheck
```

RESULT:

```text
tests/external-adapters.test.ts(2,30): error TS2724: '../src/lib/persistence' has no exported member named 'SupabaseFluxRepository'. Did you mean 'FakeFluxRepository'?
```

Conclusão: typecheck completo está bloqueado por divergência histórica de teste/adaptador externo; os testes direcionados da FLUX-021 passam.

### 2.5 Wrapper `npm run worker:iris`

COMMAND:

```bash
IRIS_WORKER_DRY_RUN=1 npm run worker:iris -- --once --dry-run
```

RESULT:

```text
Error: Cannot find module '.../node_modules/vite-node/vite-node.mjs'
```

Conclusão: a lógica do worker roda via `npx vite-node src/lib/iris-worker-entry.ts`, mas o wrapper `scripts/iris-worker.mjs` usa caminho local `node_modules/vite-node/vite-node.mjs` sem `vite-node` como dependência direta. Isso bloqueia declarar `npm run worker:iris` pronto.

## 3. Estados e transições verificáveis

Fonte: `src/lib/flux-repository.ts`, `src/lib/dispatcher.ts`, `src/lib/iris-worker.ts`, `tests/flux-close-local.test.ts`, `tests/iris-worker.test.ts`, `tests/blocker-forward.test.ts`, `tests/handoffs-operational.test.ts`.

| Estado/transição | Evidência local | Limite |
|---|---|---|
| `planned`/baseline de job externo | `baseline()` cria job novo em `dispatchIncoming()` quando evento válido chega sem job existente | exige `cardId`, `agent`, `objective` |
| `ready` → ciclo Íris | `runIrisWorker()` detecta jobs ativos sem `lastActivity`/`nextCheck` e cria `requiredActions` | em dry-run não persiste nem envia dispatcher |
| `ready` → `dispatched` lógico | `FakeDispatcherAdapter` recebe evento em `tests/iris-worker.test.ts`; `report.dispatched` contém job | não prova acionamento Hermes real |
| `started`/`progress` → `in_progress` | `statusMap` em `dispatcher.ts`; webhook Hermes mapeia `kanban_task_claimed` para `started` | depende de webhook assinado real para produção |
| `waiting_input`/`blocked` → `blocked` | worker marca HOLD por `BLOCKER_OPEN`, `GATE_REQUIRED`, `OUTSIDE_PLAN_SERGIO`, `DEPENDENCY_NOT_READY` | HOLD não resolve blocker |
| `handoff` → `awaiting_owner` | `forwardBlocker()` e `resumeHandoff()` persistem Handoff/requiredAction e readback nos testes | exige sessão/actor server-side para endpoint real |
| `completed` sem evidência → `not_verified` | `dispatchIncoming()` rebaixa job completado sem `evidenceRefs` e `artifactRefs` para `not_verified` | conclusão só é aceita com artefato/evidência |
| evento duplicado → idempotente | `dispatchIncoming()` verifica evento aceito por `reason === eventId`; rota testada com replay | dedupe durable depende do backend persistido; há também `seen` process-local |
| heartbeat do ciclo | `runIrisWorker()` persiste `coordinator.lastCoordinatorRun.heartbeat` e endpoint `GET /api/flux/iris/worker` lê | não é heartbeat real do agente Hermes |

## 4. Endpoints auditados

| Endpoint | Função | Autenticação/segurança | Readback/receipt |
|---|---|---|---|
| `POST /api/flux/intake` | parse/persist intake e cria cards/jobs | `requireRole(request, 'coordinator')` | retorna `receipt` de `persistIntake()` |
| `POST /api/flux/dispatcher` | recebe evento Flux dispatcher | `verifyDispatcherToken()` com Bearer e comparação timing-safe | `dispatchIncoming()` cria receipt `dispatcher.receive` |
| `POST /api/flux/hermes-events` | sink local para hooks outbound Hermes | HMAC `X-Hermes-Signature-256` sobre body cru | persiste job/evento e retorna receipt de dispatcher |
| `GET /api/flux/iris/worker` | readback do último ciclo/holds/actions | leitura local | retorna `lastCoordinatorRun`, `waitingReasons`, `holds`, `requiredActions` |
| `POST /api/flux/blockers/:id/forward` | transforma blocker aberto em Handoff/requiredAction | sessão coordinator; actor vem do servidor | teste confirma evento e readback idempotente |
| `POST /api/flux/handoffs/:id/resume` | resume/release de Handoff operacional | sessão coordinator | evento com `correlationId`; replay idempotente |

## 5. Plano de scheduler periódico

Status recomendado: **não habilitar como daemon contínuo ainda**. Usar agendamento externo chamando o worker em `--once` após corrigir o wrapper.

Plano seguro:

1. Corrigir `scripts/iris-worker.mjs` para resolver `vite-node` de forma confiável ou adicionar `vite-node` como dependência direta.
2. Criar comando operacional explícito:
   - `FLUX_DATA_FILE=<runtime_state> IRIS_WORKER_DRY_RUN=0 npm run worker:iris -- --once`
3. Agendar fora do processo Node, sem alterar produção nesta story:
   - Windows Task Scheduler ou cron equivalente, intervalo inicial 5–15 minutos.
4. Cada ciclo deve:
   - executar uma vez e sair;
   - registrar `coordinator.lastCoordinatorRun`;
   - registrar `event-iris-worker-*`, `event-iris-followup-*`, `event-iris-keep-going-*`;
   - expor readback via `GET /api/flux/iris/worker`.
5. Política de alerta:
   - se `result != completed`, `holds > 0`, `requiredActions > 0` vencidas ou `nextFollowUp` vencido, Kora/Íris revisa antes de nova automação externa.
6. Gate antes de produção:
   - Sergio precisa aprovar endpoint, secrets, intervalo, owner de operação, rollback e evidência de dry-run/staging.

## 6. Retry e idempotência

### Implementado/local

- Worker: `requiredActions` usam `dedupeKey` determinística `iris-worker|<kind>|<id>|<marker>`.
- Worker: ciclo já registrado com mesmo `correlationId` retorna sem duplicar quando não dry-run.
- Dispatcher inbound: `eventId` é chave de dedupe por evento aceito em `state.events.reason`.
- Endpoint dispatcher: teste replaya o mesmo evento duas vezes e verifica um único evento persistido.
- Handoff/blocker: repetição com mesmo `correlationId` não duplica evento/Handoff.
- Receipts: `createReceipt()` sanitiza metadata por chave sensível.

### Bloqueios/limites

- Dedupe process-local (`seen`) não basta sozinho para restart; a parte persistida por `state.events.reason` cobre o teste local, mas produção precisa inbox/constraint durável por `eventId`.
- Retry outbound real do worker para Hermes ainda não está confirmado com receipt/readback; `FakeDispatcherAdapter` prova contrato local, não entrega externa.
- `HttpDispatcherAdapter.publish()` exige validação em ambiente seguro com endpoint fake/local antes de qualquer remote.

## 7. Roteiro E2E local intake → triagem → job → handoff → blocker → readback

Roteiro já coberto por testes direcionados e deve permanecer como smoke local antes de habilitar scheduler:

1. Intake local
   - Rodar parser/plan em `tests/flux-close-local.test.ts`.
   - Aceite: projeto, cards, jobs, dependências e `correlationId` criados sem fixture fixa.
2. Triagem/worker
   - Rodar `tests/iris-worker.test.ts`.
   - Aceite: idle detectado; tracks paralelas calculadas; `BLOCKER_OPEN`, `GATE_REQUIRED` e `OUTSIDE_PLAN_SERGIO` geram HOLD.
3. Dispatcher inbound
   - Rodar caso `deduplicates the dispatcher route through persistent inbox after route-level restart`.
   - Aceite: Bearer válido aceita evento e replay não duplica.
4. Hermes webhook fake/local
   - Rodar `tests/hermes-webhook.test.ts`.
   - Aceite: HMAC válido, lifecycle suportado, job persistido e readback do estado.
5. Handoff
   - Rodar `tests/handoffs-operational.test.ts`.
   - Aceite: release/resume idempotente; legacy permanece read-only.
6. Blocker
   - Rodar `tests/blocker-forward.test.ts`.
   - Aceite: blocker aberto gera Handoff e ação em HOLD; não resolve sem evidência real.
7. Readback
   - Ler snapshot/estado após cada operação com `getSnapshot()`/`getState()` ou endpoints locais.
   - Aceite: não declarar conclusão sem `artifactRefs`/`evidenceRefs` ou receipt.

## 8. Contrato mínimo do dispatcher outbound Hermes

### Flux → dispatcher/Hermes

Evento mínimo:

```json
{
  "eventId": "evt-unique-idempotency-key",
  "type": "job",
  "jobId": "job-id",
  "event": "dispatched",
  "sentAt": "ISO-8601",
  "correlationId": "corr-id",
  "payload": {
    "cardId": "CARD-ID",
    "project": "FBR Agency Flux",
    "agent": "Nome do agente",
    "role": "papel",
    "objective": "objetivo verificável",
    "status": "ready",
    "owner": "owner",
    "nextCheck": "ISO-8601",
    "lastActivity": "ISO-8601"
  }
}
```

Headers mínimos:

```text
Authorization: Bearer <secret_ref:FLUX_DISPATCHER_TOKEN>
Content-Type: application/json
Idempotency-Key: <eventId>
```

Requisitos:

- timeout explícito;
- retry apenas para erro transitório/5xx/timeout;
- nunca retry automático para 4xx;
- resposta deve conter receipt ou identificador de entrega;
- Flux só marca dispatch real depois de receipt e readback.

### Hermes → Flux

Evento aceito via `POST /api/flux/hermes-events`:

- body JSON bruto assinado por HMAC SHA-256;
- header `X-Hermes-Signature-256: sha256=<digest>`;
- `delivery_id` usado como `eventId`;
- `hook_event_name` deve estar na matriz suportada;
- `extra.task_id` obrigatório.

Eventos mapeados:

| Hermes | Flux |
|---|---|
| `kanban_task_claimed` | `started` |
| `on_kanban_worker_spawned` | `progress` |
| `kanban_task_completed` | `completed` |
| `kanban_task_blocked` | `blocked` |
| `on_kanban_worker_exited` | `failed` |
| `on_kanban_task_updated` | `progress` |

Eventos não mapeados propositalmente:

- `kanban_heartbeat`: não há evidência de hook outbound documentado.
- `on_kanban_dispatch_tick`: sem identidade estável de task/job para readback.
- `on_kanban_worker_stale_claim`: não prova heartbeat.

## 9. Gates

| Gate | Status | Owner | Evidência necessária |
|---|---|---|---|
| Enviar mensagens reais para Hermes/agentes | BLOQUEADO | Sergio + Théo | endpoint, secret, receipt e readback local/staging aprovados |
| Habilitar scheduler periódico em produção/cron | BLOQUEADO | Sergio + Théo/Kora | wrapper corrigido, intervalo aprovado, rollback e readback `lastCoordinatorRun` |
| Publicar After Forty | BLOQUEADO/Fora do escopo | Sergio/Gestor Editorial | aprovação explícita de publicação |
| Usar secrets reais | BLOQUEADO nesta story | Théo | secret manager/runtime seguro; sem secrets em docs/logs |
| Declarar dispatcher outbound pronto | BLOQUEADO | Théo | receipt externo + readback de job; replay idempotente pós-restart |

## 10. Blockers

1. **Wrapper do worker quebrado**
   - Severidade: alta.
   - Fato: `npm run worker:iris -- --once --dry-run` falha por `Cannot find module ... node_modules/vite-node/vite-node.mjs`.
   - Owner: Théo.
   - Próxima ação: adicionar/resolver `vite-node` no projeto ou trocar wrapper para comando suportado; repetir dry-run via `npm run worker:iris`.

2. **Typecheck completo bloqueado por teste/adaptador Supabase histórico**
   - Severidade: média/alta.
   - Fato: `npm run typecheck` falha porque `SupabaseFluxRepository` não é exportado.
   - Owner: Théo.
   - Próxima ação: alinhar `tests/external-adapters.test.ts` e `src/lib/persistence.ts`.

3. **Suíte completa não verde**
   - Severidade: média.
   - Fato: 14 falhas em 137 testes na suíte histórica.
   - Owner: Théo/Gabe conforme área.
   - Próxima ação: abrir cards separados para UI contracts, external adapters, PostgreSQL real e lock concorrente.

4. **Dispatcher outbound real não confirmado**
   - Severidade: alta.
   - Fato: testes usam fake/local webhook; não há receipt/readback de envio real Hermes.
   - Owner: Théo + Hermes/plugin owner.
   - Próxima ação: validar em endpoint fake assinado com receipt e depois pedir Gate para remoto.

5. **Heartbeat real de agente Hermes não comprovado**
   - Severidade: média.
   - Fato: há heartbeat do ciclo Íris, mas não hook outbound `kanban_heartbeat` documentado.
   - Owner: Hermes/plugin owner.
   - Próxima ação: expor hook estável ou manter heartbeat limitado ao ciclo do worker.

## 11. Validação contra aceite do PRD

| Critério do PRD | Status | Evidência |
|---|---|---|
| Estados e transições do worker têm evidência | Parcialmente atendido | testes direcionados 20/20; tabela de estados acima; wrapper npm bloqueado |
| Toda espera tem owner, ação e next check | Atendido localmente | dry-run gerou `requiredActions` com `who`, `dueCheck`, `fallback`; blockers listados com owner |
| Idempotência e retry estão testados localmente | Parcialmente atendido | idempotência local testada; retry externo ainda só contrato/plano |
| Dispatcher outbound não declarado pronto sem receipt/readback real | Atendido | documento mantém status BLOQUEADO; nenhum envio real executado |

## 12. Próximo responsável

Próximo responsável: **Théo**.

Próximo pacote de trabalho:

1. Corrigir wrapper `scripts/iris-worker.mjs`/dependência `vite-node`.
2. Alinhar `SupabaseFluxRepository` ou teste histórico para recuperar typecheck.
3. Criar inbox/constraint durável para `eventId` no backend aprovado.
4. Validar dispatcher outbound contra endpoint fake com receipt e readback.
5. Só depois pedir Gate de Sergio para scheduler/produção.

## 13. Handoff completo

```yaml
de: "Hermes Agent / subagent FLUX-021"
para: "Théo"
card: "FLUX-021 — Worker contínuo, dispatcher e E2E operacional"
objetivo do job: "Auditar worker, endpoints, eventos, heartbeat, Handoffs, receipts e testes; documentar contrato e blockers sem executar mensagens reais ou produção."
entregável: "F:/Projetos/_FBR/FBR Agency Flux/08-historico/FLUX-021-worker-dispatcher-e2e.md"
decisões/suposições:
  - "FATO: testes direcionados FLUX-021 passaram: 5 files, 20 tests."
  - "FATO: npm run worker:iris falha por ausência/resolução de vite-node local."
  - "FATO: dispatcher outbound real não foi acionado; status permanece bloqueado sem receipt/readback externo."
  - "HIPÓTESE: scheduler periódico deve ser agendado fora do processo, executando --once em intervalo curto, depois de corrigir wrapper e obter Gate."
pendências/blockers:
  - "Wrapper do worker quebrado; severidade alta; owner Théo; corrigir dependência/resolução de vite-node."
  - "Typecheck completo falha por SupabaseFluxRepository ausente; severidade média/alta; owner Théo."
  - "Suíte completa histórica tem 14 falhas; severidade média; owners Théo/Gabe conforme área."
  - "Dispatcher outbound real sem receipt/readback; severidade alta; owner Théo + Hermes/plugin owner."
  - "Heartbeat real Hermes não comprovado; severidade média; owner Hermes/plugin owner."
gate: "revisão; produção/scheduler/mensagem real/publicação continuam bloqueados até aprovação explícita de Sergio"
critérios de aceite/evidência:
  - "Estados/transições documentados com fonte de código/teste."
  - "Testes direcionados: npx vitest run tests/flux-close-local.test.ts tests/iris-worker.test.ts tests/hermes-webhook.test.ts tests/blocker-forward.test.ts tests/handoffs-operational.test.ts => 20 passed."
  - "Dry-run do worker via npx vite-node mostrou dispatched: [] e HOLDS/Gates sem envio real."
  - "Dispatcher outbound declarado como não pronto até receipt/readback real."
```
