# Flux — desbloqueio por encaminhamento

## Fluxo operacional

1. Um Handoff, job ou card pode declarar um blocker `status: open` com `cause`, `owner`, `nextAction`, `resolutionPlan` e, quando disponível, `resolutionEvidence`
2. O dashboard exibe os cinco campos sem completar lacunas. Sem `owner`, `nextAction` ou `resolutionPlan`, a ação permanece desabilitada e mostra `solução não declarada`
3. Um operador autenticado chama `POST /api/flux/blockers/:id/forward` com `cardId` ou `jobId` e `correlationId`. O actor é sempre derivado da sessão server-side; `actor` enviado pelo browser não é aceito
4. O servidor valida que o blocker existe, é `open` e tem solução declarada. Blockers `legacy` ou `resolved` são rejeitados
5. A operação grava um Handoff de encaminhamento e um evento com `from`, `to`, `blockerId`, card/job, solução, timestamp e `correlationId`. A mesma correlação retorna o registro existente sem duplicar evento ou Handoff
6. O card/job passa a `awaiting_owner`; o blocker permanece `open` até resolução posterior baseada em evidência
7. A UI confirma destinatário e próximo passo após o readback da API

## Critérios de aceite

- Dado blocker aberto completo, botão habilitado como `Prosseguir / liberar para <owner>` e encaminhamento persistido
- Dado solução ausente, botão disabled com motivo literal `solução não declarada`; nenhuma identidade ou solução é inventada
- Dado blocker legacy ou resolved, API responde conflito e não altera estado
- Dado correlação repetida, existe exatamente um evento e um Handoff de encaminhamento
- Dado request sem sessão, API responde `401`; actor no body nunca substitui a sessão
- Dado encaminhamento aceito, readback confirma `from` autenticado, `to` owner, solução, correlação e estado `awaiting_owner`, mantendo blocker `open`

A operação é local e não executa deploy, publicação, gasto, migration ou integração externa
