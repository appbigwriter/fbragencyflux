# ADR — Agency Flux: persistência 100% relacional

**Status:** proposta bloqueada para Gate estrutural de Sergio  
**Card:** FLUX-017  
**Decisão:** Supabase/Postgres será a única fonte de verdade operacional e documental do Agency Flux.

## Regra não negociável

Não usar como fonte de verdade:

- `state jsonb` para dados operacionais;
- `flux-state.json` ou `FLUX_DATA_FILE`;
- fixtures JSON em runtime;
- dados mockados/hardcoded apresentados como estado real;
- Markdown/YAML/filesystem para Handoffs, Jobs, evidências ou histórico operacional;
- arrays JSON, payloads JSON ou colunas `jsonb` para entidades do domínio.

Arquivos de código, migrations e documentação técnica continuam no repositório. Conteúdo operacional e documentos de negócio devem ser armazenados no banco, com conteúdo e metadados relacionais.

## Modelo relacional alvo

### Núcleo e isolamento

- `flux_tenants`
- `flux_projects`
- `flux_agents`
- `flux_project_agents`

Toda entidade operacional deve possuir `tenant_id` e, quando aplicável, `project_id`, com FKs e RLS.

### Planejamento

- `flux_sprints`
- `flux_stories`
- `flux_cards`
- `flux_card_dependencies`
- `flux_card_acceptance_criteria`
- `flux_card_risks`

### Execução

- `flux_jobs`
- `flux_job_dependencies`
- `flux_job_blocks`
- `flux_job_evidence`
- `flux_agent_runs`
- `flux_agent_run_events`
- `flux_heartbeats`

### Governança

- `flux_gates`
- `flux_gate_evidence`
- `flux_approvals`
- `flux_approval_events`
- `flux_required_actions`
- `flux_required_action_events`

### Handoffs e blockers

- `flux_handoffs`
- `flux_handoff_decisions`
- `flux_handoff_risks`
- `flux_handoff_acceptance_criteria`
- `flux_blockers`
- `flux_blocker_actions`
- `flux_blocker_events`

### Evidências e documentos

- `flux_artifacts`
- `flux_artifact_versions`
- `flux_artifact_contents`
- `flux_artifact_evidence`
- `flux_sources`
- `flux_source_citations`

O conteúdo textual deve ficar em colunas `text`; binários devem usar storage controlado com registro transacional de checksum, versão e referência. O filesystem local não será fonte de verdade.

### Auditoria e observabilidade

- `flux_events`
- `flux_event_attributes` — uma linha por atributo simples, sem `jsonb`
- `flux_receipts`
- `flux_receipt_attributes`
- `flux_coordinator_runs`
- `flux_coordinator_waiting_reasons`
- `flux_audit_log`

## Regras de dados

- Nenhuma entidade operacional será serializada dentro de outra entidade.
- Critérios, evidências, riscos, dependências e blockers terão tabelas filhas.
- Eventos terão colunas tipadas para origem, destino, ator, operação, correlação e timestamps.
- Atributos variáveis serão modelados por tabela tipada; não criar `metadata jsonb` como atalho.
- Toda mutation será transacional e idempotente quando possível.
- CAS usará coluna `version` na entidade alterada, não uma versão dentro de JSON.
- Soft delete/arquivamento terá colunas explícitas e auditoria; não apagar dados operacionais sem Gate.
- RLS será habilitado e forçado; policies serão tenant/project-scoped.
- Leitura pública terá views ou funções SQL explicitamente autorizadas.

## Remoções obrigatórias do código

- `SupabaseFluxRepository` baseado em snapshot único.
- `FluxState` como aggregate persistido.
- `JsonFluxRepository` em qualquer runtime da aplicação.
- `FLUX_PERSISTENCE=json` e `FLUX_DATA_FILE` fora de testes unitários isolados.
- `seededGates` como fallback silencioso.
- `syncHandoffs` e `syncAgentRuns` como fonte de leitura filesystem.
- `FLUX_IMPORT_HISTORY` como mecanismo de ingestão operacional.
- seeds fixos apresentados sem classificação explícita de bootstrap.
- cálculo de progresso que inventa valor quando o banco não possui progresso.

## Migração segura

1. Congelar o schema atual e produzir inventário de todas as entidades exibidas.
2. Criar migration relacional nova, idempotente e com RLS.
3. Criar backfill único e auditável do snapshot/fixtures autorizados.
4. Comparar contagens e checksums por entidade.
5. Implementar adapter relacional atrás de interfaces testáveis.
6. Rodar testes de isolamento, constraints, CAS, restart e concorrência.
7. Fazer dual-read somente em staging para comparação; não manter dual-write indefinidamente.
8. Obter Gate de Sergio para migration e backfill remoto.
9. Aplicar migration no Supabase autorizado.
10. Fazer readback independente e só então remover o caminho JSON/filesystem.

## Critérios de aceite

- Zero leitura operacional de JSON ou filesystem.
- Zero escrita operacional em JSON ou filesystem.
- Zero entidade exibida sem registro relacional correspondente.
- Zero dado mockado apresentado como live.
- Todos os dados exibidos possuem `tenant_id`, origem, timestamps e auditoria.
- Conteúdo de documentos e evidências é recuperável do banco/storage registrado.
- RLS prova isolamento entre tenants/projetos.
- CAS impede lost update.
- Restart/redeploy preserva estado.
- Falha de banco bloqueia a aplicação; não há fallback silencioso.
- Dashboard, Jobs, Handoffs, Sprints, Stories, Gates e Blockers leem as mesmas tabelas relacionais.
- Migration, backfill e readback têm receipts verificáveis.

## Limite atual

Esta decisão ainda não foi implementada. Nenhuma migration remota foi executada. O schema existente e o adapter `flux_state` permanecem como legado até o Gate e a migração verificável.
