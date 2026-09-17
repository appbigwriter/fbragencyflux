-- FBR Agency Flux — 004_flux_relational_rpcs.sql
-- Migração 004 ADITIVA sobre 003 (003 já aplicado no remoto; não re-aplicar, não apagar dados).
-- Fecha as lacunas entre 003_flux_relational_persistence.sql e src/lib/relational-schema.ts:
--   1) Colunas de spec ausentes no 003 (add column if not exists; não toca dados existentes).
--   2) Funções RPC flux_relational_read() / flux_relational_commit(expected_version, changes, waiting_reasons)
--      exigidas por src/lib/relational-repository.ts (SqlRelationalTransport).
--   3) Índices de dashboard (tenant_id + status + created_at) e filas ativas (parciais).
--   4) RLS policies reais: 003 apenas ENABLE RLS sem nenhuma policy (deny-all para não-owner).
--      Aqui criamos policy tenant-scoped fail-closed via current_setting('app.tenant_id', true):
--      sem contexto de tenant => NULL => zero linhas. As RPCs são SECURITY DEFINER do owner da
--      migration e não são afetadas (owner não é sujeito a FORCE; não usamos FORCE RLS aqui).
--   5) Trigger updated_at automático em toda tabela flux_* com a coluna.
-- JSONB existe APENAS como transporte das RPCs, nunca como coluna persistida (ADR-PERSISTENCIA-100).
-- Idempotente: pode ser re-executada; coexiste com 003 (ordem: 003 -> este arquivo).

begin;

-- ============================================================================
-- 1) DDL ADITIVA — colunas do contrato relational-schema.ts ausentes no 003
-- ============================================================================

