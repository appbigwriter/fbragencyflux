-- FBR Agency Flux — 003 relational persistence
-- DB-FIRST target schema. No json/jsonb, no snapshot aggregate, no filesystem source of truth.
-- Do not apply remotely without Sergio Gate, backup/readback plan and approved backfill.

create extension if not exists pgcrypto;

-- Base tables are repeated defensively so this migration can run alone.
create table if not exists flux_projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  project_type text not null default 'custom',
  status text not null default 'planned' check (status in ('planned','active','blocked','completed','archived')),
  owner_name text not null default 'Sergio',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flux_agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  role text not null,
  profile_ref text,
  status text not null default 'active' check (status in ('active','paused','retired')),
  created_at timestamptz not null default now()
);

create table if not exists flux_cards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references flux_projects(id) on delete restrict,
  title text not null,
  objective text not null,
  status text not null default 'planned' check (status in ('planned','ready','in_progress','review','blocked','awaiting_approval','approved','executing','verifying','completed','failed')),
  responsible_agent_id uuid references flux_agents(id) on delete restrict,
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  acceptance_criteria text not null,
  risk text,
  blocker text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flux_card_dependencies (
  card_id uuid not null references flux_cards(id) on delete cascade,
  depends_on_card_id uuid not null references flux_cards(id) on delete restrict,
  primary key (card_id, depends_on_card_id),
  check (card_id <> depends_on_card_id)
);

create table if not exists flux_approvals (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references flux_cards(id) on delete restrict,
  requested_by_agent_id uuid references flux_agents(id) on delete restrict,
  decision text not null default 'pending' check (decision in ('pending','approved','rejected','changes_requested')),
  action_scope text not null,
  impact text not null,
  rollback_plan text,
  decided_by text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists flux_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references flux_projects(id) on delete restrict,
  card_id uuid references flux_cards(id) on delete restrict,
  event_type text not null,
  actor text not null,
  from_status text,
  to_status text,
  correlation_id uuid not null default gen_random_uuid(),
  payload text,
  created_at timestamptz not null default now()
);

create table if not exists flux_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references flux_projects(id) on delete restrict,
  card_id uuid references flux_cards(id) on delete restrict,
  artifact_type text not null,
  path_or_ref text not null,
  checksum text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists flux_handoffs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references flux_projects(id) on delete restrict,
  card_id uuid references flux_cards(id) on delete restrict,
  from_actor text not null,
  to_actor text not null,
  summary text not null,
  done text not null,
  risks text,
  next_step text not null,
  evidence_ref text,
  created_at timestamptz not null default now()
);

-- If migration 001 already exists, remove its legacy jsonb payload type.
alter table flux_events alter column payload drop default;
alter table flux_events alter column payload type text using payload::text;
alter table flux_events alter column payload set default '';

create table if not exists flux_tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active','blocked','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table flux_projects add column if not exists tenant_id uuid references flux_tenants(id) on delete restrict;
alter table flux_agents add column if not exists tenant_id uuid references flux_tenants(id) on delete restrict;
alter table flux_cards add column if not exists tenant_id uuid references flux_tenants(id) on delete restrict;
alter table flux_approvals add column if not exists tenant_id uuid references flux_tenants(id) on delete restrict;
alter table flux_events add column if not exists tenant_id uuid references flux_tenants(id) on delete restrict;
alter table flux_artifacts add column if not exists tenant_id uuid references flux_tenants(id) on delete restrict;
alter table flux_handoffs add column if not exists tenant_id uuid references flux_tenants(id) on delete restrict;

create table if not exists flux_project_agents (
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  project_id uuid not null references flux_projects(id) on delete cascade,
  agent_id uuid not null references flux_agents(id) on delete restrict,
  responsibility text not null,
  status text not null default 'active' check (status in ('active','paused','retired')),
  assigned_at timestamptz not null default now(),
  unassigned_at timestamptz,
  primary key (project_id, agent_id)
);

