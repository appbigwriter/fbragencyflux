# Fechamento local — contratos e operação

## Estado desta correção

As correções locais desta passagem foram aplicadas e cobertas por regressões específicas. Owner técnico: Kora. O QA independente deve refazer a validação; esta entrega não é QA final nem E2E remoto.

## Intake genérico

`src/lib/intake.ts` aceita briefing Markdown com título e campos `owner`, `tenant`, `objective`, `input/entrada`, `scope` e `nextStep`, além de Acceptance explícito. Contexto incompleto resulta em 422; nenhuma aceitação é fabricada. Seções de Persona, Design System, Assets e Restrictions tornam-se inputs versionados. `Project`, cards e jobs carregam `tenantId`; `persistIntake` usa chave tenant+project id, atualização do repository e receipt sanitizado.

O endpoint `POST /api/flux/intake` exige sessão com papel `coordinator`, normaliza o briefing e registra readback local. Nenhum dispatcher externo é acionado.

## Dedupe e recebimento local

`dispatchIncoming` é usado diretamente pelas rotas `/api/flux/dispatcher` e `/api/flux/hermes-events`. Ambas usam a configuração normal do repository (`FLUX_DATA_FILE`/JSON local ou o modo configurado) e a inbox persistente em `events`, indexada por `eventId`; o mesmo delivery reenviado após restart não reaplica a mutação. O caminho transacional cria ou atualiza o job e grava o aceite/receipt na mesma escrita lógica. O `Set` process-local permanece somente como fast-path, nunca como garantia de dedupe.

## Serialização, recuperação e falha parcial

`JsonFluxRepository` usa lockfile exclusivo com token/owner e lease renovável; a idade sozinha não remove lock cujo heartbeat está vivo. Temporários são únicos (`pid + randomUUID`) e `update()` mantém read-modify-write sob o mesmo lock. A regressão cobre mutation de 5,2 s entre duas instâncias.

## Observabilidade

`createReceipt` é integrado ao intake, dispatcher/webhook e mutations principais de card, job, approval, gate, handoff, triagem e blockers. Receipts têm correlation ID, operação, estado, timestamps e duração; metadados são sanitizados. O intake e as rotas de mutação retornam o receipt quando há persistência; respostas idempotentes reutilizam o receipt do evento anterior quando disponível.

## Limites remanescentes

JSON é persistência local/fixture. O adapter Supabase exige versão coerente e usa CAS por `state_key + version`; resposta HTTP sem uma linha atualizada, erro ou ausência de representação falha fechado como conflito. Isso não é uma transação remota e o Supabase real não foi validado. Resume/forward/triage/resolve agora executam validações e alterações dentro de `mutateState`; o lock local mantém read-modify-write serializado e sem gravação parcial. `tenantId` é exigido no intake novo e checado quando fornecido, enquanto registros legados sem tenant continuam legíveis. RLS, dispatcher Hermes remoto, heartbeat outbound real, deploy, backup externo, E2E e S7 continuam bloqueados. `nextCheck`: solicitar QA independente, sem declarar esta passagem como QA final.

## Leitura server-side agregada por allowlist

`GET /api/flux/snapshot` e `GET /api/flux/cards` aceitam uma allowlist explícita em `readScope=tenantId/projectId,tenantId/projectId` ou no header `x-flux-read-scope` (whitespace ao redor é aceito). `tenantId/*` autoriza todos os projetos desse tenant; `*` global, entradas vazias, malformadas e duplicatas normalizadas são rejeitados, sempre falhando fechado. A leitura `private` exige sessão autenticada; a leitura `public` exige `scope=public` e pertencimento à política em `FLUX_PUBLIC_READ_SCOPE`. Com `tenantId/*`, o `projectId` público pode ser omitido.

O snapshot agregado filtra no servidor projetos, cards, jobs, Handoffs, artefatos, approvals, eventos, blockers e gates exclusivamente pela política: pares exatos ou qualquer projeto cujo `tenantId` esteja coberto por `tenantId/*`. Registros legados sem `tenantId` não entram em leitura pública wildcard. Todo projeto e entidade tenant-scoped preserva `tenantId`; nenhum estado global é exposto ou mutado durante a construção do snapshot. O dashboard Home usa diretamente essa allowlist e mostra indisponibilidade controlada quando ela não existe; não há requisito de projeto único.

`FLUX_PUBLIC_READ_SCOPE=fbr-news/*` é uma decisão única de visibilidade para o tenant `fbr-news`, não uma autorização global. O runtime público ainda precisa ser configurado uma vez para o tenant correto; o wildcard só elimina a reconfiguração manual a cada novo projeto desse tenant.

## Tracing do filesystem

O repository JSON de runtime usa exclusivamente `path.join(process.cwd(), 'data', 'flux-state.json')`; caminhos absolutos continuam aceitos apenas pelo parâmetro explícito usado por testes/rotinas locais. Isso remove o acesso dinâmico de `FLUX_DATA_FILE` do bundle Turbopack. O caminho seguro inclui somente o arquivo de estado, não histórico ou diretórios arbitrários.
