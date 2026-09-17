# Implementação v1.5 — resultado local — 2026-09-17

## Concluídas/verificadas

- **S15-01:** snapshot passou a expor contagens separadas (`currentCounts`/`historicalCounts`); histórico continua opt-in na importação e a Home/Jobs não o soma à operação corrente.
- **S15-02:** Home indexa cards por `project.id`, preservando a compatibilidade de leitura quando o card registra o nome exibido.
- **S15-07:** Home apresenta owner, próxima ação, blocker/HOLD, decisão/eventos e nextCheck, além de links acionáveis para Jobs/Handoffs.
- **S15-08:** Handoffs ativos são a fila padrão; histórico exige checkbox explícito e ativos são ordenados primeiro.
- **S15-09:** há um botão de Chat contextual por Handoff/blocker, sem duplicar ações genéricas.
- **S15-06 (local):** `POST /api/flux/intake` aceita `preview: true` sem persistir; o POST tradicional permanece compatível e retorna receipt/readback.
- **S15-03/S15-04/S15-05 (local):** modelos persistidos locais de Sprint/Story, API `GET/POST /api/flux/planning` e tela `/sprints` navegável com status, progresso, owners, blockers, aceite, receipts via timeline e nextCheck.
- **S15-10/S15-11/S15-14 (local):** intake gera nextCheck; worker mantém último/próximo ciclo e required actions; mutações de planejamento geram receipts/eventos.
- **S15-15:** caminho local After Forty permanece coberto pelos testes de fluxo e pelo script de smoke Docker; o script foi corrigido para declarar escopo público local e usar o fixture configurado.

## Parcial/bloqueado

- **S15-12:** dispatcher real/Hermes permanece externo; apenas adapter fake/local pode ser demonstrado.
- **S15-13, S15-16, S15-18:** Auth/RBAC persistente remoto, rotação de secrets, RLS, migration externa, deploy e runbook de infraestrutura não foram declarados concluídos.
- O smoke Docker iniciou e autenticou localmente, mas a execução completa após restart ainda apresentou falha intermitente de readback no script; não foi tratado como QA público nem como integração remota.

## Arquivos principais

- `09-codigo/src/lib/flux-repository.ts`
- `09-codigo/src/lib/planning.ts`
- `09-codigo/src/lib/intake.ts`
- `09-codigo/src/lib/persistence.ts`
- `09-codigo/src/app/dashboard-client.tsx`
- `09-codigo/src/app/handoffs/handoffs-client.tsx`
- `09-codigo/src/app/sprints/page.tsx`
- `09-codigo/src/app/api/flux/planning/route.ts`
- `09-codigo/src/app/api/flux/intake/route.ts`
- `09-codigo/scripts/smoke-e2e-local.sh`
- `09-codigo/tests/v15-planning.test.ts`

## Verificação

- `npm test` — **23 arquivos, 120 testes passaram**.
- `npm run typecheck` — passou.
- `npm run lint` — passou.
- `npm run build` — passou; rotas `/sprints` e `/api/flux/planning` incluídas.
- Não houve commit, push, deploy, migration externa, uso de credenciais reais ou alteração em `.hermes/*`.