alter table public.flux_tenants add column if not exists external_id text unique;
alter table public.flux_projects add column if not exists external_id text unique;
alter table public.flux_projects add column if not exists ordinal bigint;
alter table public.flux_projects add column if not exists tenant_id_external_ref text;
alter table public.flux_cards add column if not exists external_id text unique;
alter table public.flux_cards add column if not exists ordinal bigint;
alter table public.flux_cards add column if not exists project_id_external_ref text;
alter table public.flux_cards add column if not exists tenant_id_external_ref text;
alter table public.flux_cards add column if not exists assignee text;
alter table public.flux_cards add column if not exists criteria_values text[];
alter table public.flux_approvals add column if not exists external_id text unique;
alter table public.flux_approvals add column if not exists ordinal bigint;
alter table public.flux_approvals add column if not exists card_id_external_ref text;
alter table public.flux_approvals add column if not exists tenant_id_external_ref text;
alter table public.flux_approvals add column if not exists title text;
alter table public.flux_approvals add column if not exists requested_by text;
alter table public.flux_gates add column if not exists external_id text unique;
alter table public.flux_gates add column if not exists ordinal bigint;
alter table public.flux_gates add column if not exists card_id_external_ref text;
alter table public.flux_gates add column if not exists project_id_external_ref text;
alter table public.flux_gates add column if not exists evidence_refs text[];
alter table public.flux_gates add column if not exists blocker_refs text[];
alter table public.flux_jobs add column if not exists external_id text unique;
alter table public.flux_jobs add column if not exists ordinal bigint;
alter table public.flux_jobs add column if not exists card_id_external_ref text;
alter table public.flux_jobs add column if not exists project_id_external_ref text;
alter table public.flux_jobs add column if not exists tenant_id_external_ref text;
alter table public.flux_jobs add column if not exists artifact_refs text[];
alter table public.flux_jobs add column if not exists handoff_refs text[];
alter table public.flux_jobs add column if not exists evidence_refs text[];
alter table public.flux_jobs add column if not exists blockers text[];
alter table public.flux_jobs add column if not exists correlation_ref text;
alter table public.flux_jobs add column if not exists domain_source_type text;
alter table public.flux_jobs add column if not exists historical boolean;
alter table public.flux_jobs add column if not exists active_blocker boolean;
alter table public.flux_jobs add column if not exists last_activity text;
alter table public.flux_jobs add column if not exists next_check_label text;
alter table public.flux_jobs add column if not exists owner text;
alter table public.flux_jobs add column if not exists last_event text;
alter table public.flux_jobs add column if not exists depends_on text[];
alter table public.flux_jobs add column if not exists blocks text[];
alter table public.flux_jobs add column if not exists can_start boolean;
alter table public.flux_jobs add column if not exists parallel_group text;
alter table public.flux_jobs add column if not exists track text;
alter table public.flux_jobs add column if not exists dependency_reason text;
alter table public.flux_handoffs add column if not exists external_id text unique;
alter table public.flux_handoffs add column if not exists ordinal bigint;
alter table public.flux_handoffs add column if not exists card_id_external_ref text;
alter table public.flux_handoffs add column if not exists project_id_external_ref text;
alter table public.flux_handoffs add column if not exists decisions text[];
alter table public.flux_handoffs add column if not exists next_check_label text;
alter table public.flux_handoffs add column if not exists last_activity text;
alter table public.flux_handoffs add column if not exists acceptance_criteria text;
alter table public.flux_handoffs add column if not exists last_update text;
alter table public.flux_handoffs add column if not exists last_blocker text;
alter table public.flux_handoffs add column if not exists last_release text;
alter table public.flux_handoffs add column if not exists blocker_id text;
alter table public.flux_handoffs add column if not exists job_id uuid references flux_jobs(id) on delete restrict;
alter table public.flux_handoffs add column if not exists job_id_external_ref text;
alter table public.flux_handoffs add column if not exists correlation_ref text;
alter table public.flux_handoffs add column if not exists forwarding_key text;
alter table public.flux_handoffs add column if not exists source_type text;
alter table public.flux_handoffs add column if not exists legacy boolean;
alter table public.flux_handoffs add column if not exists active_blocker boolean;
alter table public.flux_handoffs add column if not exists resolution_action_present boolean;
alter table public.flux_handoffs add column if not exists resolution_action_from text;
alter table public.flux_handoffs add column if not exists resolution_action_to text;
alter table public.flux_handoffs add column if not exists resolution_action_objective text;
alter table public.flux_handoffs add column if not exists resolution_action_deliverable text;
alter table public.flux_handoffs add column if not exists resolution_action_acceptance_criteria text;
alter table public.flux_handoffs add column if not exists resolution_action_evidence_required text;
alter table public.flux_handoffs add column if not exists resolution_action_next_step text;
alter table public.flux_handoffs add column if not exists resolution_action_fallback text;
alter table public.flux_handoffs add column if not exists interaction_present boolean;
alter table public.flux_handoffs add column if not exists interaction_from text;
alter table public.flux_handoffs add column if not exists interaction_to text;
alter table public.flux_handoffs add column if not exists interaction_objective text;
alter table public.flux_handoffs add column if not exists interaction_deliverable text;
alter table public.flux_handoffs add column if not exists interaction_acceptance_criteria text;
alter table public.flux_handoffs add column if not exists interaction_evidence_required text;
alter table public.flux_handoffs add column if not exists interaction_next_step text;
alter table public.flux_handoffs add column if not exists interaction_fallback text;
alter table public.flux_handoffs add column if not exists interaction_actor text;
alter table public.flux_handoffs add column if not exists interaction_type text;
alter table public.flux_handoffs add column if not exists interaction_status text;
alter table public.flux_handoffs add column if not exists interaction_decision text;
alter table public.flux_handoffs add column if not exists interaction_message text;
alter table public.flux_handoffs add column if not exists solution_present boolean;
alter table public.flux_handoffs add column if not exists solution_cause text;
alter table public.flux_handoffs add column if not exists solution_owner text;
alter table public.flux_handoffs add column if not exists solution_next_action text;
alter table public.flux_handoffs add column if not exists solution_resolution_plan text;
alter table public.flux_handoffs add column if not exists solution_resolution_evidence text;
alter table public.flux_artifacts add column if not exists external_id text unique;
alter table public.flux_artifacts add column if not exists ordinal bigint;
alter table public.flux_artifacts add column if not exists card_id_external_ref text;
alter table public.flux_artifacts add column if not exists name text;
alter table public.flux_artifacts add column if not exists status text;
alter table public.flux_artifacts add column if not exists source_path text;
alter table public.flux_artifacts add column if not exists size bigint;
alter table public.flux_artifacts add column if not exists content_text text;
alter table public.flux_artifacts add column if not exists content_binary bytea;
alter table public.flux_artifacts add column if not exists content_type text;
alter table public.flux_blockers add column if not exists external_id text unique;
alter table public.flux_blockers add column if not exists ordinal bigint;
alter table public.flux_blockers add column if not exists source_id text;
alter table public.flux_blockers add column if not exists card_id_external_ref text;
alter table public.flux_blockers add column if not exists resolution_action_present boolean;
alter table public.flux_blockers add column if not exists resolution_action_from text;
alter table public.flux_blockers add column if not exists resolution_action_to text;
alter table public.flux_blockers add column if not exists resolution_action_objective text;
alter table public.flux_blockers add column if not exists resolution_action_deliverable text;
alter table public.flux_blockers add column if not exists resolution_action_acceptance_criteria text;
alter table public.flux_blockers add column if not exists resolution_action_evidence_required text;
alter table public.flux_blockers add column if not exists resolution_action_next_step text;
alter table public.flux_blockers add column if not exists resolution_action_fallback text;
alter table public.flux_blockers add column if not exists container_handoff_id uuid references flux_handoffs(id) on delete restrict;
alter table public.flux_sprints add column if not exists external_id text unique;
alter table public.flux_sprints add column if not exists ordinal bigint;
alter table public.flux_sprints add column if not exists project_id_external_ref text;
alter table public.flux_sprints add column if not exists tenant_id_external_ref text;
alter table public.flux_sprints add column if not exists dependencies text[];
alter table public.flux_sprints add column if not exists next_check_label text;
alter table public.flux_stories add column if not exists external_id text unique;
alter table public.flux_stories add column if not exists ordinal bigint;
alter table public.flux_stories add column if not exists sprint_id_external_ref text;
alter table public.flux_stories add column if not exists project_id_external_ref text;
alter table public.flux_stories add column if not exists tenant_id_external_ref text;
alter table public.flux_stories add column if not exists criteria_values text[];
alter table public.flux_stories add column if not exists card_ids text[];
alter table public.flux_stories add column if not exists job_ids text[];
alter table public.flux_stories add column if not exists evidence_refs text[];
alter table public.flux_stories add column if not exists blocker_ids text[];
alter table public.flux_stories add column if not exists next_check_label text;
alter table public.flux_required_actions add column if not exists external_id text unique;
alter table public.flux_required_actions add column if not exists ordinal bigint;
alter table public.flux_required_actions add column if not exists due_check_label text;
alter table public.flux_required_actions add column if not exists correlation_ref text;
alter table public.flux_coordinator_runs add column if not exists external_id text unique;
alter table public.flux_coordinator_runs add column if not exists ordinal bigint;
alter table public.flux_coordinator_runs add column if not exists waiting_reasons text[];
alter table public.flux_coordinator_runs add column if not exists last_check_label text;
alter table public.flux_coordinator_runs add column if not exists next_follow_up_label text;
alter table public.flux_coordinator_runs add column if not exists unanswered integer;
alter table public.flux_coordinator_runs add column if not exists backlog_actionable integer;
alter table public.flux_receipts add column if not exists external_id text unique;
alter table public.flux_receipts add column if not exists ordinal bigint;
alter table public.flux_receipts add column if not exists correlation_ref text;
alter table public.flux_receipts add column if not exists job_id_external_ref text;
alter table public.flux_receipts add column if not exists started_at timestamptz;
alter table public.flux_receipts add column if not exists completed_at timestamptz;
alter table public.flux_receipts add column if not exists metadata_present boolean;
alter table public.flux_receipts add column if not exists metadata_card_id text;
alter table public.flux_receipts add column if not exists metadata_from_status text;
alter table public.flux_receipts add column if not exists metadata_status text;
alter table public.flux_receipts add column if not exists metadata_approval_id text;
alter table public.flux_receipts add column if not exists metadata_decision text;
alter table public.flux_receipts add column if not exists metadata_gate_id text;
alter table public.flux_receipts add column if not exists metadata_handoff_id text;
alter table public.flux_receipts add column if not exists metadata_blocker_id text;
alter table public.flux_receipts add column if not exists metadata_artifact_id text;
alter table public.flux_receipts add column if not exists metadata_project_id text;
alter table public.flux_receipts add column if not exists metadata_tenant text;
alter table public.flux_receipts add column if not exists metadata_event_id text;
alter table public.flux_receipts add column if not exists metadata_type text;
alter table public.flux_receipts add column if not exists metadata_sprint_id text;
alter table public.flux_receipts add column if not exists metadata_story_id text;
alter table public.flux_events add column if not exists external_id text unique;
alter table public.flux_events add column if not exists ordinal bigint;
alter table public.flux_events add column if not exists card_id_external_ref text;
alter table public.flux_events add column if not exists correlation_ref text;
alter table public.flux_events add column if not exists reason text;
alter table public.flux_events add column if not exists blocker_id text;
alter table public.flux_events add column if not exists job_id uuid references flux_jobs(id) on delete restrict;
alter table public.flux_events add column if not exists job_id_external_ref text;
alter table public.flux_events add column if not exists handoff_id uuid references flux_handoffs(id) on delete restrict;
alter table public.flux_events add column if not exists handoff_id_external_ref text;
alter table public.flux_events add column if not exists from_actor text;
alter table public.flux_events add column if not exists to_actor text;
alter table public.flux_events add column if not exists owner text;
alter table public.flux_events add column if not exists next_action text;
alter table public.flux_events add column if not exists receipt_id uuid references flux_receipts(id) on delete restrict;
alter table public.flux_events add column if not exists receipt_id_external_ref text;
alter table public.flux_events add column if not exists solution_present boolean;
alter table public.flux_events add column if not exists solution_cause text;
alter table public.flux_events add column if not exists solution_owner text;
alter table public.flux_events add column if not exists solution_next_action text;
alter table public.flux_events add column if not exists solution_resolution_plan text;
alter table public.flux_events add column if not exists solution_resolution_evidence text;
alter table public.flux_events add column if not exists resolution_action_present boolean;
alter table public.flux_events add column if not exists resolution_action_from text;
alter table public.flux_events add column if not exists resolution_action_to text;
alter table public.flux_events add column if not exists resolution_action_objective text;
alter table public.flux_events add column if not exists resolution_action_deliverable text;
alter table public.flux_events add column if not exists resolution_action_acceptance_criteria text;
alter table public.flux_events add column if not exists resolution_action_evidence_required text;
alter table public.flux_events add column if not exists resolution_action_next_step text;
alter table public.flux_events add column if not exists resolution_action_fallback text;

