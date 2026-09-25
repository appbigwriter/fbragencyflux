# QA independente — reunião 2026-09-17

**Projeto:** FBR Agency Flux v1.5  
**Data/hora do QA:** 2026-09-17 08:41:52 -03:00  
**Repositório:** `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`  
**Escopo:** Dashboard → After Forty → Sprint/Story → Job → Handoff/blocker → receipt/readback  
**Ambiente:** local, sem deploy, sem migration, sem efeito externo.

## Decisão

**NÃO PRONTO para declarar a demonstração pública/reunião como totalmente reproduzível.**

O fluxo vertical local foi reproduzido com sucesso em estado JSON isolado, incluindo Sprint, Story, Job, Handoff, encaminhamento de blocker, transição de card e readback de receipts. Porém, o Dashboard inicial não refletiu o mesmo estado que as APIs/páginas operacionais: abriu com todos os contadores em zero enquanto o endpoint de snapshot e as páginas `/sprints`, `/jobs` e `/handoffs` mostraram dados. Como a reunião começa pelo Dashboard, essa divergência é bloqueadora para prontidão pública. A persistência externa/Supabase e o runtime público também não foram validados.

## Fatos verificados

### Gates locais

| Gate | Resultado | Evidência |
|---|---|---|
| Testes completos | **PASS** — 23 arquivos, 120 testes | `npm test` |
| Testes focados v1.5/vertical | **PASS** — 6 arquivos, 27 testes | `npx vitest run tests/v15-planning.test.ts tests/dashboard.test.ts tests/jobs-ui.test.ts tests/handoff-ui.test.ts tests/blocker-forward.test.ts tests/remaining-local-qa.test.ts` |
| Typecheck | **PASS** | `npm run typecheck` |
| Lint | **PASS** | `npm run lint` |
| Build | **PASS** — Next 16.3.4 compilou e gerou as rotas | `npm run build` |
| Smoke com `--runInBand` | **NÃO APLICÁVEL** — Vitest 5 rejeita essa opção (`Unknown option --runInBand`) | Comando corrigido e `npm test` executado com sucesso |

O Vitest emitiu aviso de configuração ESM/CommonJS (`vitest.config.ts`); não impediu os testes.

### Smoke local reproduzido

Foi usado o servidor Next de desenvolvimento já pertencente ao repositório, confirmado pelo lock do Next: **porta 3016, PID 28512, diretório `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`**. A tentativa de iniciar 3017 não foi usada: o Next informou que já havia servidor de desenvolvimento ativo em 3016. Não matei processo desconhecido.

O estado foi isolado em `C:/Users/OEM/AppData/Local/Temp/fbr-flux-qa-state.json`, derivado de `data/after-forty-intake.fixture.json`, com `FLUX_PERSISTENCE=json` e escopo público de QA. Nenhum arquivo de estado do repositório foi usado como destino.

Sequência executada:

1. `GET /` — HTTP 200; reproduziu o Dashboard.
2. Login local com o actor configurado no runtime — HTTP 200; actor autenticado como `Sergio`, escopo `local`. O segredo não foi exposto no relatório.
3. `POST /api/flux/planning` type `sprint` — HTTP 201; Sprint criado.
4. `POST /api/flux/planning` type `story` — HTTP 201; Story criada e ligada ao Sprint/AF-001.
5. `POST /api/flux/jobs` — HTTP 201; Job `qa-job-vertical-20260917` criado com correlation ID.
6. `POST /api/flux/handoffs` — HTTP 201; Handoff QA criado.
7. `POST /api/flux/blockers/blocker-afterforty-product-scope/forward` — HTTP 200; Handoff de encaminhamento criado, blocker permaneceu aberto.
8. `POST /api/flux/cards/AF-001` para `in_progress` — HTTP 200; transição local aceita.
9. Readback `GET /api/flux/snapshot?scope=public&tenantId=public-tenant&projectId=after-forty` — HTTP 200, confirmando:
   - `sprints: 1`
   - `stories: 1`
   - Job QA presente: `1`
   - Handoff QA presente: `1`
   - blocker com `status: open` e `resolution: forwarded`
   - receipts observados: `job.upsert`, `handoff.create`, `blocker.forward`, `card.transition`
   - card `AF-001` em `in_progress`

### Readback visual

- `/sprints`: mostrou 1 Sprint e 1 Story, com owner, `nextCheck` e critérios de aceite.
- `/jobs`: mostrou 5 jobs, incluindo o Job QA em HOLD/aguardando owner; nenhum stale.
- `/handoffs`: mostrou 4 Handoffs ativos, incluindo o Handoff QA e o encaminhamento do blocker para Gestor Editorial.
- As páginas exibiram `Não autenticado` e informaram que gestão/encaminhamento exige login; a leitura ficou disponível.

