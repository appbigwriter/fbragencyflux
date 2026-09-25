# Auditoria completa — FBR Agency Flux

**Data:** 2026-09-17  
**Escopo:** módulos, telas, APIs, operação, segurança, autonomia, E2E e prontidão para apresentação ao sócio.  
**Deploy público auditado:** `https://agency.fbr.news/`  
**Commit público confirmado durante o ciclo:** `cda9edb`  
**Projeto ativo:** After Forty / tenant `fbr-news`

## Veredicto

O sistema é um **Control Tower local e público parcialmente funcional**, adequado para demonstrar intake, projetos, cards, jobs, Handoffs, blockers, Gates e leitura agregada. Ainda não é uma operação autônoma completa da FBR Agency.

**Nota geral: 5,0/10.**

A nota considera como objetivo principal facilitar a gestão autônoma de todos os projetos, com maior peso para execução contínua, persistência externa, integração Hermes e E2E real.

## Evidências verificadas

- Home pública respondeu HTTP 200.
- After Forty apareceu no dashboard após o deploy multi-projeto.
- Intake After Forty foi persistido com HTTP 201.
- Projeto criado: `after-forty`.
- Cards criados: `after-forty-foundation`, `after-forty-execution`.
- Jobs criados: `after-forty-intake`, `after-forty-execution`.
- Dashboard público: 2 cards ativos e 2 jobs planejados.
- Handoffs públicos: 53 registros, majoritariamente históricos.
- Jobs públicos: 60 registros, incluindo 58 históricos.
- Testes locais verificados no ciclo: 111/111 aprovados antes da última correção pontual de UI; typecheck e lint aprovados.
- Política multi-projeto `tenant/*` implementada e publicada.
- Correção do botão duplicado de Chat em Handoff publicada em `cda9edb`.

## Matriz de módulos

| Módulo | Estado | O que funciona | Problema principal | Nota |
|---|---|---|---|---:|
| Intake | local + remoto parcial | briefing, checksum, inputs versionados, cards/jobs | ainda não é uma tela completa de onboarding | 6 |
| Projetos/Cards | parcial | estados, owner, prioridade, aceite | não há Kanban, Sprint ou Story como entidades do produto | 5 |
| Jobs | parcial | filtros, progresso, dependências, readback local | não há execução contínua nem dispatcher real | 5 |
| Handoffs | parcial | busca, filtros, detalhe, retomada, encaminhamento | histórico domina a tela e não há timeline viva | 6 |
| Blockers | parcial | owner, ação, plano, evidência, encaminhamento | follow-up ainda depende de ciclos manuais | 6 |
| Gates/Approvals | local | actor, escopo, impacto, rollback, Sergio required | durabilidade externa e execução após aprovação não comprovadas | 5 |
| Íris | parcial | triagem, decisão, required actions, dry-run/once | worker contínuo e acompanhamento real ausentes | 3 |
| Dispatcher Hermes | contrato local | assinatura, adapter, eventos, dedupe local | outbound Hermes e heartbeat não comprovados | 3 |
| Persistência | local forte / remoto parcial | lock, backup local, CAS preparado | Supabase/RLS/restore/redeploy não comprovados | 5 |
| Multi-tenant | local + deploy parcial | pares exatos e `tenant/*` | legado sem tenant ainda polui leituras históricas | 6 |
| Auth/RBAC | local parcial | sessão, roles, actor server-side | sessão em memória e RBAC remoto ausente | 4 |
| Observabilidade | parcial | receipts, correlation ID, eventos | sem heartbeat, timeline e métricas operacionais completas | 5 |
| Chat Hermes | fallback | contexto sanitizado e clipboard | página pública não recebe `window.hermes.send` | 4 |
| E2E | preparação | intake e readback público do After Forty | sem worker/Hermes/restart/RLS/readback externo completo | 3 |

## Auditoria de telas

### Home / Dashboard

**Entrega:** resumo executivo, métricas, projetos, cards prioritários, Gates, blockers, atenção operacional e últimos eventos.

**Pontos positivos:** leitura rápida, links para Jobs/Handoffs, estado vazio controlado, suporte multi-projeto.

**Problemas:** não mostra Sprint/Story, risco por projeto, próximo evento, saúde do worker, dispatcher ou decisão necessária. A apresentação de cards precisa usar consistentemente `project.id`, não `project.name`. Histórico e operação atual não estão suficientemente separados.

### Handoffs

**Entrega:** pesquisa, filtros por status/owner/projeto, detalhes, evidências, retomada e encaminhamento.

**Problemas:** 53 históricos aparecem na frente do ciclo atual; falta agrupamento por ciclo/Sprint; falta timeline; falta destaque para Handoffs ativos; histórico pode ser confundido com backlog.

### Jobs

**Entrega:** métricas, filtros, classificação Planejado/Histórico/Em execução, stale, prioridades, detalhes e ações de readback.

**Problemas:** 60 jobs com 58 históricos; nenhum job real em execução; progresso pode ser derivado do status; não há heartbeat real, ETA, retry ou fila de despacho.

### Login/Auth

**Entrega:** login, logout, roles e actor server-side.

**Problemas:** sessões em `Map` de memória; restart invalida sessões; roles são derivadas de nomes fixos; não há tela de usuários/tenant/RBAC.

### Detalhes de Job/Handoff

**Entrega:** contexto, owner, etapa, evidência, critérios, ações e JSON técnico.

**Problemas:** falta histórico completo de eventos, tentativas, custo, dispatcher, heartbeat e readback externo.

## Problemas críticos

1. Autonomia real não comprovada: não há worker contínuo, heartbeat ou dispatcher Hermes outbound verificado.
2. E2E completo não executado: faltam restart/redeploy, RLS, browser autenticado completo e readback independente.
3. Histórico domina as telas de Handoffs/Jobs e reduz clareza do ciclo atual.
4. Sprints e Stories existem no PRD, mas não como entidades operacionais no produto.
5. Persistência externa, CAS real, backup/restore e RLS continuam dependentes de ambiente/Gate.
6. Service role do Supabase apareceu exposto no painel de ambiente durante a operação e precisa ser rotacionado no Supabase/Control Tower.
7. Chat com blocker funciona apenas como fallback na URL pública; a ponte Hermes exige superfície compatível do host.
8. Status formal `.hermes` ficou desatualizado/protegido em partes do ciclo.

## Conclusão

Para uma demonstração ao sócio, o sistema deve ser apresentado como:

> **FBR Agency Flux — Control Tower operacional em evolução, com intake, rastreabilidade, Handoffs, Jobs, blockers e Gates; execução autônoma e E2E de produção ainda em fechamento.**

Não apresentar como sistema autônomo completo antes de concluir a v1.5.