-- Relaxamentos NOT NULL exigidos pelo domínio atual (coordinator global, handoff/job legado
-- parcial): o repositório grava NULL explícito quando o domínio não provê o valor.
alter table public.flux_sprints alter column tenant_id drop not null;
alter table public.flux_sprints alter column next_check drop not null;
alter table public.flux_stories alter column tenant_id drop not null;
alter table public.flux_stories alter column next_check drop not null;
alter table public.flux_jobs alter column tenant_id drop not null;
alter table public.flux_jobs alter column correlation_id drop not null;
alter table public.flux_gates alter column tenant_id drop not null;
alter table public.flux_required_actions alter column tenant_id drop not null;
alter table public.flux_required_actions alter column project_id drop not null;
alter table public.flux_required_actions alter column due_check drop not null;
alter table public.flux_required_actions alter column correlation_id drop not null;
alter table public.flux_coordinator_runs alter column tenant_id drop not null;
alter table public.flux_coordinator_runs alter column correlation_id drop not null;
alter table public.flux_receipts alter column tenant_id drop not null;
alter table public.flux_receipts alter column correlation_id drop not null;
alter table public.flux_receipts alter column actor drop not null;
alter table public.flux_events alter column project_id drop not null;
alter table public.flux_blockers alter column tenant_id drop not null;
alter table public.flux_blockers alter column project_id drop not null;
alter table public.flux_blockers alter column owner drop not null;
alter table public.flux_blockers alter column next_action drop not null;
alter table public.flux_blockers alter column resolution_plan drop not null;
alter table public.flux_blockers alter column status drop not null;
alter table public.flux_blockers alter column resolution drop not null;
alter table public.flux_blockers alter column verification_status drop not null;

