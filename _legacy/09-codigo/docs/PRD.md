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
- Cada blocker na home e nos detalhes de Handoff oferece `Chat with blocker`/`Conversar sobre este blocker` sem login; o prompt é sanitizado, limitado e inclui autor/originador, owner, causa, HOLD/plano, próxima ação, aceite/evidência e a pergunta operacional.
- A ponte usa `data-hermes-send` e feature detection de `window.hermes.send`; envia ao chat atual do Hermes, confirma o envio e oferece cópia do contexto quando a ponte não está disponível. Não altera o estado do blocker.
- Não há contrato oficial para selecionar sessão ou agent específico a partir do app; qualquer integração desse tipo só pode ser adicionada quando o contrato oficial existir.
- Jobs apresenta cards/lista executiva com agente, objetivo, etapa, status semântico, progresso, última atividade, dependências e ações. JSON técnico é opcional nos detalhes.

## Contratos de API
- `POST /api/flux/blockers/:id/forward`: sessão com role `operator`; payload contém `cardId`, `jobId`, `correlationId` e `resolutionAction`, sem actor.
- `POST /api/flux/handoffs/:id/resume`: sessão com role `coordinator`; usado para retomada de Handoffs legacy/HOLD.

## Dashboard multi-projeto e leitura segura
- `FLUX_PUBLIC_READ_SCOPE` é uma allowlist obrigatória no formato `tenantId/projectId,tenantId/projectId` ou `tenantId/*`. O wildcard de tenant autoriza todos os projetos daquele tenant; `*` global não é aceito. Whitespace ao redor é aceito; entradas vazias/malformadas e duplicatas normalizadas são inválidas e deixam o dashboard indisponível (fail-closed).
- Home constrói um snapshot agregado dos pares permitidos; não exige projeto único e não expõe estado global quando a variável não está configurada.
- `GET /api/flux/snapshot` e `GET /api/flux/cards` aceitam `readScope` ou `x-flux-read-scope` com múltiplos pares e wildcards de tenant. Compatibilidade de um par permanece disponível via `tenantId`/`projectId` ou headers equivalentes; em leitura pública com tenant wildcard, `projectId` pode ser omitido.
- Leituras privadas exigem sessão autenticada. Leituras públicas exigem `scope=public`, allowlist de runtime e pertencimento à política configurada. `FLUX_PUBLIC_READ_SCOPE=fbr-news/*` é uma decisão única de visibilidade do tenant, não uma autorização global; o runtime público ainda precisa ser configurado uma vez para o tenant correto. Cross-tenant é rejeitado, e registros legados sem `tenantId` não são expostos por wildcard público.
- O filtro agregado cobre projetos, cards, jobs, Handoffs, artifacts, approvals, events, blockers e gates, preservando `tenantId` e sem mutar o estado carregado.