create table if not exists flux_sprints (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  project_id uuid not null references flux_projects(id) on delete restrict,
  name text not null,
  objective text not null,
  status text not null default 'planned' check (status in ('planned','active','blocked','completed','cancelled')),
  owner text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  next_check timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flux_stories (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  sprint_id uuid not null references flux_sprints(id) on delete restrict,
  project_id uuid not null references flux_projects(id) on delete restrict,
  title text not null,
  objective text not null,
  owner text not null,
  status text not null default 'planned' check (status in ('planned','ready','in_progress','blocked','review','completed')),
  next_check timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flux_story_acceptance_criteria (
  story_id uuid not null references flux_stories(id) on delete cascade,
  position integer not null check (position >= 0),
  criterion text not null,
  status text not null default 'open' check (status in ('open','met','failed','waived')),
  evidence_id uuid,
  primary key (story_id, position)
);

create table if not exists flux_story_card_links (
  story_id uuid not null references flux_stories(id) on delete cascade,
  card_id uuid not null references flux_cards(id) on delete restrict,
  primary key (story_id, card_id)
);

create table if not exists flux_story_job_links (
  story_id uuid not null references flux_stories(id) on delete cascade,
  job_id uuid,
  primary key (story_id, job_id)
);

create table if not exists flux_card_acceptance_criteria (
  card_id uuid not null references flux_cards(id) on delete cascade,
  position integer not null check (position >= 0),
  criterion text not null,
  status text not null default 'open' check (status in ('open','met','failed','waived')),
  evidence_id uuid,
  primary key (card_id, position)
);

create table if not exists flux_card_risks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  card_id uuid not null references flux_cards(id) on delete cascade,
  severity text not null check (severity in ('critical','high','medium','low')),
  description text not null,
  mitigation text,
  status text not null default 'open' check (status in ('open','mitigated','accepted','closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists flux_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  project_id uuid not null references flux_projects(id) on delete restrict,
  card_id uuid not null references flux_cards(id) on delete restrict,
  agent_id uuid references flux_agents(id) on delete restrict,
  agent_name text not null,
  role text not null,
  objective text not null,
  status text not null default 'planned' check (status in ('planned','ready','in_progress','review','blocked','awaiting_owner','completed','failed','not_verified')),
  source_type text not null default 'live' check (source_type in ('live','local','imported')),
  source_ref text,
  progress integer check (progress between 0 and 100),
  current_step text,
  next_step text not null,
  next_check timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  last_seen_at timestamptz,
  correlation_id uuid not null,
  verification_status text not null default 'not_verified' check (verification_status in ('verified','not_verified')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists flux_job_dependencies (
  job_id uuid not null references flux_jobs(id) on delete cascade,
  depends_on_job_id uuid not null references flux_jobs(id) on delete restrict,
  dependency_reason text not null,
  primary key (job_id, depends_on_job_id),
  check (job_id <> depends_on_job_id)
);

create table if not exists flux_job_evidence (
  job_id uuid not null references flux_jobs(id) on delete cascade,
  evidence_id uuid not null,
  primary key (job_id, evidence_id)
);

create table if not exists flux_agent_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  job_id uuid not null references flux_jobs(id) on delete cascade,
  attempt integer not null default 1 check (attempt > 0),
  started_at timestamptz,
  completed_at timestamptz,
  result text check (result in ('completed','failed','cancelled','pending')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  unique (job_id, attempt)
);

create table if not exists flux_agent_run_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  run_id uuid not null references flux_agent_runs(id) on delete cascade,
  job_id uuid not null references flux_jobs(id) on delete restrict,
  event_type text not null check (event_type in ('dispatched','accepted','started','progress','waiting_input','blocked','artifact_created','handoff_sent','review','completed','failed','cancelled')),
  actor text not null,
  occurred_at timestamptz not null default now(),
  step text,
  progress integer check (progress between 0 and 100),
  message text,
  correlation_id uuid not null
);

create table if not exists flux_heartbeats (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  job_id uuid not null references flux_jobs(id) on delete cascade,
  agent_run_id uuid references flux_agent_runs(id) on delete cascade,
  heartbeat_at timestamptz not null,
  status text not null,
  current_step text,
  correlation_id uuid not null
);

create table if not exists flux_gates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  project_id uuid not null references flux_projects(id) on delete restrict,
  card_id uuid references flux_cards(id) on delete restrict,
  title text not null,
  required_decision text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','changes_requested')),
  impact text not null,
  cost text not null,
  scope text not null,
  reversibility text not null,
  rollback_plan text not null,
  owner text not null,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text,
  external_action_authorized boolean not null default false
);

create table if not exists flux_gate_evidence (
  gate_id uuid not null references flux_gates(id) on delete cascade,
  evidence_id uuid not null,
  primary key (gate_id, evidence_id)
);

create table if not exists flux_approval_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  approval_id uuid not null references flux_approvals(id) on delete cascade,
  decision text not null check (decision in ('pending','approved','rejected','changes_requested')),
  actor text not null,
  reason text,
  occurred_at timestamptz not null default now()
);

create table if not exists flux_required_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  project_id uuid not null references flux_projects(id) on delete restrict,
  card_id uuid references flux_cards(id) on delete restrict,
  dedupe_key text not null,
  what text not null,
  why text not null,
  who text not null,
  from_actor text not null,
  to_actor text not null,
  objective text not null,
  deliverable text not null,
  acceptance_criteria text not null,
  due_check timestamptz not null,
  fallback text not null,
  status text not null default 'ready' check (status in ('ready','hold','completed')),
  reason_code text,
  correlation_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, dedupe_key)
);

