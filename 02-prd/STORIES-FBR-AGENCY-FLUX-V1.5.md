# Backlog executável — FBR Agency Flux v1.5

## Sprint S15-A — Clareza do presente

| Story | Entregável | Aceite |
|---|---|---|
| S15-01 | Separação atual/histórico | Handoffs/Jobs atuais não somam legacy; filtro Histórico explícito |
| S15-02 | Cards por project.id | Cards aparecem mesmo com nome diferente do id |
| S15-07 | Home acionável | owner, nextAction, blocker, decisão e nextCheck visíveis |
| S15-08 | Handoffs ativos primeiro | Handoff histórico não ocupa a fila principal |
| S15-09 | Chat sem duplicação | uma ação contextual por Handoff ou blockers identificados |

## Sprint S15-B — Planejamento real

| Story | Entregável | Aceite |
|---|---|---|
| S15-03 | Modelo Sprint | Sprint persistido por projeto/tenant com status e objetivo |
| S15-04 | Modelo Story | Story associada a Sprint, card/job, owner e aceite |
| S15-05 | Tela Sprints/Stories | filtros, progresso, blockers e owners navegáveis |
| S15-06 | Intake preview | preview antes do POST e readback após persistência |

## Sprint S15-C — Execução e follow-up

| Story | Entregável | Aceite |
|---|---|---|
| S15-10 | Next check obrigatório | nenhum job ativo sem owner/ação/nextCheck |
| S15-11 | Worker local | ciclo Iris persistido e visível |
| S15-12 | Dispatcher fake demonstrável | evento fake atualiza job e gera receipt |
| S15-14 | Timeline/receipts | mutação e histórico visíveis no detalhe |

## Sprint S15-D — Segurança e operação

| Story | Entregável | Aceite |
|---|---|---|
| S15-13 | Auth/RBAC persistente | sessão/roles/tenant sobrevêm ao ciclo homologado |
| S15-16 | Secret rotation | service role e auth secrets rotacionados, sem vazamento |
| S15-18 | Runbook | deploy, migration, rollback e incident response documentados |

## Sprint S15-E — Prova para apresentação

| Story | Entregável | Aceite |
|---|---|---|
| S15-15 | E2E local After Forty | intake → plano → job → handoff → readback reproduzível |
| S15-17 | Smoke de apresentação | roteiro completo executado sem ação pública/financeira |
| QA-15 | QA independente | sem blocker de código e relatório de limitações |

## Prioridade

- **P0:** S15-01, S15-02, S15-07, S15-08, S15-09, S15-06, S15-15, S15-17.
- **P1:** S15-03, S15-04, S15-05, S15-10, S15-11, S15-12, S15-14.
- **P2:** S15-13, S15-16, S15-18 quando dependentes de infraestrutura/Gate.
