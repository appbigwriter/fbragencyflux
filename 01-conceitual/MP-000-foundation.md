# MP-000 — Fundação do Projeto: FBR Agency Flux

## Status
`FUNDACAO` | em_validacao

## Resumo
O FBR Agency Flux é a camada transversal de governança e orquestração dos projetos da FBR Agency. Registra projetos, agents, cards, dependências, gates de aprovação, eventos, artefatos e handoffs, permitindo acompanhamento simples e auditável sem substituir o Control Tower ou os sistemas especialistas

## Decisões de arquitetura

- Stack: Next.js, TypeScript, Tailwind, Supabase/Postgres
- Padrão: monólito modular com repositório local para desenvolvimento e adapter Supabase para produção
- Estado: máquina de estados explícita e transições registradas em eventos
- UI: dashboard mínimo de leitura e revisão
- Integrações: Control Tower, Hermes, Kanban da Kora e Secret Manager, sempre atrás de adapters
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
| flux_approvals | Decisões formais de Sergio |
| flux_events | Auditoria de transições e ações |
| flux_artifacts | Evidências verificáveis |
| flux_handoffs | Transferência entre responsáveis |

## Critérios de fundação pronta

- [x] Estrutura de pastas criada
- [x] DDL inicial versionado
- [x] RLS habilitado no DDL
- [ ] Projeto provisionado no Control Tower
- [ ] DDL aplicado e lido de volta no Supabase
- [ ] Dashboard executando
- [ ] Usuário aprovou este MP-000

## Bloqueios atuais

- Provisionamento externo depende de `CONTROL_TOWER_AGENT_API_KEY` injetada no runtime
- Policies RLS específicas dependem do contrato de autenticação adotado
- O dashboard inicial usa dados locais até o adapter Supabase ser configurado
