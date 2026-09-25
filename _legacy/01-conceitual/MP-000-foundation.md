# MP-000 — Fundação do Projeto: FBR Agency Flux

## Status
`FUNDACAO` | em_revisao_estrutural

## Resumo
O FBR Agency Flux é a camada transversal de governança e orquestração dos projetos da FBR Agency. Registra projetos, agents, cards, dependências, Gates de aprovação, eventos, artefatos, handoffs, jobs, blockers e readbacks, permitindo acompanhamento auditável sem substituir o Control Tower ou os sistemas especialistas.

O Flux é o orquestrador durável do fluxo Authority Engine (https://sistemas-authority.pojxaz.easypanel.host/about) → Audience ("F:\Projetos\_FBR\FBR Audience\02-prd\PROJETO-CONCEITUAL-AUDIENCE-BUILDER.md" ) → Sales Enine ("F:\Projetos\_FBR\Sales Engine\README.md" ) → Control Tower que é onde o banco de dados é provisionado . Ele não é a fonte canônica da Persona; sua responsabilidade é coordenar estados, eventos, aprovações, provisionamento, retries e publicação.

## Decisões de arquitetura

- Stack: Next.js, TypeScript, Tailwind, Supabase/Postgres
- Padrão: monólito modular com repositório local para desenvolvimento e adapter Supabase para produção
- Estado: máquina de estados explícita e transições registradas em eventos
- UI: dashboard mínimo de leitura, Central de Aprovações e revisão de evidências
- Integrações: Authority Engine, FBR Blogs, Control Tower, Hermes, Kanban da Kora e Secret Manager, sempre atrás de adapters/API/eventos
- Orquestração: outbox no Authority Engine, inbox no Flux, eventos assinados, idempotência, retries e readbacks
- Aprovações: Sergio aprova/reprova/devolve com motivo obrigatório na Central de Aprovações
- Segurança: RLS, menor privilégio, Zero Secret Leaks
- Suposição: o schema dedicado será provisionado pelo Control Tower como projeto `custom` com template `custom_base`

## Schema

O DDL inicial está em `04-database/001_flux_foundation.sql`

| Tabela | Responsabilidade |
|---|---|
| flux_projects | Catálogo de projetos da FBR |
| flux_agents | Agents e funções |
| flux_cards | Trabalho e estado operacional |
| flux_card_dependencies | Dependências entre cards |
| flux_approvals | Central de Aprovações, decisões e motivos |
| flux_events | Auditoria de transições e ações |
| flux_inbox_events | Deduplicação de eventos recebidos |
| flux_jobs | Jobs duráveis, retries e blockers |
| flux_job_dependencies | Dependências entre jobs |
| flux_artifacts | Evidências verificáveis |
| flux_handoffs | Transferência entre responsáveis |
| flux_readbacks | Confirmações lidas dos sistemas externos |

## Critérios de fundação pronta

- [x] Estrutura de pastas criada
- [x] DDL inicial versionado
- [x] RLS habilitado no DDL
- [ ] Central de Aprovações implementada com aprovar/reprovar/devolver e motivo
- [ ] Inbox/outbox e idempotência implementados
- [ ] Jobs, retries, blockers e readbacks implementados
- [ ] Projeto provisionado no Control Tower
- [ ] DDL aplicado e lido de volta no Supabase
- [ ] Dashboard executando
- [ ] Usuário aprovou este MP-000

## Bloqueios atuais

- Provisionamento externo depende de `CONTROL_TOWER_AGENT_API_KEY` injetada no runtime
- Policies RLS específicas dependem do contrato de autenticação adotado
- O dashboard inicial usa dados locais até o adapter Supabase ser configurado