-- CHECKs: apenas ALARGAMENTO (superset de valores; não invalida dado existente).
alter table public.flux_cards drop constraint if exists flux_cards_status_check;
alter table public.flux_cards add constraint flux_cards_status_check
  check (status in ('planned','ready','in_progress','review','blocked','awaiting_owner','awaiting_approval','approved','executing','verifying','completed','failed'));
alter table public.flux_receipts drop constraint if exists flux_receipts_status_check;
alter table public.flux_receipts add constraint flux_receipts_status_check
  check (status in ('started','completed','failed','blocked','rejected'));
alter table public.flux_artifacts drop constraint if exists flux_artifact_content_exclusive;
alter table public.flux_artifacts add constraint flux_artifact_content_exclusive
  check (content_text is null or content_binary is null);

-- ============================================================================
-- 2) VERSÃO GLOBAL CAS (fonte de verdade do version para as RPCs; sem snapshot)
-- ============================================================================
create table if not exists public.flux_runtime_revision (
  id boolean primary key default true check (id),
  version bigint not null default 0,
  coordinator_waiting_reasons text[]
);
insert into public.flux_runtime_revision (id) values (true) on conflict do nothing;

-- ============================================================================
-- 3) ÍNDICES DE DASHBOARD (tenant + status + created_at) e filas ativas
-- ============================================================================
create index if not exists flux_cards_tenant_status_created_idx
  on public.flux_cards (tenant_id, status, created_at desc);
