# Handoff — Auditoria Fase 0/2/3 Agency Flux + Control Tower

**Data:** 2026-09-18
**Agente:** GPT-5.6 Luna / OpenAI Codex
**Modo:** somente leitura; nenhuma migration ou mutação externa
**Documento global:** aprovado por Sergio

## Resultado

O Agency Flux possui base local ampla de cards, jobs, handoffs, approvals, gates, blockers, eventos, dispatcher e worker. A Central de Aprovações existe parcialmente: há criação, listagem e approve/reject, mas não há devolução para revisão com motivo obrigatório comprovada no contrato atual.

A CT-001 do GestaoDB está implementada localmente, com testes locais aprovados, mas a migration 011 e o POST/GET com readback remoto continuam pendentes.

## Gaps prioritários

1. MP-000 do Flux ainda está em revisão estrutural.
2. RLS foi habilitado no DDL, mas policies e readback remoto não estão comprovados.
3. Central de Aprovações precisa de `changes_requested`, motivo obrigatório e actor derivado da sessão.
4. Dispatcher usa deduplicação process-local quando não há arquivo.
5. Falta inbox/outbox persistente com idempotency key, retry, backoff e dead-letter.
6. Integração Hermes/dispatcher depende de contrato HTTP autenticado ainda não validado.
7. Há colisão de numeração entre `011_flux_external_state.sql` e `011_project_configuration_artifacts.sql`.
8. Rota CT-001 `/configuration` não chama `authenticateToken`; autorização precisa ser definida.
9. Não há fluxo comprovado Flux → Control Tower com approval, outbox, readback e receipt.
10. Suíte local do Flux está em 138/141 testes, com 3 falhas em auth-control/UX contracts.

## Stories recomendadas

- F0-STRUCT-001: congelar contrato e ownership.
- F0-STRUCT-002: resolver sequência de migrations e colisão 011.
- F0-SEC-003: fechar tenant/RLS/RBAC.
- F2-APP-004: completar Central de Aprovações.
- F2-PERSIST-005: implementar inbox persistente.
- F2-PERSIST-006: implementar outbox transacional.
- F2-ORCH-007: tornar o Flux orquestrador durável.
- F2-DISP-008: remover dedupe process-local.
- F2-READBACK-009: criar receipts/readbacks externos.
- F3-CT-010: proteger CT-001 com auth/scope.
- F3-CT-011: aplicar migration 011 somente após Gate e fazer readback.
- F3-CT-012: automatizar provisionamento via adapter.
- F3-CT-013: integrar approval → Control Tower.
- F3-CT-014: fechar health/runtime contracts.
- QA-015: corrigir as três falhas locais do Flux.
- QA-016: criar matriz E2E auditável.
- OPS-017: operacionalizar worker/scheduler.

## Blockers

- Não aplicar migrations remotas sem Gate, backup, rollback e readback.
- Migration 004 do Flux não possui aplicação/readback remoto comprovado.
- CT-001 depende de aplicação remota de 011 e POST/GET real.
- Contrato do Control Tower tem divergências de host/401/404 e autenticação.
- RLS remoto não pode ser declarado pronto sem readback.
- Não há autorização para SQL, catálogo `public`, secrets ou ações irreversíveis.

## Testes verificados

- GestaoDB: 16/16 testes locais aprovados.
- Agency Flux: typecheck aprovado.
- Agency Flux: 138/141 testes aprovados; 3 falhas reais pendentes.

## Critério de handoff

A próxima execução deve começar por F0-STRUCT-001, F0-STRUCT-002 e F0-SEC-003, antes de migrations ou provisionamento remoto.
