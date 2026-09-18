# FLUX-023 — implementação worker E2E local

Data/hora: 2026-09-18 00:54:45 -0300

## Status

`local_ready_partial`

O worker Íris está executável pelo wrapper oficial em `--once --dry-run` e os contratos locais de retry, idempotência e E2E intake→triagem→job→handoff→blocker→readback foram cobertos por teste automatizado. Dispatcher outbound real, scheduler/cron e monitoramento contínuo permanecem fora do escopo e não foram declarados prontos.

## Alterações realizadas

- `09-codigo/package.json`
  - adicionada dependência dev `vite-node` para o entrypoint TypeScript do worker.
- `09-codigo/package-lock.json`
  - lockfile atualizado por `npm install --save-dev vite-node`.
- `09-codigo/scripts/iris-worker.mjs`
  - corrigido caminho do CLI de `vite-node` para `node_modules/vite-node/dist/cli.mjs`.
  - `--dry-run` sem `FLUX_DATA_FILE` copia `data/flux-state.json` para arquivo temporário e força persistência JSON local (`FLUX_PERSISTENCE=json`, `FLUX_LOCAL_MODE=1`) para não falhar fechado em Supabase mal configurado nem alterar o snapshot do repositório durante smoke local.
  - adicionada saída explícita em erro de spawn.
- `09-codigo/src/lib/iris-worker.ts`
  - retry de dispatch bem-sucedido atualiza job para `lastEvent: dispatched` e `status: in_progress`, removendo o estado local bloqueado deixado por falha transitória anterior.
- `09-codigo/tests/iris-worker.test.ts`
  - adicionados testes de retry do dispatcher local, idempotência do ciclo persistido, wrapper oficial e E2E local completo.

## Evidências executadas

### Falha reproduzida antes da correção

Diretório: `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`

```bash
npm run worker:iris -- --once --dry-run
```

Resultado inicial: `exit 1`, com `MODULE_NOT_FOUND` para:

```text
node_modules/vite-node/vite-node.mjs
```

Após instalar/corrigir `vite-node`, a segunda falha local foi reproduzida como `exit 1` por tentativa de Supabase com credencial inválida/ambiente local:

```text
FluxError: Relational persistence rejected the operation (HTTP 401: Unauthorized)
```

### Wrapper oficial verificado

Diretório: `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`

```bash
npm run worker:iris -- --once --dry-run
```

Resultado final: `exit 0`.

Trecho verificado:

```json
"dryRun": true,
"result": "dry_run"
```

### Testes direcionados

Diretório: `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`

```bash
npm test -- --run tests/iris-worker.test.ts tests/iris-orchestrator.test.ts tests/blocker-forward.test.ts tests/handoffs-operational.test.ts
```

Resultado:

```text
Test Files  4 passed (4)
Tests       22 passed (22)
```

Cobertura adicionada/ajustada:

- retry: falha transitória de dispatcher vira `DISPATCH_FAILED`; ciclo seguinte reenvia com adapter explícito e marca job `in_progress`/`dispatched`.
- idempotência: mesmo ciclo persistido não duplica evento `iris coordinator cycle` nem `requiredActions`.
- E2E local: briefing/intake → triagem Íris → job → worker → Handoff → blocker aberto → forward → artifact/readback → resolve blocker → snapshot sem blocker aberto.
- wrapper: `npm run worker:iris -- --once --dry-run` passa mesmo com env Supabase inválido, porque o dry-run local usa JSON.

### Typecheck

Diretório: `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`

```bash
npm run typecheck
```

Resultado: `exit 0`.

### Lint

Diretório: `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`

```bash
npm run lint
```

Resultado final: `exit 0`.

Observação: a primeira execução do lint falhou por `ENOENT` em diretório temporário de teste já removido (`flux-long-lock-590UWq`); rerun imediato passou. Permanece apenas warning preexistente de Next em `src/app/layout.tsx` (`<a>` em vez de `<Link />`).

## Blockers e limites restantes

- `dispatcher_outbound_real`
  - causa: não há configuração/contrato validado de `FLUX_DISPATCHER_URL` + `FLUX_DISPATCHER_TOKEN` neste escopo.
  - impacto: o worker só prova dispatch local com adapter fake/explícito; não prova entrega real a agentes.
  - owner: Théo/Sergio, com Gate antes de configurar credenciais reais.
  - próximo check: definir endpoint, autenticação, retry durável e readback externo em história própria.
  - evidência para fechar: evento outbound real aceito pelo receptor + readback persistido sem secrets em logs.

- `monitoramento_continuo_scheduler`
  - causa: scheduler/cron/daemon permanente estão fora do escopo da FLUX-023.
  - impacto: execução validada é ciclo explícito `--once`, não monitor contínuo.
  - owner: Kora/Théo em card futuro.
  - próximo check: definir cadência, locking, observabilidade e estratégia de parada/rollback.
  - evidência para fechar: job agendado controlado, heartbeat durável e readback após restart.

- `supabase_runtime_401`
  - causa: runtime local tinha configuração relacional apontando para Supabase com resposta HTTP 401.
  - impacto: não foi usado como sucesso de persistência remota; dry-run local foi isolado em JSON.
  - owner: agente da frente de persistência/APIs.
  - próximo check: validar service role/URL no runtime seguro e migrations/readback relacionais.
  - evidência para fechar: `load/save/update/readback` relacional com credencial correta, sem fallback JSON.

## Declaração de escopo

Não foram habilitados scheduler, cron, dispatcher outbound real, secrets, deploy, publicação ou monitoramento contínuo. A evidência desta entrega é local e determinística.