create index if not exists flux_jobs_tenant_status_created_idx
  on public.flux_jobs (tenant_id, status, created_at desc);
create index if not exists flux_handoffs_tenant_status_created_idx
  on public.flux_handoffs (tenant_id, status, created_at desc);
create index if not exists flux_blockers_tenant_status_created_idx
  on public.flux_blockers (tenant_id, status, created_at desc);
create index if not exists flux_gates_tenant_status_requested_idx
  on public.flux_gates (tenant_id, status, requested_at desc);
create index if not exists flux_required_actions_tenant_status_due_idx
  on public.flux_required_actions (tenant_id, status, due_check);
create index if not exists flux_jobs_active_partial_idx
  on public.flux_jobs (tenant_id, updated_at desc)
  where status in ('planned','ready','in_progress','review','blocked','awaiting_owner');
create index if not exists flux_blockers_open_partial_idx
  on public.flux_blockers (tenant_id, created_at desc)
  where status = 'open';
create index if not exists flux_events_card_idx on public.flux_events (card_id, created_at desc);
create index if not exists flux_jobs_card_idx on public.flux_jobs (card_id);
create index if not exists flux_handoffs_card_idx on public.flux_handoffs (card_id);

-- ============================================================================
-- 4) TRIGGER updated_at AUTOMÁTICO (toda tabela flux_* com a coluna)
-- ============================================================================
create or replace function public.flux_touch_updated_at() returns trigger
language plpgsql as $$
begin
  -- Preserve updated_at quando o escritor define o valor explicitamente (contrato das RPCs);
  -- auto-touch apenas quando a coluna não é alterada pelo UPDATE (updates ad-hoc/dashboard).
  if new.updated_at is distinct from old.updated_at then
    return new;
  end if;
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  for t in select table_name from information_schema.columns
           where table_schema = 'public' and column_name = 'updated_at'
             and table_name like 'flux\_%' escape '\'
  loop
    execute format('drop trigger if exists flux_touch_updated_at on public.%I', t);
    execute format('create trigger flux_touch_updated_at before update on public.%I
                    for each row execute function public.flux_touch_updated_at()', t);
  end loop;
end $$;

-- ============================================================================
-- 5) RLS — POLICIES REAIS tenant-scoped (fail-closed)
-- ============================================================================
-- GAP do 003: as tabelas-base (flux_projects, flux_cards, flux_approvals, flux_events,
-- flux_artifacts, flux_handoffs, flux_agents, flux_project_agents, flux_card_dependencies)
-- ficaram SEM "enable row level security" — policy sozinha não é aplicada nessas tabelas.
-- Aqui: ENABLE RLS em TODAS as tabelas flux_* (idempotente) + policy por tabela.
-- NÃO usamos FORCE: em Supabase o role postgres (owner) não é superuser; com FORCE as RPCs
-- SECURITY DEFINER do owner seriam bloqueadas pelas próprias policies.
do $$
declare t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename like 'flux\_%' escape '\'
  loop
    execute format('alter table public.%I enable row level security', t);
    -- desfaz FORCE (se algum script anterior aplicou): com FORCE, as RPCs SECURITY DEFINER
    -- do owner seriam filtradas pelas próprias policies de tenant e falhariam fechado.
    execute format('alter table public.%I no force row level security', t);
  end loop;
end $$;

create or replace function public.flux_app_tenant() returns uuid
language sql stable as $$
  select nullif(current_setting('app.tenant_id', true), '')::uuid
$$;

