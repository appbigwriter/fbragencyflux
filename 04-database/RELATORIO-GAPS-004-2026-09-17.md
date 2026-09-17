# Migração 004 aditiva — análise de lacunas e validação

**Data:** 2026-09-17
**Escopo:** `003_flux_relational_persistence.sql` (já aplicado no remoto) vs contrato `src/lib/relational-schema.ts` + consumidor `src/lib/relational-repository.ts`.
**Produto:** `04-database/004_flux_relational_rpcs.sql` (novo, aditivo, idempotente).

## Gaps objetivos encontrados no 003

1. **143 colunas do contrato ausentes** (derivadas programaticamente de `relationalSpecs`, 14 entidades):
   - `flux_cards`: `assignee`, `criteria_values` (2)
   - `flux_approvals`: `title`, `requested_by` (2)
   - `flux_gates`: `evidence_refs`, `blocker_refs` (2)
   - `flux_jobs`: 18 (refs de arrays, `correlation_ref`, `domain_source_type`, `historical`, `active_blocker`, `last_activity`, `next_check_label`, `owner`, `last_event`, `depends_on`, `blocks`, `can_start`, `parallel_group`, `track`, `dependency_reason`)
   - `flux_handoffs`: 43 (`decisions`, labels, nested `resolution_action_*`/`interaction_*`/`solution_*` achatados)
   - `flux_artifacts`: 7 (`name`, `status`, `source_path`, `size`, `content_text`, `content_binary`, `content_type`)
   - `flux_blockers`: 10 (`source_id`, `resolution_action_*`)
   - `flux_sprints`: 2; `flux_stories`: 6; `flux_required_actions`: 2; `flux_coordinator_runs`: 5; `flux_receipts`: 19 (`correlation_ref`, `started_at`, `completed_at`, `metadata_*`); `flux_events`: 25
   - Colunas de infra escritas pelo repositório também ausentes: `external_id`/`ordinal` em 14 tabelas, `<ref>_external_ref` por campo com FK, `slug` (projects), `acceptance_criteria` (cards), `tenant_id` em 8 tabelas, `project_id` em 3, `container_handoff_id` (blockers), `flux_tenants.external_id`.
   - Total DDL de colunas novas emitidas: **197** (todas `add column if not exists`).
2. **Zero funções RPC** — `SqlRelationalTransport` chama `flux_relational_read()` e `flux_relational_commit($1,$2::jsonb,$3::text[])`; nada disso existia no 003.
3. **RLS incompleto e sem policies** — 003 só faz `enable row level security` em 37 tabelas; **as 6 tabelas-base (`flux_projects`, `flux_cards`, `flux_approvals`, `flux_events`, `flux_artifacts`, `flux_handoffs`) + `flux_agents`, `flux_project_agents`, `flux_card_dependencies` ficaram SEM RLS habilitado**, e **nenhuma policy** foi criada (comentário no 003: "No public policy is created here"). Resultado líquido: sem policies, papéis não-owner não leem nada (deny-all), e o runtime via service_role dependeria de bypass de owner; comFORCE, as RPCs SECURITY DEFINER do owner seriam bloqueadas.
4. **Índices de dashboard insuficientes** — 003 cria `(tenant_id, status)` sem `created_at`; faltam `(tenant, status, created_at desc)`, parciais de fila ativa, e FK lookups por `card_id`.
5. **Sem trigger de `updated_at`** — nenhuma automação; e o contrato RPC exige que `updated_at` gravado explicitamente pelo writer seja preservado.
6. **NOT NULL vs domínio** — 003 exige NOT NULL em colunas onde o domínio atual grava NULL explícito (coordinator global, receipt sem actor, blocker legado parcial, sprint/story sem tenant): 27 relaxamentos `drop not null` necessários (não afetam dados existentes; apenas permitem o contrato).
7. **CHECKs restritivos** — `flux_cards.status` não aceita `awaiting_owner` (presente no domínio e nos testes); `flux_receipts.status` não aceita `blocked`. Alargados por superset.

## O que o 004_flux_relational_rpcs.sql faz (aditivo)

