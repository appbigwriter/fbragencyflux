# PRD — Flux UX operacional (entrega)

## Objetivo
Permitir que operadores leiam, encaminhem e retomem trabalho bloqueado com instrução executável, feedback visível e readback auditável.

## Critérios verificáveis
- O formulário de encaminhamento usa labels associados a campos, layout responsivo, overflow interno e defaults editáveis do blocker.
- Os campos obrigatórios são `de`, `destinatário/owner`, `objetivo`, `entregável`, `critérios de aceite`, `evidência necessária`, `próximo passo` e `fallback/ação requerida`.
- O submit não envia `actor`; a rota obtém o actor da sessão autenticada.
- Loading, sucesso, erro HTTP/rede e idempotência são visíveis ao operador.
- O encaminhamento persiste Handoff, job, evento e HOLD sem resolver o blocker open.
- Todos os Handoffs oferece busca, filtros por status/owner/projeto, abertura de detalhes e ações condicionais.
- Jobs apresenta cards/lista executiva com agente, objetivo, etapa, status semântico, progresso, última atividade, dependências e ações. JSON técnico é opcional nos detalhes.

## Contratos de API
- `POST /api/flux/blockers/:id/forward`: sessão com role `operator`; payload contém `cardId`, `jobId`, `correlationId` e `resolutionAction`, sem actor.
- `POST /api/flux/handoffs/:id/resume`: sessão com role `coordinator`; usado para retomada de Handoffs legacy/HOLD.

## Evidências de validação
Executar no diretório `09-codigo`: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`. O teste de integração `tests/blocker-forward.test.ts` verifica sessão, anti-spoofing, persistência, blocker open e repetição idempotente.
