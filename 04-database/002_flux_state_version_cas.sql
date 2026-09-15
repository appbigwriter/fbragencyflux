-- FBR Agency Flux — version column for optimistic CAS
-- Preparar/aplicar somente no Supabase autorizado após Sergio Gate.
-- Não contém credenciais.

alter table if exists public.flux_state
  add column if not exists version integer not null default 1;

-- Backfill defensivo para estados antigos: o snapshot já deve possuir version.
update public.flux_state
set version = coalesce(nullif((state->>'version')::integer, 0), 1)
where version is null or version < 1;

alter table public.flux_state
  drop constraint if exists flux_state_version_positive;

alter table public.flux_state
  add constraint flux_state_version_positive check (version > 0);

comment on column public.flux_state.version is 'Optimistic concurrency version; must match state.version';
