# Schema do banco — FBR Agency Flux

**Fonte:** `04-database/001_flux_foundation.sql`, `04-database/002_flux_state_version_cas.sql` e tipos de domínio em `09-codigo/src/lib/flux-repository.ts`.

## 1. Fundação relacional

A migration `001_flux_foundation.sql` cria a extensão `pgcrypto` e estas tabelas:

### `flux_projects`

- `id uuid PK default gen_random_uuid()`
- `name text NOT NULL`
- `slug text NOT NULL UNIQUE`
- `project_type text NOT NULL DEFAULT 'custom'`
- `status text NOT NULL DEFAULT 'planned'` — `planned | active | blocked | completed | archived`
- `owner_name text NOT NULL DEFAULT 'Sergio'`
- `description text`
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

### `flux_agents`

- `id uuid PK default gen_random_uuid()`
- `name text NOT NULL UNIQUE`
- `role text NOT NULL`
- `profile_ref text`
- `status text NOT NULL DEFAULT 'active'` — `active | paused | retired`
- `created_at timestamptz NOT NULL DEFAULT now()`

### `flux_cards`

- `id uuid PK default gen_random_uuid()`
- `project_id uuid NOT NULL FK → flux_projects.id ON DELETE RESTRICT`
- `title text NOT NULL`
- `objective text NOT NULL`
- `status text NOT NULL DEFAULT 'planned'` — `planned | ready | in_progress | review | blocked | awaiting_approval | approved | executing | verifying | completed | failed`
- `responsible_agent_id uuid FK → flux_agents.id ON DELETE RESTRICT`
- `priority text NOT NULL DEFAULT 'normal'` — `low | normal | high | critical`
- `acceptance_criteria text NOT NULL`
- `risk text`
- `blocker text`
- `due_at timestamptz`
- `created_at timestamptz NOT NULL DEFAULT now()`
- `updated_at timestamptz NOT NULL DEFAULT now()`

### `flux_card_dependencies`

- `card_id uuid NOT NULL FK → flux_cards.id ON DELETE CASCADE`
- `depends_on_card_id uuid NOT NULL FK → flux_cards.id ON DELETE RESTRICT`
- PK composta: `(card_id, depends_on_card_id)`
- Check: `card_id <> depends_on_card_id`

### `flux_approvals`

- `id uuid PK default gen_random_uuid()`
- `card_id uuid NOT NULL FK → flux_cards.id ON DELETE RESTRICT`
- `requested_by_agent_id uuid FK → flux_agents.id ON DELETE RESTRICT`
- `decision text NOT NULL DEFAULT 'pending'` — `pending | approved | rejected | changes_requested`
- `action_scope text NOT NULL`
- `impact text NOT NULL`
- `rollback_plan text`
- `decided_by text`
- `decided_at timestamptz`
- `created_at timestamptz NOT NULL DEFAULT now()`

### `flux_events`

- `id uuid PK default gen_random_uuid()`
- `project_id uuid NOT NULL FK → flux_projects.id ON DELETE RESTRICT`
- `card_id uuid FK → flux_cards.id ON DELETE RESTRICT`
- `event_type text NOT NULL`
- `actor text NOT NULL`
- `from_status text`
- `to_status text`
- `correlation_id uuid NOT NULL DEFAULT gen_random_uuid()`
- `payload jsonb NOT NULL DEFAULT '{}'::jsonb`
- `created_at timestamptz NOT NULL DEFAULT now()`

### `flux_artifacts`

- `id uuid PK default gen_random_uuid()`
- `project_id uuid NOT NULL FK → flux_projects.id ON DELETE RESTRICT`
- `card_id uuid FK → flux_cards.id ON DELETE RESTRICT`
- `artifact_type text NOT NULL`
- `path_or_ref text NOT NULL`
- `checksum text`
- `verified boolean NOT NULL DEFAULT false`
- `created_at timestamptz NOT NULL DEFAULT now()`

### `flux_handoffs`

- `id uuid PK default gen_random_uuid()`
- `project_id uuid NOT NULL FK → flux_projects.id ON DELETE RESTRICT`
- `card_id uuid FK → flux_cards.id ON DELETE RESTRICT`
- `from_actor text NOT NULL`
- `to_actor text NOT NULL`
- `summary text NOT NULL`
- `done text NOT NULL`
- `risks text`
- `next_step text NOT NULL`
- `evidence_ref text`
- `created_at timestamptz NOT NULL DEFAULT now()`

## 2. Índices definidos

- `flux_cards_project_status_idx` em `flux_cards(project_id, status)`
- `flux_approvals_decision_idx` em `flux_approvals(decision)`
- `flux_events_project_created_idx` em `flux_events(project_id, created_at DESC)`
- `flux_artifacts_project_idx` em `flux_artifacts(project_id)`

## 3. RLS

A migration habilita Row Level Security em todas as oito tabelas da fundação:

`flux_projects`, `flux_agents`, `flux_cards`, `flux_card_dependencies`, `flux_approvals`, `flux_events`, `flux_artifacts` e `flux_handoffs`.

A migration não cria policies públicas. O comentário define comportamento fail-closed: as policies devem ser adicionadas pelo contrato de autenticação do projeto.

## 4. Snapshot operacional `custom_agencyflux.flux_state`

A migration `002_flux_state_version_cas.sql` **não cria** essa tabela; ela pressupõe que `custom_agencyflux.flux_state` já exista no schema autorizado.

Campos usados pelo adapter Supabase:

- `state_key` — chave textual; o runtime usa `fbr-agency-flux`
- `state` — `jsonb` contendo o `FluxState`
- `version` — `integer NOT NULL DEFAULT 1`
- `updated_at` — timestamp de atualização

A migration 002:

- adiciona `version` se não existir;
- faz backfill a partir de `state.version`;
- exige `version > 0` via `flux_state_version_positive`;
- documenta que `flux_state.version` deve coincidir com `state.version`.

O adapter usa `version` para optimistic concurrency/CAS:

- leitura: `state_key → state, version`;
- gravação: upsert por `state_key`;
- atualização: `PATCH` condicionado a `state_key` e `version` esperada, incrementando a versão.

## 5. Estrutura JSON de `state`

Obrigatórios em `FluxState`:

- `version: number`
- `projects[]`
- `cards[]`
- `approvals[]`
- `gates[]`
- `events[]`
- `handoffs[]`
- `artifacts[]`

Opcionais:

- `blockers[]`
- `jobs[]`
- `agentRuns[]`
- `requiredActions[]`
- `sprints[]`
- `stories[]`
- `coordinator`

Os tipos completos estão em `09-codigo/src/lib/flux-repository.ts`, incluindo tenant/project scope, jobs, handoffs, blockers, sprints, stories, required actions e coordinator runs.

## 6. O que este documento não afirma

- Não confirma que o schema remoto está aplicado.
- Não confirma a existência atual de `custom_agencyflux.flux_state` no Supabase.
- Não é uma leitura do banco remoto.
- Não contém credenciais.

Este é o schema **definido/versionado pelo projeto**, não um inventário readback do banco remoto.