create table if not exists flux_required_action_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  required_action_id uuid not null references flux_required_actions(id) on delete cascade,
  status text not null check (status in ('ready','hold','completed')),
  actor text not null,
  note text,
  occurred_at timestamptz not null default now()
);

alter table flux_handoffs add column if not exists status text not null default 'received' check (status in ('received','in_progress','awaiting_owner','blocked','released','completed','legacy'));
alter table flux_handoffs add column if not exists correlation_id uuid;
alter table flux_handoffs add column if not exists historical boolean not null default false;
alter table flux_handoffs add column if not exists source_ref text;

create table if not exists flux_handoff_decisions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  handoff_id uuid not null references flux_handoffs(id) on delete cascade,
  decision text not null check (decision in ('accepted','returned','released','blocked','escalated')),
  actor text not null,
  note text,
  occurred_at timestamptz not null default now()
);

create table if not exists flux_handoff_risks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  handoff_id uuid not null references flux_handoffs(id) on delete cascade,
  description text not null,
  severity text not null check (severity in ('critical','high','medium','low')),
  status text not null default 'open' check (status in ('open','mitigated','closed'))
);

create table if not exists flux_handoff_acceptance_criteria (
  handoff_id uuid not null references flux_handoffs(id) on delete cascade,
  position integer not null check (position >= 0),
  criterion text not null,
  status text not null default 'open' check (status in ('open','met','failed','waived')),
  evidence_id uuid,
  primary key (handoff_id, position)
);

create table if not exists flux_blockers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  project_id uuid not null references flux_projects(id) on delete restrict,
  card_id uuid references flux_cards(id) on delete restrict,
  handoff_id uuid references flux_handoffs(id) on delete restrict,
  job_id uuid references flux_jobs(id) on delete restrict,
  cause text not null,
  status text not null default 'open' check (status in ('open','resolved','legacy')),
  owner text not null,
  author text,
  next_action text not null,
  resolution_plan text not null,
  resolution_evidence text,
  resolution text not null default 'not_declared' check (resolution in ('declared','forwarded','not_declared','legacy')),
  verification_status text not null default 'unverified' check (verification_status in ('verified','unverified')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists flux_blocker_actions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  blocker_id uuid not null references flux_blockers(id) on delete cascade,
  from_actor text not null,
  to_actor text not null,
  objective text not null,
  deliverable text not null,
  acceptance_criteria text not null,
  evidence_required text not null,
  next_step text not null,
  fallback text,
  status text not null default 'hold' check (status in ('ready','hold','completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists flux_blocker_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  blocker_id uuid not null references flux_blockers(id) on delete cascade,
  event_type text not null,
  actor text not null,
  note text,
  occurred_at timestamptz not null default now()
);

create table if not exists flux_artifact_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  artifact_id uuid not null references flux_artifacts(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  checksum text not null,
  content_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  storage_ref text,
  created_at timestamptz not null default now(),
  unique (artifact_id, version_number)
);

create table if not exists flux_artifact_contents (
  artifact_version_id uuid primary key references flux_artifact_versions(id) on delete cascade,
  content_text text,
  content_binary bytea,
  created_at timestamptz not null default now(),
  check ((content_text is not null) <> (content_binary is not null))
);

create table if not exists flux_artifact_evidence (
  artifact_id uuid not null references flux_artifacts(id) on delete cascade,
  evidence_id uuid not null,
  description text not null,
  primary key (artifact_id, evidence_id)
);

create table if not exists flux_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  source_type text not null check (source_type in ('url','document','dataset','meeting')),
  title text not null,
  locator text,
  content_text text,
  checksum text,
  collected_at timestamptz not null default now(),
  verified boolean not null default false
);

create table if not exists flux_source_citations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  source_id uuid not null references flux_sources(id) on delete cascade,
  project_id uuid references flux_projects(id) on delete restrict,
  card_id uuid references flux_cards(id) on delete restrict,
  job_id uuid references flux_jobs(id) on delete restrict,
  handoff_id uuid references flux_handoffs(id) on delete restrict,
  quote_text text,
  locator_detail text,
  cited_at timestamptz not null default now()
);

create table if not exists flux_event_attributes (
  event_id uuid not null references flux_events(id) on delete cascade,
  attribute_name text not null,
  value_type text not null check (value_type in ('text','integer','numeric','boolean','timestamp','uuid')),
  text_value text,
  integer_value bigint,
  numeric_value numeric,
  boolean_value boolean,
  timestamp_value timestamptz,
  uuid_value uuid,
  primary key (event_id, attribute_name),
  check (num_nonnulls(text_value, integer_value, numeric_value, boolean_value, timestamp_value, uuid_value) = 1)
);

