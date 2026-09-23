-- FBR Agency Flux — 005_flux_seed_initial.sql
-- Inserção de tenants, projetos, roster completo de agentes e cards iniciais

set search_path = custom_agencyflux, public;

begin;

-- 1. Inserir tenants padrão
insert into custom_agencyflux.flux_tenants (id, slug, name, external_id) values
  ('00000000-0000-0000-0000-000000000001', 'fbr', 'FBR Agency', 'fbr'),
  ('00000000-0000-0000-0000-000000000002', 'after-forty', 'After Forty', 'after-forty'),
  ('00000000-0000-0000-0000-000000000003', 'talk-to-your-crowd', 'Talk to Your Crowd', 'talk-to-your-crowd'),
  ('00000000-0000-0000-0000-000000000004', 'agency', 'Agency Flux', 'agency'),
  ('00000000-0000-0000-0000-000000000005', 'local', 'Local Tenant', 'local'),
  ('00000000-0000-0000-0000-000000000006', 'default', 'Default Tenant', 'default')
on conflict (slug) do update set external_id = excluded.external_id;

-- 2. Inserir catálogo de projetos
insert into custom_agencyflux.flux_projects (id, name, slug, project_type, status, owner_name, description, external_id, tenant_id) values
  ('00000000-0000-0000-0000-000000000010', 'FBR Agency Flux', 'agency-flux', 'custom', 'active', 'Sergio', 'Camada transversal de coordenação e observabilidade operacional', 'agency-flux', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000020', 'After Forty', 'after-forty', 'blog', 'active', 'Sergio', 'Piloto operacional de publisher FBR News para público 40+', 'after-forty', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000030', 'Talk to Your Crowd', 'talk-to-your-crowd', 'blog', 'active', 'Marcus Cole', 'Publisher FBR News de marketing e conversão para varejo local nos EUA', 'talk-to-your-crowd', '00000000-0000-0000-0000-000000000003')
on conflict (slug) do update set status = excluded.status, owner_name = excluded.owner_name, description = excluded.description;

-- 3. Inserir Roster Completo de Agentes (15 Perfis + Gestores Editoriais)
insert into custom_agencyflux.flux_agents (name, role, profile_ref, status) values
  ('Íris', 'Orquestração & Intake', '01-conceitual/MP-001-authority-engine-intake-iris.md', 'active'),
  ('Kora', 'Kanban, Sprints & Estado', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Bia', 'Pesquisa de Mercado & Amazon US', 'knowledge/afterfortyheidi/projetos/after-forty-context.md', 'active'),
  ('Rick', 'Radar de Afiliados & Monetização', 'knowledge/afterfortyheidi/projetos/after-forty-context.md', 'active'),
  ('Heidi Braun', 'Gestora Editorial — After Forty', '02-prd/HeidiBraun.md', 'active'),
  ('Marcus Cole', 'Gestor Editorial — Talk to Your Crowd', '02-prd/PRD-PROJETO-TALK-TO-YOUR-CROWD-EN.md', 'active'),
  ('Gestor Editorial', 'Gestor Editorial (Função Genérica)', '02-prd/TEMPLATE-GESTOR-EDITORIAL.md', 'active'),
  ('Rita', 'Listings Amazon & Oferta', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Caio', 'Copywriting Comercial & LPs', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Lia', 'Direção Visual & Motion', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Vito', 'Audiovisual & Redes Sociais', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Rafa', 'Mídia Paga & Tráfego', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Théo', 'Engenharia, Banco & Deploy', '04-database/001_flux_foundation.sql', 'active'),
  ('Gabe', 'QA Independente & Compliance', '03-arquitetura/politica-flexivel-de-evidencias.md', 'active'),
  ('Duda', 'SDR Consultivo & SPIN Selling', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Email Guardian', 'Triagem Segura de E-mails', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Second Brain Guardian', 'Memória & Rastreabilidade', '02-prd/PRD-Agency-Flux-operacional.md', 'active'),
  ('Sergio', 'Direção Geral & Gatekeeper Humano', '01-conceitual/MP-000-foundation.md', 'active')
on conflict (name) do update set role = excluded.role, profile_ref = excluded.profile_ref, status = excluded.status;

-- 4. Inserir Cards Iniciais na Esteira do Authority Engine
insert into custom_agencyflux.flux_cards (id, project_id, title, objective, status, priority, acceptance_criteria) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000020', '[Authority Engine] After Forty · Heidi Braun', 'Pautas editoriais e pesquisa de suplementos 40+ na Amazon US', 'ready', 'high', '12 artigos editoriais com disclaimers e links validados'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000030', '[Authority Engine] Talk to Your Crowd · Marcus Cole', 'Produção dos 8 artigos-pilar em inglês e pesquisa de ASINs de Store Signs na Amazon.com', 'ready', 'high', '8 artigos-pilar em inglês com disclaimers FTC e produtos Amazon')
on conflict (id) do nothing;

-- 5. Inserir Gate G1 (Aprovação Formal da Persona Marcus Cole)
insert into custom_agencyflux.flux_approvals (id, card_id, decision, action_scope, impact, rollback_plan) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102', 'pending', 'Gate G1: Aprovação Formal da Persona Marcus Cole e Identidade Visual (Talk to Your Crowd)', 'Autoriza a produção dos 8 artigos-pilar em inglês com a voz e imagem de Marcus Cole', 'Revisar o Character Profile em 02-prd/MarcusCole.md')
on conflict (id) do nothing;

-- 6. Garantir que a linha de controle de versão global exista
insert into custom_agencyflux.flux_runtime_revision (id, version, coordinator_waiting_reasons)
values (true, 1, array[]::text[])
on conflict (id) do nothing;

commit;

