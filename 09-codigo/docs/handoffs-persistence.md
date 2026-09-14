# Handoffs: conteúdo persistido e limites

## O que o banco contém

`flux_state.state.handoffs` é a coleção completa de Handoffs, não um resumo dos jobs. Cada bloco YAML de Handoff válido encontrado em `08-historico/afterforty` e no pacote local `FBR Blogs/After Forty` vira um registro com ID SHA-256 determinístico do bloco sem o caminho da raiz. Assim, cópias nos dois roots não duplicam registros.

Cada registro preserva `id`, `cardId`, `project`, `from`, `to`, `summary`, `done`, `decisions`, `risks`, `nextStep`, `acceptanceCriteria`, `evidenceRef`, `createdAt`, `source`, `historical`, `legacy` e `status`. Campos ausentes ficam `not_declared`; blocos importados ficam `status: legacy` e são somente leitura. Jobs/AgentRuns continuam em `state.jobs` e não são substituídos pelos Handoffs. O fixture local verificado contém 67 Handoffs únicos: 66 históricos/legacy e 1 registro operacional; os roots espelhados não aumentam esse total.

O repositório lê a coleção inteira e grava por upsert em `flux_state`, sem apagar outros campos do estado. O caminho Supabase exige readback no próximo load; o adaptador JSON é usado apenas localmente/testes.

## Gestão

- `Retomar evolução` para legado cria um novo Handoff operacional com `source: resume:<id>`, sem mutar o legado, usando apenas `nextStep` e owner (`to`) já declarados.
- Registros persistidos usam status explícito (`received`, `in_progress`, `awaiting_owner`, `blocked`, `completed`, `legacy`) e persistem `lastUpdate`/`lastRelease`. `Liberar para owner` exige solução, owner e próximo passo declarados, registra evento com actor, owner, solução, nextAction e correlationId, e muda o Handoff para `awaiting_owner`; nunca mantém `released` como estado final ambíguo. Repetição do mesmo `correlationId` é idempotente.
- Sem dados mínimos, a interface explica a lacuna e mantém a ação desabilitada; não cria owner ou solução por inferência.

## O que ainda não contém

A importação não cria solução, owner, data histórica ou decisão ausente. Não há migração remota, deploy, publicação, disparo de agente ou mutação externa neste fluxo. Evidência aponta para o arquivo de origem; ela não é prova de que o artefato foi aprovado.