do $$
begin
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_agent_run_events'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_agent_run_events for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_agent_runs'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_agent_runs for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_agents'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_agents for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_approval_events'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_approval_events for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_approvals'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_approvals for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_artifact_versions'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_artifact_versions for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_artifacts'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_artifacts for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_audit_log'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_audit_log for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_blocker_actions'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_blocker_actions for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_blocker_events'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_blocker_events for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_blockers'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_blockers for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_card_risks'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_card_risks for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_cards'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_cards for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_coordinator_runs'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_coordinator_runs for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_events'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_events for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_gates'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_gates for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_handoff_decisions'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_handoff_decisions for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_handoff_risks'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_handoff_risks for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_handoffs'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_handoffs for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_heartbeats'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_heartbeats for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_jobs'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_jobs for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_project_agents'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_project_agents for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_projects'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_projects for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_receipts'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_receipts for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_required_action_events'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_required_action_events for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_required_actions'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_required_actions for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_source_citations'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_source_citations for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_sources'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_sources for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_sprints'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_sprints for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_stories'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_stories for all using (tenant_id = public.flux_app_tenant()) with check (tenant_id = public.flux_app_tenant())';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_card_acceptance_criteria'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_card_acceptance_criteria for all using (exists (select 1 from public.flux_cards p where p.id = public.flux_card_acceptance_criteria.card_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_cards p where p.id = public.flux_card_acceptance_criteria.card_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_artifact_evidence'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_artifact_evidence for all using (exists (select 1 from public.flux_artifacts p where p.id = public.flux_artifact_evidence.artifact_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_artifacts p where p.id = public.flux_artifact_evidence.artifact_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_artifact_contents'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_artifact_contents for all using (exists (select 1 from public.flux_artifact_versions v join public.flux_artifacts p on p.id = v.artifact_id where v.id = public.flux_artifact_contents.artifact_version_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_artifact_versions v join public.flux_artifacts p on p.id = v.artifact_id where v.id = public.flux_artifact_contents.artifact_version_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_card_dependencies'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_card_dependencies for all using (exists (select 1 from public.flux_cards p where p.id = public.flux_card_dependencies.card_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_cards p where p.id = public.flux_card_dependencies.card_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_coordinator_waiting_reasons'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_coordinator_waiting_reasons for all using (exists (select 1 from public.flux_coordinator_runs p where p.id = public.flux_coordinator_waiting_reasons.coordinator_run_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_coordinator_runs p where p.id = public.flux_coordinator_waiting_reasons.coordinator_run_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_event_attributes'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_event_attributes for all using (exists (select 1 from public.flux_events p where p.id = public.flux_event_attributes.event_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_events p where p.id = public.flux_event_attributes.event_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_gate_evidence'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_gate_evidence for all using (exists (select 1 from public.flux_gates p where p.id = public.flux_gate_evidence.gate_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_gates p where p.id = public.flux_gate_evidence.gate_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_handoff_acceptance_criteria'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_handoff_acceptance_criteria for all using (exists (select 1 from public.flux_handoffs p where p.id = public.flux_handoff_acceptance_criteria.handoff_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_handoffs p where p.id = public.flux_handoff_acceptance_criteria.handoff_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_job_dependencies'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_job_dependencies for all using (exists (select 1 from public.flux_jobs p where p.id = public.flux_job_dependencies.job_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_jobs p where p.id = public.flux_job_dependencies.job_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_job_evidence'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_job_evidence for all using (exists (select 1 from public.flux_jobs p where p.id = public.flux_job_evidence.job_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_jobs p where p.id = public.flux_job_evidence.job_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_receipt_attributes'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_receipt_attributes for all using (exists (select 1 from public.flux_receipts p where p.id = public.flux_receipt_attributes.receipt_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_receipts p where p.id = public.flux_receipt_attributes.receipt_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_story_acceptance_criteria'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_story_acceptance_criteria for all using (exists (select 1 from public.flux_stories p where p.id = public.flux_story_acceptance_criteria.story_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_stories p where p.id = public.flux_story_acceptance_criteria.story_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_story_card_links'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_story_card_links for all using (exists (select 1 from public.flux_stories p where p.id = public.flux_story_card_links.story_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_stories p where p.id = public.flux_story_card_links.story_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_story_job_links'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_story_job_links for all using (exists (select 1 from public.flux_stories p where p.id = public.flux_story_job_links.story_id and p.tenant_id = public.flux_app_tenant())) with check (exists (select 1 from public.flux_stories p where p.id = public.flux_story_job_links.story_id and p.tenant_id = public.flux_app_tenant()))';
  end if;
  if not exists (select 1 from pg_policy where polname = 'flux_tenant_isolation' and polrelid = 'public.flux_tenants'::regclass) then
    execute 'create policy flux_tenant_isolation on public.flux_tenants for all using (id = public.flux_app_tenant()) with check (id = public.flux_app_tenant())';
  end if;
end $$;

-- ============================================================================
-- 6) RPCs — flux_relational_read / flux_relational_commit
--    Contrato exigido por SqlRelationalTransport (relational-repository.ts):
--    commit($1 version, $2::jsonb changes, $3::text[] waitingReasons) -> read de volta.
--    Whitelist explícita por tabela: coluna fora do contrato => erro (fail closed).
--    Apenas operation='upsert'; delete não é suportado (histórico é imutável fora de Gate).
-- ============================================================================
create or replace function public.flux_relational_read() returns jsonb
language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  result jsonb;
  t text;
  items jsonb;
begin
  select jsonb_build_object('version', version, 'waitingReasons', coordinator_waiting_reasons)
    into result
    from public.flux_runtime_revision
   where id = true;

  foreach t in array array['flux_projects', 'flux_cards', 'flux_approvals', 'flux_gates', 'flux_jobs', 'flux_handoffs', 'flux_artifacts', 'flux_blockers', 'flux_sprints', 'flux_stories', 'flux_required_actions', 'flux_coordinator_runs', 'flux_receipts', 'flux_events', 'flux_tenants'] loop
    execute format('select coalesce(jsonb_agg(to_jsonb(r)), ''[]''::jsonb) from public.%I r', t)
      into items;
    result := result || jsonb_build_object(t, items);
  end loop;
  return result;
end $$;

create or replace function public.flux_relational_commit(
  expected_version bigint,
  changes jsonb,
  waiting_reasons text[] default null
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  current_version bigint;
  item jsonb;
  t text;
  c text;
  allowed text[];
  cols text;
  vals text;
  updates text;
begin
  -- CAS: trava a linha da revisão global; versão divergente => 40001 (repositório mapeia p/ 409)
  select version into current_version
    from public.flux_runtime_revision
   where id = true
   for update;
  if expected_version is distinct from current_version then
    raise exception 'PERSISTENCE_CONFLICT' using errcode = '40001';
  end if;
  if jsonb_typeof(changes) <> 'array' then
    raise exception 'INVALID_RELATIONAL_CHANGES';
  end if;

  for item in select value from jsonb_array_elements(changes) loop
    t := item->>'table';
    allowed := case t
      when 'flux_projects' then array['description','external_id','id','name','ordinal','owner_name','slug','status','tenant_id','tenant_id_external_ref']::text[]
      when 'flux_cards' then array['acceptance_criteria','assignee','criteria_values','external_id','id','objective','ordinal','priority','project_id','project_id_external_ref','status','tenant_id','tenant_id_external_ref','title','updated_at']::text[]
      when 'flux_approvals' then array['action_scope','card_id','card_id_external_ref','decided_at','decided_by','decision','external_id','id','impact','ordinal','requested_by','rollback_plan','tenant_id','tenant_id_external_ref','title']::text[]
      when 'flux_gates' then array['blocker_refs','card_id','card_id_external_ref','cost','decided_at','decided_by','evidence_refs','external_action_authorized','external_id','id','impact','ordinal','owner','project_id','project_id_external_ref','requested_at','required_decision','reversibility','rollback_plan','scope','status','tenant_id','title']::text[]
      when 'flux_jobs' then array['active_blocker','agent_name','artifact_refs','blockers','blocks','can_start','card_id','card_id_external_ref','completed_at','correlation_ref','current_step','dependency_reason','depends_on','domain_source_type','evidence_refs','external_id','handoff_refs','historical','id','last_activity','last_event','last_seen_at','next_check_label','next_step','objective','ordinal','owner','parallel_group','progress','project_id','project_id_external_ref','role','source_ref','started_at','status','tenant_id','tenant_id_external_ref','track','updated_at','verification_status']::text[]
      when 'flux_handoffs' then array['acceptance_criteria','active_blocker','blocker_id','card_id','card_id_external_ref','correlation_ref','created_at','decisions','done','evidence_ref','external_id','forwarding_key','from_actor','historical','id','interaction_acceptance_criteria','interaction_actor','interaction_decision','interaction_deliverable','interaction_evidence_required','interaction_fallback','interaction_from','interaction_message','interaction_next_step','interaction_objective','interaction_present','interaction_status','interaction_to','interaction_type','job_id','job_id_external_ref','last_activity','last_blocker','last_release','last_update','legacy','next_check_label','next_step','ordinal','project_id','project_id_external_ref','resolution_action_acceptance_criteria','resolution_action_deliverable','resolution_action_evidence_required','resolution_action_fallback','resolution_action_from','resolution_action_next_step','resolution_action_objective','resolution_action_present','resolution_action_to','risks','solution_cause','solution_next_action','solution_owner','solution_present','solution_resolution_evidence','solution_resolution_plan','source_ref','source_type','status','summary','tenant_id','to_actor']::text[]
      when 'flux_artifacts' then array['artifact_type','card_id','card_id_external_ref','content_binary','content_text','content_type','external_id','id','name','ordinal','path_or_ref','project_id','size','source_path','status','tenant_id']::text[]
      when 'flux_blockers' then array['author','card_id','card_id_external_ref','cause','container_handoff_id','external_id','id','next_action','ordinal','owner','project_id','resolution','resolution_action_acceptance_criteria','resolution_action_deliverable','resolution_action_evidence_required','resolution_action_fallback','resolution_action_from','resolution_action_next_step','resolution_action_objective','resolution_action_present','resolution_action_to','resolution_evidence','resolution_plan','source_id','status','tenant_id','verification_status']::text[]
      when 'flux_sprints' then array['created_at','dependencies','ends_at','external_id','id','name','next_check_label','objective','ordinal','owner','project_id','project_id_external_ref','starts_at','status','tenant_id','tenant_id_external_ref','updated_at']::text[]
      when 'flux_stories' then array['blocker_ids','card_ids','created_at','criteria_values','evidence_refs','external_id','id','job_ids','next_check_label','objective','ordinal','owner','project_id','project_id_external_ref','sprint_id','sprint_id_external_ref','status','tenant_id','tenant_id_external_ref','title','updated_at']::text[]
      when 'flux_required_actions' then array['acceptance_criteria','correlation_ref','created_at','dedupe_key','deliverable','due_check_label','external_id','fallback','from_actor','id','objective','ordinal','project_id','reason_code','status','tenant_id','to_actor','updated_at','what','who','why']::text[]
      when 'flux_coordinator_runs' then array['backlog_actionable','completed_at','dispatched','external_id','heartbeat_at','holds','id','idle_detected','last_activity_at','last_check_label','next_follow_up_label','ordinal','required_actions','result','started_at','tenant_id','unanswered','waiting_reasons']::text[]
      when 'flux_receipts' then array['actor','completed_at','correlation_ref','duration_ms','external_id','id','job_id','job_id_external_ref','metadata_approval_id','metadata_artifact_id','metadata_blocker_id','metadata_card_id','metadata_decision','metadata_event_id','metadata_from_status','metadata_gate_id','metadata_handoff_id','metadata_present','metadata_project_id','metadata_sprint_id','metadata_status','metadata_story_id','metadata_tenant','metadata_type','operation','ordinal','started_at','status','tenant_id']::text[]
      when 'flux_events' then array['actor','blocker_id','card_id','card_id_external_ref','correlation_ref','created_at','event_type','external_id','from_actor','from_status','handoff_id','handoff_id_external_ref','id','job_id','job_id_external_ref','next_action','ordinal','owner','project_id','reason','receipt_id','receipt_id_external_ref','resolution_action_acceptance_criteria','resolution_action_deliverable','resolution_action_evidence_required','resolution_action_fallback','resolution_action_from','resolution_action_next_step','resolution_action_objective','resolution_action_present','resolution_action_to','solution_cause','solution_next_action','solution_owner','solution_present','solution_resolution_evidence','solution_resolution_plan','tenant_id','to_actor','to_status']::text[]
      else null
    end;
    if allowed is null or jsonb_typeof(item->'row') <> 'object' or item->'row'->>'id' is null then
      raise exception 'INVALID_RELATIONAL_TABLE_OR_ROW';
    end if;

    cols := ''; vals := ''; updates := '';
    for c in select jsonb_object_keys(item->'row') loop
      if not c = any(allowed) then
        raise exception 'INVALID_RELATIONAL_COLUMN';
      end if;
      cols := cols || format('%I,', c);
      vals := vals || format('r.%I,', c);
      if c <> 'id' then
        updates := updates || format('%I=excluded.%I,', c, c);
      end if;
    end loop;

    if item->>'operation' is distinct from 'upsert' then
      raise exception 'DELETION_NOT_SUPPORTED';
    end if;

    if length(rtrim(updates, ',')) = 0 then
      -- row só com id: insert-or-nothing (não sobrescreve a linha existente com nulos)
      execute format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1) r
                      on conflict (id) do nothing',
                     t, rtrim(cols, ','), rtrim(vals, ','), t)
        using item->'row';
    else
      execute format('insert into public.%I (%s) select %s from jsonb_populate_record(null::public.%I, $1) r
                      on conflict (id) do update set %s',
                     t, rtrim(cols, ','), rtrim(vals, ','), t, rtrim(updates, ','))
        using item->'row';
    end if;
  end loop;

  update public.flux_runtime_revision
     set version = version + 1,
         coordinator_waiting_reasons = waiting_reasons
   where id = true;

  return public.flux_relational_read();
end $$;

revoke all on function public.flux_relational_read() from public;
revoke all on function public.flux_relational_commit(bigint, jsonb, text[]) from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function public.flux_relational_read() to service_role;
    grant execute on function public.flux_relational_commit(bigint, jsonb, text[]) to service_role;
  end if;
end $$;

commit;
