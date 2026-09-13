# FBR Agency Flux executor — estado atual

Este código é o executor local verificável do Flux, não a entrega remota completa. Ele lê o estado persistido fora de `src`, importa os drafts reais de `08-historico/afterforty/drafts`, mostra Gates, artefatos, Handoffs e eventos, e permite transições, decisões locais de Sergio e criação de Handoffs com readback.

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

`GET /api/flux/gates` retorna exatamente os quatro Gates persistidos do `FBR Agency Flux`; `After Forty`/`AF-001` é apenas caso de exemplo. `POST /api/flux/gates/:id/decision` aceita `approved`, `rejected` ou `changes_requested` somente com `{ "actor": "Sergio", "scope": "local" }`. A decisão é conceitual/local, idempotência é fail-closed para Gate já decidido e `externalActionAuthorized` permanece `false`. Aprovar não executa deploy, publicação, DNS, HopLink, gasto, migration ou integração externa

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
