-- FBR Agency Flux — 005_flux_seed_initial.sql
-- Inserção de tenants padrão e inicialização do runtime

set search_path = custom_agencyflux, public;

begin;

-- Inserir tenants padrão
insert into custom_agencyflux.flux_tenants (id, slug, name, external_id) values
  ('00000000-0000-0000-0000-000000000001', 'fbr', 'FBR Agency', 'fbr'),
  ('00000000-0000-0000-0000-000000000002', 'after-forty', 'After Forty', 'after-forty'),
  ('00000000-0000-0000-0000-000000000003', 'agency', 'Agency Flux', 'agency'),
  ('00000000-0000-0000-0000-000000000004', 'local', 'Local Tenant', 'local'),
  ('00000000-0000-0000-0000-000000000005', 'default', 'Default Tenant', 'default')
on conflict (slug) do update set external_id = excluded.external_id;

-- Inserir projeto inicial FBR Agency Flux
insert into custom_agencyflux.flux_projects (id, name, slug, project_type, status, owner_name, description, external_id, tenant_id) values
  ('00000000-0000-0000-0000-000000000010', 'FBR Agency Flux', 'agency-flux', 'custom', 'active', 'Sergio', 'Camada transversal de coordenação e observabilidade operacional', 'agency-flux', '00000000-0000-0000-0000-000000000001')
on conflict (slug) do nothing;

-- Inserir projeto piloto After Forty
insert into custom_agencyflux.flux_projects (id, name, slug, project_type, status, owner_name, description, external_id, tenant_id) values
  ('00000000-0000-0000-0000-000000000020', 'After Forty', 'after-forty', 'blog', 'active', 'Sergio', 'Piloto operacional de publisher FBR News para público 40+', 'after-forty', '00000000-0000-0000-0000-000000000002')
on conflict (slug) do nothing;

-- Inserir projeto Talk to Your Crowd (Storefront & POS Hacks)
insert into custom_agencyflux.flux_projects (id, name, slug, project_type, status, owner_name, description, external_id, tenant_id) values
  ('00000000-0000-0000-0000-000000000030', 'Talk to Your Crowd', 'talk-to-your-crowd', 'blog', 'active', 'Marcus Cole', 'Publisher FBR News de marketing e conversão para varejo local nos EUA', 'talk-to-your-crowd', '00000000-0000-0000-0000-000000000001')
on conflict (slug) do nothing;

-- Garantir que a linha de controle de versão global exista
insert into custom_agencyflux.flux_runtime_revision (id, version, coordinator_waiting_reasons)
values (true, 1, array[]::text[])
on conflict (id) do nothing;

commit;

