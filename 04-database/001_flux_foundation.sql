-- FBR Agency Flux — foundation schema
-- Aplicar somente no schema dedicado do projeto via Control Tower
-- Zero Secret Leaks: nenhum valor de credencial neste arquivo

create extension if not exists pgcrypto;

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
  payload jsonb not null default '{}'::jsonb,
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

create index if not exists flux_cards_project_status_idx on flux_cards(project_id, status);
create index if not exists flux_approvals_decision_idx on flux_approvals(decision);
create index if not exists flux_events_project_created_idx on flux_events(project_id, created_at desc);
create index if not exists flux_artifacts_project_idx on flux_artifacts(project_id);

alter table flux_projects enable row level security;
alter table flux_agents enable row level security;
alter table flux_cards enable row level security;
alter table flux_card_dependencies enable row level security;
alter table flux_approvals enable row level security;
alter table flux_events enable row level security;
alter table flux_artifacts enable row level security;
alter table flux_handoffs enable row level security;

-- As policies de acesso devem ser adicionadas pelo contrato de autenticação do projeto.
-- Fail-closed: RLS habilitado sem policy pública permissiva.