create table if not exists flux_receipts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  correlation_id uuid not null,
  operation text not null,
  status text not null check (status in ('started','completed','failed','rejected')),
  actor text not null,
  job_id uuid references flux_jobs(id) on delete restrict,
  occurred_at timestamptz not null default now(),
  duration_ms integer check (duration_ms >= 0),
  error_code text,
  error_message text
);

create table if not exists flux_receipt_attributes (
  receipt_id uuid not null references flux_receipts(id) on delete cascade,
  attribute_name text not null,
  value_type text not null check (value_type in ('text','integer','numeric','boolean','timestamp','uuid')),
  text_value text,
  integer_value bigint,
  numeric_value numeric,
  boolean_value boolean,
  timestamp_value timestamptz,
  uuid_value uuid,
  primary key (receipt_id, attribute_name),
  check (num_nonnulls(text_value, integer_value, numeric_value, boolean_value, timestamp_value, uuid_value) = 1)
);

create table if not exists flux_coordinator_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  project_id uuid references flux_projects(id) on delete restrict,
  correlation_id uuid not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  heartbeat_at timestamptz,
  last_activity_at timestamptz,
  idle_detected integer not null default 0,
  dispatched integer not null default 0,
  holds integer not null default 0,
  required_actions integer not null default 0,
  result text not null default 'pending' check (result in ('completed','dry_run','failed','pending')),
  last_check timestamptz,
  next_follow_up timestamptz
);

create table if not exists flux_coordinator_waiting_reasons (
  coordinator_run_id uuid not null references flux_coordinator_runs(id) on delete cascade,
  position integer not null check (position >= 0),
  reason text not null,
  primary key (coordinator_run_id, position)
);

create table if not exists flux_audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references flux_tenants(id) on delete restrict,
  actor text not null,
  operation text not null,
  table_name text not null,
  record_id uuid,
  correlation_id uuid not null,
  occurred_at timestamptz not null default now(),
  before_checksum text,
  after_checksum text,
  outcome text not null check (outcome in ('accepted','rejected','failed')),
  reason text
);

create index if not exists flux_projects_tenant_idx on flux_projects(tenant_id);
create index if not exists flux_cards_tenant_status_idx on flux_cards(tenant_id, status);
create index if not exists flux_jobs_tenant_status_idx on flux_jobs(tenant_id, status);
create index if not exists flux_events_tenant_created_idx on flux_events(tenant_id, created_at desc);
create index if not exists flux_handoffs_tenant_status_idx on flux_handoffs(tenant_id, status);
create index if not exists flux_blockers_tenant_status_idx on flux_blockers(tenant_id, status);
create index if not exists flux_receipts_correlation_idx on flux_receipts(correlation_id);
create index if not exists flux_audit_log_tenant_created_idx on flux_audit_log(tenant_id, occurred_at desc);

alter table flux_tenants enable row level security;
alter table flux_project_agents enable row level security;
alter table flux_sprints enable row level security;
alter table flux_stories enable row level security;
alter table flux_story_acceptance_criteria enable row level security;
alter table flux_story_card_links enable row level security;
alter table flux_story_job_links enable row level security;
alter table flux_card_acceptance_criteria enable row level security;
alter table flux_card_risks enable row level security;
alter table flux_jobs enable row level security;
alter table flux_job_dependencies enable row level security;
alter table flux_job_evidence enable row level security;
alter table flux_agent_runs enable row level security;
alter table flux_agent_run_events enable row level security;
alter table flux_heartbeats enable row level security;
alter table flux_gates enable row level security;
alter table flux_gate_evidence enable row level security;
alter table flux_approval_events enable row level security;
alter table flux_required_actions enable row level security;
alter table flux_required_action_events enable row level security;
alter table flux_handoff_decisions enable row level security;
alter table flux_handoff_risks enable row level security;
alter table flux_handoff_acceptance_criteria enable row level security;
alter table flux_blockers enable row level security;
alter table flux_blocker_actions enable row level security;
alter table flux_blocker_events enable row level security;
alter table flux_artifact_versions enable row level security;
alter table flux_artifact_contents enable row level security;
alter table flux_artifact_evidence enable row level security;
alter table flux_sources enable row level security;
alter table flux_source_citations enable row level security;
alter table flux_event_attributes enable row level security;
alter table flux_receipts enable row level security;
alter table flux_receipt_attributes enable row level security;
alter table flux_coordinator_runs enable row level security;
alter table flux_coordinator_waiting_reasons enable row level security;
alter table flux_audit_log enable row level security;

-- Policies require the trusted runtime to set app.tenant_id on every transaction.
-- No public policy is created here. Missing tenant context must fail closed.
