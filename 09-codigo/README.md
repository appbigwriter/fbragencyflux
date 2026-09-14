# FBR Agency Flux executor — estado atual

O código é o executor local verificável do Flux, não a entrega remota completa. Ele lê o estado persistido fora de `src`, mostra Gates, artefatos, Handoffs e eventos. O histórico de `08-historico/afterforty` é arquivo e não é importado por `load`; ingestão exige `npm run ingest:flux-history` ou `FLUX_IMPORT_HISTORY=1`. Mutations usam sessão server-side: decisões exigem papel `gatekeeper`, transições `operator`, Handoffs `coordinator`; o actor nunca é aceito do body. O login local é explicitamente local-only e exige `FLUX_LOCAL_LOGIN_ACTOR` + `FLUX_LOCAL_LOGIN_SECRET` via ambiente

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

## Bootstrap do estado real no Supabase

O snapshot `data/flux-state.json` só pode ser enviado pelo processo autorizado dentro do container Easypanel, com os secrets configurados no runtime Environment/Secrets. O comando não aceita aliases, Build Args ou credenciais na linha de comando:

```bash
npm run seed:flux-state -- --confirm-seed
```

No terminal do container Easypanel, execute exatamente o comando acima. O runtime deve fornecer `FLUX_SUPABASE_URL` e `FLUX_SUPABASE_SERVICE_ROLE_KEY`; não cole os valores no repositório, no Dockerfile, no comando ou no chat. Para uma substituição deliberada de estado existente, use a segunda confirmação explícita:

```bash
npm run seed:flux-state -- --confirm-seed --force-replace
```

O comando faz GET prévio por `state_key=fbr-agency-flux`, recusa sobrescrever uma linha existente sem `--force-replace`, faz POST upsert e executa GET de readback. Não exibe estado, URL completa, headers ou secrets. Sucesso exige uma saída JSON com `status` igual a `seeded` (ou `replaced` quando autorizado), `receipt` igual a `readback:200` e contagens coerentes com o snapshot; qualquer outro status é falha operacional

### Gates transversais do Flux

`GET /api/flux/gates` retorna exatamente os quatro Gates persistidos do `FBR Agency Flux`; `POST /api/flux/gates/:id/decision` exige sessão autenticada com papel `gatekeeper` e aceita apenas a decisão no body. A identidade é derivada server-side da sessão; `actor` e `scope` enviados pelo cliente são ignorados. A decisão é conceitual/local, idempotência é fail-closed para Gate já decidido e `externalActionAuthorized` permanece `false`. Aprovar não executa deploy, publicação, DNS, HopLink, gasto, migration ou integração externa

Smoke local reproduzível:

```bash
curl -s http://localhost:3000/api/flux/gates
curl -s -X POST http://localhost:3000/api/flux/gates/AF-GATE-01/decision -H 'content-type: application/json' -d '{"decision":"approved","actor":"Sergio","scope":"local"}'
curl -s http://localhost:3000/api/flux/gates
```

`FLUX_DATA_FILE` permite apontar um arquivo JSON de teste; os testes copiam `data/after-forty-intake.fixture.json` para um caminho temporário. Gravações usam arquivo temporário + rename. O fixture inicial é somente leitura por convenção: não o use como destino de ingestão.

## Produto-alvo e limite

O resultado esperado em `03-arquitetura/resultado-esperado-do-flux.md` é um sistema executor que recebe MD conceitual e entrega banco, backend, frontend, Easypanel e domínio. Ainda não é honesto declarar essa entrega: falta intake de MD, orquestração de agents, banco remoto, Control Tower, auth/RBAC real, RLS, adapter, backup, locking, observabilidade, Easypanel, DNS, domínio público, integrações e smoke/readback externo.

O contrato remoto documentado em `03-arquitetura/runtime-control-tower.md` tem blocker real: Control Tower 404 e gateway Supabase 401 na última validação registrada, sem credencial disponível. Não há secrets neste repositório.

Consulte `ACCEPTANCE-MATRIX.md` e `../08-historico/dashboard-e2e-gap-report.md` para a matriz e o relatório requisito a requisito. Não usar `completed` como sinônimo de build verde.

## Modelo do dashboard

O dashboard mantém quatro escopos separados:

- **Gates do FBR Flux**: exatamente `FLUX-GATE-01` a `FLUX-GATE-04`, com status, decisão, blockers e evidências registradas
- **Projetos acompanhados**: catálogo dos projetos persistidos, sem transformar um projeto em estado geral do Flux
- **Pendências por projeto**: cards agrupados pelo projeto de origem; o novo E2E começa somente com `AF-001` em `ready`
- **Indicadores independentes**: Gates pendentes, cards pendentes, blockers e projetos acompanhados são contados separadamente

Aprovar um Gate do FBR Flux não altera automaticamente cards de projetos. A atividade rotineira de agents e Handoffs é somente observacional/operacional e não cria approvals artificiais. Jobs derivados do filesystem aparecem como `filesystem/Handoff readback`; esse readback é histórico, não tempo real. Registros históricos sem blocker estruturado `status: open` ficam em `review` ou `completed` conforme evidência; menções a pending, review ou Gate não são blockers. `blocked` significa exclusivamente blocker operacional ativo. Um blocker real só pode ser desbloqueado quando houver `owner`, `nextAction`, `resolutionPlan` e `resolutionEvidence`; registros antigos são exibidos como `legacy`/`not_declared` com sua causa, sem solução inventada. A interface mostra no máximo 6 Handoffs em mini cards, mantendo os demais em lista clicável e separando históricos de blockers ativos. A interface atualiza por polling de 5 segundos. O runtime Hermes/dispatcher ainda não fornece stream de eventos ao dashboard, portanto tempo real completo permanece um blocker técnico; o adapter local aceita heartbeats e eventos via `PATCH /api/flux/jobs/:id`. A Íris executa `triage on intake`, `triage on handoff` e `triage on event`; sem worker/heartbeat/cron isso é acionado apenas no recebimento dessas entradas, não monitoramento contínuo. Todo agente deve ler plano/card/Handoff, declarar `gapAssessment`, `proposedResolution`, `collaborationRequest`, `sergioQuestion`, `decisionNeeded`, evidência e próximo check; nunca aguardar silenciosamente. Fora do decisionScope, escalar para Sergio com alternativas e recomendação. Jobs expõem `track`, `parallelGroup`, `dependsOn`, `blocks`, `canStart` e motivo de espera; idle exige atividade/nextCheck explícitos.
