# FBR Agency Flux executor — estado atual

Este código é o executor local verificável do Flux, não a entrega remota completa. Ele lê o estado persistido fora de `src`, importa os drafts reais de `08-historico/afterforty/drafts`, mostra Gates, artefatos, Handoffs e eventos. Mutations usam sessão server-side: decisões exigem papel `gatekeeper`, transições `operator`, Handoffs `coordinator`; o actor nunca é aceito do body. O login local é explicitamente local-only e exige `FLUX_LOCAL_LOGIN_ACTOR` + `FLUX_LOCAL_LOGIN_SECRET` via ambiente

## Escopo local

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run start -- -p 3000
```

Acesse `http://localhost:3000`. A interface tem filtro AF-001, detalhe navegável, ações de transição, approval com escopo/impacto/rollback, os exatamente 4 Gates transversais do FBR Agency Flux, confirmação visual de decisão local, teste explícito de ator sem permissão, formulário de Handoff e botão de reload/readback. O banner `LOCAL TEST ENVIRONMENT · NO EXTERNAL EFFECT` é obrigatório: nenhuma ação publica, gasta, gera HopLink ou altera produção.

### Gates transversais do Flux

`GET /api/flux/gates` retorna exatamente os quatro Gates persistidos do `FBR Agency Flux`; `POST /api/flux/gates/:id/decision` exige sessão autenticada com papel `gatekeeper` e aceita apenas a decisão no body. A identidade é derivada server-side da sessão; `actor` e `scope` enviados pelo cliente são ignorados. A decisão é conceitual/local, idempotência é fail-closed para Gate já decidido e `externalActionAuthorized` permanece `false`. Aprovar não executa deploy, publicação, DNS, HopLink, gasto, migration ou integração externa

Smoke local reproduzível:

```bash
curl -s http://localhost:3000/api/flux/gates
curl -s -X POST http://localhost:3000/api/flux/gates/AF-GATE-01/decision -H 'content-type: application/json' -d '{"decision":"approved","actor":"Sergio","scope":"local"}'
curl -s http://localhost:3000/api/flux/gates
```

`FLUX_DATA_FILE` permite apontar um arquivo JSON de teste. Gravações usam arquivo temporário + rename. Os drafts reais são sincronizados do filesystem e exibidos com caminho e tamanho.

## Produto-alvo e limite

O resultado esperado em `03-arquitetura/resultado-esperado-do-flux.md` é um sistema executor que recebe MD conceitual e entrega banco, backend, frontend, Easypanel e domínio. Ainda não é honesto declarar essa entrega: falta intake de MD, orquestração de agents, banco remoto, Control Tower, auth/RBAC real, RLS, adapter, backup, locking, observabilidade, Easypanel, DNS, domínio público, integrações e smoke/readback externo.

O contrato remoto documentado em `03-arquitetura/runtime-control-tower.md` tem blocker real: Control Tower 404 e gateway Supabase 401 na última validação registrada, sem credencial disponível. Não há secrets neste repositório.

Consulte `ACCEPTANCE-MATRIX.md` e `../08-historico/dashboard-e2e-gap-report.md` para a matriz e o relatório requisito a requisito. Não usar `completed` como sinônimo de build verde.

## Modelo do dashboard

O dashboard mantém quatro escopos separados:

- **Gates do FBR Flux**: exatamente `FLUX-GATE-01` a `FLUX-GATE-04`, com status, decisão, blockers e evidências registradas
- **Projetos acompanhados**: catálogo dos projetos persistidos, sem transformar um projeto em estado geral do Flux
- **Pendências por projeto**: cards agrupados pelo projeto de origem; `AF-001` permanece `awaiting_approval` e `AF-002` permanece `review`
- **Indicadores independentes**: Gates pendentes, cards pendentes, blockers e projetos acompanhados são contados separadamente

Aprovar um Gate do FBR Flux não altera automaticamente cards de projetos. A atividade rotineira de agents e Handoffs é somente observacional/operacional e não cria approvals artificiais. Jobs derivados do filesystem aparecem como `filesystem/Handoff readback`; esse readback é histórico, não tempo real. A interface atualiza por polling de 5 segundos. O runtime Hermes/dispatcher ainda não fornece stream de eventos ao dashboard, portanto tempo real completo permanece um blocker técnico; o adapter local aceita heartbeats e eventos via `PATCH /api/flux/jobs/:id`.
