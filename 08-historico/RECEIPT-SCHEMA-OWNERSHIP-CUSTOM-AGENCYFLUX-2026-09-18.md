# Receipt — Correção de ownership do schema Flux — 2026-09-18

## CARD
- Task: GDB-SCHEMA-20260918-001
- Projeto: FBR Agency Flux / GestaoDB-Control Tower
- Owner: David
- Modo: correção local; nenhuma migration SQL remota executada.

## Decisão canônica
- Schema provisionado informado por Sergio: `custom_agencyflux`.
- `public` permanece reservado às entidades próprias do Control Tower.
- Tabelas, funções, triggers, policies, índices e RPCs do Flux devem usar `custom_agencyflux`.

## Alterações locais
- `04-database/002_flux_state_version_cas.sql`: snapshot legado usa `custom_agencyflux.flux_state`.
- `04-database/003_flux_relational_persistence.sql`: cria schema e define `search_path` para `custom_agencyflux`.
- `04-database/004_flux_relational_rpcs.sql`: DDL/RLS/RPCs/grants qualificados para `custom_agencyflux`; `SECURITY DEFINER` usa `pg_catalog, custom_agencyflux`.
- `04-database/004_flux_runtime_relational.sql`: rascunho legado colocado em quarentena sem SQL executável.
- `09-codigo/src/lib/relational-repository.ts`: SQL direto chama `custom_agencyflux.flux_relational_read/commit`.
- `09-codigo/src/lib/relational-driver.ts`: PostgREST envia `Accept-Profile`/`Content-Profile: custom_agencyflux`.
- `09-codigo/scripts/supabase-persistence-smoke.mjs`: headers de schema corrigidos.
- `09-codigo/tests/build-relational-migration.mjs`: generator não recria objetos no `public`.
- `09-codigo/tests/schema-ownership.test.ts`: teste negativo de isolamento adicionado.
- `GestaoDB/supabase/migrations/011_flux_external_state.sql`: snapshot legado usa schema Flux proprietário.

## Verificação local
- Testes de ownership + adapters: 12/12 PASS.
- Typecheck Flux: PASS.
- Build Flux: PASS.
- Busca recursiva nos SQL/migrations: nenhuma ocorrência de `custom_flux` remanescente.
- Nenhuma operação remota executada.

## Migrations completas
A aplicação integral ainda não foi executada porque:
- esta sessão não possui URL/chave/DATABASE_URL autorizados;
- o GestaoDB possui colisões de numeração 010/011/012;
- a ordem precisa ser confirmada contra o histórico remoto antes de aplicar;
- backup/export e readback são pré-requisitos.

## Próxima ação
Confirmar o estado remoto e executar a trilha canônica com backup, receipt e readback. Não aplicar todos os arquivos por ordem lexical.
