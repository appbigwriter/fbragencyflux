# Observabilidade de atividade de agents — After Forty

## Diagnóstico
O dashboard local agora persiste `jobs` e `agentRuns` no mesmo readback JSON do Flux. Registros históricos são importados somente quando um arquivo fornece `de`, objetivo e card; campos ausentes não são inventados. A fonte é marcada como `filesystem/Handoff readback`.

## Fontes reconhecidas
- `F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty` — Markdown/YAML de Handoffs e relatórios
- `F:/Projetos/_FBR/FBR Blogs/After Forty` — pacote real After Forty

O sincronizador extrai de/para, card, objetivo, entregável, status, blockers e critérios. A chave determinística evita duplicação no readback.

## Blockers, riscos e causa raiz
A causa raiz da apresentação ambígua era o uso de `h.risks` e de listas históricas de pendências com o rótulo `Blocker`, sem status, owner ou contrato de resolução. A regra agora é: risco não é blocker ativo; somente um blocker explicitamente declarado com `status: open` entra na contagem ativa. Um blocker `open` exige `owner`, `nextAction` e `resolutionPlan`; `resolutionEvidence` registra a evidência esperada. Registros antigos sem estado explícito são normalizados como `status: legacy`, `verification: unverified` e `resolution: not_declared`, nunca como `open`. Handoffs existentes não recebem solução inventada.

## Tempo real e limitações
A API aceita atualização local autorizada para eventos `dispatched`, `accepted`, `started`, `progress`, `waiting_input`, `blocked`, `artifact_created`, `handoff_sent`, `review`, `completed`, `failed` e `cancelled`, incluindo heartbeat por `lastSeen`, progresso e correlação. A interface faz polling curto de 5 segundos e exibe última atualização/stale data disponível.

O runtime Hermes/dispatcher não expõe atualmente um stream de eventos consumível por este dashboard. Portanto, não declarar tempo real completo: filesystem é histórico, não tempo real. O contrato de adapter está em `PATCH /api/flux/jobs/:id` e não executa agents externos. Runs locais sem evidência ficam `not_verified`; derivados de arquivo ficam `completed`, `review` ou `blocked` conforme a evidência textual.

## Critérios de aceite
- Jobs persistem os campos de identidade, objetivo, status, timestamps, refs, blockers, próximo passo, correlação e origem
- GET lista e detalha jobs; POST cria e PATCH atualiza apenas com sessão local/operator
- Filtros por agent, status e card funcionam
- Dashboard separa atividade, Handoffs, cards de projeto e Gates humanos
- Nenhum Handoff rotineiro cria approval ou Gate
- Cards e Gates existentes permanecem preservados
- Testes, typecheck, lint e build executam sem erro