- DDL: 197 `add column if not exists` (tipos fiéis ao spec: `text[]`, `timestamptz`, `bytea`, `bigint`, FKs `references ... on delete restrict`).
- 27 `alter column drop not null` + 3 CHECKs alargados (superset).
- `flux_runtime_revision` (tabela singleton CAS: `version bigint` + `coordinator_waiting_reasons text[]`) — sem snapshot/jsonb persistido.
- Índices: 6 compostos `(tenant_id, status, <tempo> desc)`, 2 parciais (jobs ativos, blockers open), 3 FK lookup.
- Trigger `flux_touch_updated_at`: auto-touch em update ad-hoc; preserva `updated_at` quando o writer o define (contrato RPC).
- RLS: `enable` + `no force` em todas as tabelas `flux_%`; função `flux_app_tenant()` = `current_setting('app.tenant_id', true)`; policy `flux_tenant_isolation` FOR ALL em 45 tabelas (diretas por `tenant_id`; filhas por exists no pai; `flux_tenants` por `id`). Fail-closed: sem contexto => 0 linhas.
- RPCs `flux_relational_read()` / `flux_relational_commit(expected_version, changes, waiting_reasons)`:
  - CAS com `select ... for update` na revisão global; conflito => `40001 PERSISTENCE_CONFLICT` (repo mapeia para 409).
  - Whitelist explícita por tabela (coluna fora do contrato => `INVALID_RELATIONAL_COLUMN`); só `operation='upsert'` (`DELETION_NOT_SUPPORTED`); row só-com-id => `on conflict do nothing`.
  - `revoke all from public`; `grant execute` apenas para `service_role` se existir.
- JSONB apenas como transporte/variável local — nunca coluna persistida (ADR-PERSISTENCIA-100).

## Validação executada (Postgres real, não simulado)

- Docker `postgres:17` limpo: `003 OK` → `004 OK` → `004 reapply OK` (idempotente; NOTICEs de "skipping" apenas).
- RPCs: commit v0→v1 (tenant fora de banda + project + card), readback com `criteria_values {one,two}` e `tenant_id_external_ref`; commit v1→v2 com `waiting_reasons` persistido; CAS stale => `40001`; coluna inválida => `INVALID_RELATIONAL_COLUMN`; delete => `DELETION_NOT_SUPPORTED`.
- Trigger: update ad-hoc auto-toca `updated_at`; `updated_at` do writer preservado via commit.
- RLS (como role não-superuser `flux_app`): sem contexto => 0; tenant errado => 0; tenant certo => 1; `flux_tenants` idem.
- E2E do contrato real: teste `tests/relational-rpcs-004.test.ts` (vitest+PGlite, 003 + 004 novo): roundtrip completo do fixture `fullState()` — todas as coleções iguais, segunda leitura estável, `update()` incrementa versão. **PASS**.

## Observações / riscos residuais

- Existe um rascunho anterior `004_flux_runtime_relational.sql` (gerado por `tests/build-relational-migration.mjs`) com o mesmo propósito, mas que usa `FORCE ROW LEVEL SECURITY` — **se aplicado, quebraria as próprias RPCs SECURITY DEFINER do owner** (owner não-superuser no Supabase seria filtrado pelas policies). O 004 novo desfaz FORCE (`no force`) e é superconjunto funcional do rascunho. Recomenda-se remover/arquivar o rascunho e apontar o gerador `.mjs` para o novo arquivo antes de qualquer Gate.
- `flux_tenants` continua fora da whitelist do commit (provisionamento out-of-band, igual ao contrato testado do repo).
- Duas falhas pré-existentes em `tests/relational-persistence.test.ts` ("reads do not seed..." / "real relational adapter...") vêm de trabalho não commitado de outro agente que reintroduziu `JsonFluxRepository` em `persistence.ts` (+ `relational-driver.ts` não rastreado). Não relacionadas a esta migração; não tocadas.
- Ainda não aplicado no remoto — requer Gate do Sergio + backup/readback (regra do 003/ADR-100).