## Falha reproduzida

### QA-01 — Dashboard inicial diverge do estado operacional

**Severidade:** Alta — bloqueia a narrativa da reunião porque o primeiro passo é o Dashboard.  
**Categoria:** Funcional / integração de leitura.

**Reprodução:**

1. Subir o servidor local no cenário de QA JSON.
2. Abrir `http://localhost:3016/`.
3. Consultar os endpoints de leitura e abrir `/sprints`, `/jobs` e `/handoffs`.

**Resultado observado:**

- Dashboard visual: `Gates pendentes 0`, `Cards ativos 0`, `Atenção necessária 0`, `Jobs atuais 0`, `Histórico 0`; sem projetos/cards/handoffs recentes.
- API pública explícita: snapshot HTTP 200 com projeto After Forty e card `AF-001`.
- `/sprints`: 1 Sprint e 1 Story após a mutação.
- `/jobs`: 5 jobs.
- `/handoffs`: 4 Handoffs ativos.

**Causa técnica provável, sustentada pelo código:** `src/app/page.tsx` constrói o Dashboard com `getAggregatedSnapshot(scopes)` sem `allowTenantless`; o escopo wildcard público exclui registros do fixture que não têm `tenantId`. Já a API com par explícito de projeto usa o caminho que permite leitura pública do fixture sem tenant. O contrato local e a tela inicial não estão alinhados.

**Correção necessária antes da reunião:** alinhar o fixture/runtime ao contrato tenant-scoped, ou corrigir explicitamente a política de leitura local do Dashboard; depois repetir o smoke visual e confirmar que os contadores do Dashboard coincidem com snapshot, Jobs e Handoffs.

## Reteste após correção QA-01

Após o QA, `src/app/page.tsx` foi alinhado à API de leitura pública e passou a usar `getScopedSnapshot({ scopes, visibility: 'public' })`, preservando a regra de tenantless somente para escopo explícito não-wildcard.

Foi encerrada a instância Next anterior, iniciada uma instância limpa na porta 3020 com o mesmo estado JSON isolado e feito readback visual. Resultado:

- Dashboard mostrou `After Forty`;
- 1 card ativo;
- 5 Jobs atuais;
- 5 itens de atenção;
- blockers abertos visíveis;
- 1 Handoff aguardando owner;
- 1 ação em HOLD;
- eventos e transição do card visíveis;
- navegação `Handoffs · Jobs · Sprints/Stories` visível.

**QA-01 local: corrigido e retestado com sucesso.**

Limitação: esse reteste não altera o deploy público. O ambiente `https://agency.fbr.news/` ainda precisa receber a versão auditada e passar por readback independente.

1. **Dashboard divergente — owner técnico do código / Kora.** Próxima ação: corrigir o escopo/persistência de leitura inicial e anexar novo readback visual; aceite: Dashboard e APIs exibem os mesmos projetos, cards e contadores.
2. **Persistência externa não validada — Théo/Sergio para Gate.** O primeiro servidor iniciado com a configuração local apontou para o modo de persistência configurado no ambiente e o Dashboard retornou `Agency Flux indisponível`; não houve validação Supabase, RLS, CAS, restart/redeploy ou readback público.
3. **Runtime público não validado — Théo/Sergio.** Este QA prova somente o código/servidor local. Não prova deploy, DNS, Control Tower, Hermes dispatcher, heartbeat real ou versão pública.
4. **Auth de gestão local depende de configuração de runtime.** O smoke conseguiu autenticar usando a configuração já presente no runtime, sem expor o segredo. A interface sem sessão permite leitura, mas bloqueia mutações conforme esperado.

## Não feito por decisão de escopo

- Nenhum commit, push, deploy ou migration externa.
- Nenhuma mutação no Supabase/Control Tower/Easypanel.
- Nenhuma tentativa de resolver blocker: o encaminhamento foi testado e o blocker corretamente permaneceu `open`.
- Nenhuma alegação de tempo real: o estado verificado é local/JSON; jobs fixture continuam planejados, não realtime.

## Critério de liberação para a reunião

Liberar apenas depois de:

1. corrigir e retestar QA-01;
2. repetir o fluxo a partir do Dashboard, com contadores coerentes;
3. apresentar explicitamente que o caminho validado é local e sem efeito externo;
4. separar no roteiro o que é `confirmado local`, `não confirmado remoto` e `bloqueado por integração/persistência`.
