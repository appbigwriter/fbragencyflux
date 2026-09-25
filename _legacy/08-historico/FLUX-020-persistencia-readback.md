# FLUX-020 — Persistência relacional e readback

## Status
review

## Escopo validado
- Story validada contra `02-prd/FLUX-020-persistencia-readback.md`.
- Auditoria local de migrations SQL, adapter relacional, repositórios, tipos, rotas de Dashboard/Jobs/Handoffs e testes.
- Sem rotação de secrets, sem aplicação de migration remota, sem deploy.

## Critérios de aceite
| Critério do PRD | Status | Evidência |
|---|---:|---|
| Migrations e tabelas esperadas estão mapeadas | atendido localmente / remoto pendente | `04-database/003_flux_relational_persistence.sql`, `04-database/004_flux_relational_rpcs.sql`, `04-database/004_flux_runtime_relational.sql`, `src/lib/relational-schema.ts` |
| Fonte de verdade de cada superfície está comprovada no código | atendido com ressalvas | Dashboard/Jobs/Handoffs UI leem `getScopedSnapshot`; APIs Jobs/Handoffs leem `getJobs/getState` sem escopo explícito de request |
| HTTP 401, ausência de schema e fallback local estão separados | atendido documentalmente | Seções “Diagnóstico de bloqueios” e “Roteiro de readback autorizado” abaixo |
| Roteiro de readback pós-credencial está exato e reproduzível | atendido como roteiro; não executado remotamente | Ambiente local sem `FLUX_DATABASE_URL`, `SUPABASE_URL` ou service role; nenhum readback remoto declarado |

## Matriz de evidências local/remota

| Item | Local | Remoto | Evidência / Observação |
|---|---|---|---|
| Migração base relacional | mapeada | não verificada | `003_flux_relational_persistence.sql` cria tabelas `flux_projects`, `flux_cards`, `flux_jobs`, `flux_handoffs`, `flux_events`, `flux_artifacts`, `flux_tenants`, `flux_receipts`, etc.; inclui RLS em várias tabelas, mas comentários indicam lacunas corrigidas pela 004. |
| Migração 004 RPC completa | testada em PGlite | não aplicada/verificada | `004_flux_relational_rpcs.sql` adiciona colunas do contrato, `flux_runtime_revision`, índices, policies, `flux_relational_read()` e `flux_relational_commit(...)`. |
| Arquivo 004 runtime alternativo | testado em PGlite por teste legado | não verificado | `004_flux_runtime_relational.sql` existe e é usado por `tests/relational-persistence.test.ts`; atenção: contém `FORCE ROW LEVEL SECURITY` no final, enquanto `004_flux_relational_rpcs.sql` remove FORCE para não bloquear RPC SECURITY DEFINER. Fonte recomendada para remoto deve ser `004_flux_relational_rpcs.sql`, não o runtime alternativo, salvo decisão técnica explícita. |
| Contrato domínio → SQL | testado | não verificado | `src/lib/relational-schema.ts` lista specs explícitas; `encodeChanges` falha em campo não mapeado com `RELATIONAL_UNMAPPED_FIELD`. |
| Adapter Postgres direto | testado quando Docker disponível; no run atual tests passaram, com skips internos possíveis | não verificado | `postgresTransport` usa `FLUX_DATABASE_URL`; `tests/backend-relacional.test.ts` cobre `FLUX_DATABASE_URL`, CAS e colunas quando Docker está disponível. |
| Adapter Supabase/PostgREST RPC | testado por contrato local, sem rede real | não verificado | `SupabaseRestTransport` chama `/rest/v1/rpc/flux_relational_read` e `/rest/v1/rpc/flux_relational_commit`; ambiente local não possui `FLUX_SUPABASE_URL`/service role. |
| Fallback JSON local | permitido só local/teste | não é prova remota | `configuredRepository()` só usa JSON com `file` explícito, `FLUX_PERSISTENCE=json`, `NODE_ENV=test`, ou `FLUX_LOCAL_MODE=1`; em produção sem relacional falha com `PERSISTENCE_NOT_CONFIGURED`. |
| Dashboard UI | leitura escopada | depende de runtime autorizado | `src/app/page.tsx` exige `FLUX_PUBLIC_READ_SCOPE` e chama `getScopedSnapshot({ visibility: 'public' })`; sem escopo público mostra indisponível. |
| Jobs UI | leitura escopada | depende de runtime autorizado | `src/app/jobs/page.tsx` exige `FLUX_PUBLIC_READ_SCOPE` e lê `jobs` de `getScopedSnapshot`. |
| Handoffs UI | leitura escopada | depende de runtime autorizado | `src/app/handoffs/page.tsx` exige `FLUX_PUBLIC_READ_SCOPE` e lê `handoffs` de `getScopedSnapshot`. |
| API `/api/flux/snapshot` | leitura escopada por request | depende de runtime autorizado | `src/app/api/flux/snapshot/route.ts` usa `readScopeFromRequest`; escopo privado exige sessão. |
| API `/api/flux/jobs` | lê repositório, mas resposta rotula origem como filesystem/histórico | depende de runtime autorizado | `src/app/api/flux/jobs/route.ts` usa `getJobs(undefined, ...)`; a propriedade `source: 'filesystem/Handoff readback'` é limitante/possivelmente enganosa porque o repositório pode ser relacional. |
| API `/api/flux/handoffs` | lê repositório sem escopo de request | depende de runtime autorizado | `src/app/api/flux/handoffs/route.ts` usa `getState()` e retorna todos os handoffs carregados pelo repositório; não aplica `readScopeFromRequest`. |
| Script smoke Supabase | obsoleto para arquitetura atual | não usar como prova FLUX-020 | `scripts/supabase-persistence-smoke.mjs` ainda consulta `/rest/v1/flux_state`, enquanto runtime atual usa RPCs relacionais `flux_relational_read/commit`. |

## Fonte de verdade por superfície

### Dashboard
FATO: `src/app/page.tsx` não usa fixture nem `JsonStore` diretamente. A superfície pública exige `FLUX_PUBLIC_READ_SCOPE` e chama `getScopedSnapshot`, que chama `getAggregatedSnapshot`, que chama `load`, que chama `configuredRepository`.

Interpretação: em runtime autorizado com `FLUX_DATABASE_URL` ou `FLUX_SUPABASE_URL` + service role, a fonte de verdade é relacional. Em dev/test/local, pode cair no JSON apenas sob condições explícitas (`file`, `NODE_ENV=test`, `FLUX_LOCAL_MODE=1` ou `FLUX_PERSISTENCE=json`).

### Jobs
FATO: `src/app/jobs/page.tsx` usa `getScopedSnapshot` e recebe `snapshot.jobs`. FATO: `src/app/api/flux/jobs/route.ts` usa `getJobs(undefined, ...)`, que também passa por `load/configuredRepository`, mas a resposta fixa `realtime: false`, `source: 'filesystem/Handoff readback'` e a limitação de dispatcher.

Risco: a API de Jobs não aplica `readScopeFromRequest` e o label de source pode esconder que a leitura veio do repositório relacional. Isso não bloqueia o readback relacional, mas deve ser corrigido antes de afirmar segregação operacional completa por tenant nessa API.

### Handoffs
FATO: `src/app/handoffs/page.tsx` usa `getScopedSnapshot` e recebe `snapshot.handoffs`. FATO: `src/app/api/flux/handoffs/route.ts` usa `getState()` direto, sem escopo de request.

Risco: a UI pública está escopada; a API GET de Handoffs não está escopada por request e depende de autenticação/configuração da rota/runtime para não expor leitura ampla. Recomendo alinhar com `readScopeFromRequest` antes de declarar superfície multi-tenant pronta.

## Diagnóstico de bloqueios: 401 vs schema ausente vs fallback local

| Caso | Sintoma esperado | Causa provável | O que prova | O que NÃO prova | Ação segura |
|---|---|---|---|---|---|
| HTTP 401 | POST `/rest/v1/rpc/flux_relational_read` retorna 401 | service role ausente, incorreta, de outro projeto, anon key, token Control Tower/Easypanel no lugar da service role | autenticação upstream falhou | não prova schema ausente nem problema no código local | validar secret refs no runtime; não imprimir nem rotacionar secret nesta story |
| Schema/RPC ausente | HTTP 404, mensagem de função ausente, `PGRST202`, `Could not find the function`, ou erro SQL `function flux_relational_read does not exist` | migration 004 não aplicada no projeto remoto ou RPC não exposta no schema `public` | runtime alcança PostgREST, mas contrato DB não existe | não prova credencial errada se a resposta não for 401 | aplicar migration apenas após Gate; depois repetir readback |
| Tabela/coluna ausente | HTTP 503 pelo app com detalhe sanitizado, ou erro RPC contendo relation/column missing | 003/004 incompletas, arquivo errado aplicado, drift de schema | contrato SQL divergente do código | não prova fallback local | auditar migrations aplicadas e corrigir com migration aditiva aprovada |
| Fallback local | App lê `data/flux-state.json` quando `NODE_ENV=test`, `FLUX_LOCAL_MODE=1`, `FLUX_PERSISTENCE=json` ou `file` explícito | modo local/teste configurado | comportamento local da UI/testes | não prova operação externa, Supabase, RLS ou RPC | remover flags locais no runtime autorizado; exigir relacional |
| Runtime sem configuração | `PERSISTENCE_NOT_CONFIGURED` / HTTP 503 do app | ausência de `FLUX_DATABASE_URL` e de `FLUX_SUPABASE_URL`/`SUPABASE_URL` + service role | fail-closed sem fallback silencioso em produção | não prova schema ausente nem 401 | injetar secret refs corretos no runtime |

## Roteiro exato de readback após runtime autorizado

Pré-condições obrigatórias:
1. Gate humano aprovado para aplicar/verificar migrations remotas, se ainda não aplicadas.
2. Runtime com secrets por referência, sem imprimir valores: `FLUX_SUPABASE_URL` e `FLUX_SUPABASE_SERVICE_ROLE_KEY` ou `FLUX_DATABASE_URL`.
3. `FLUX_PUBLIC_READ_SCOPE` definido como allowlist explícita (`tenantId/projectId` ou `tenantId/*`).
4. Sem `FLUX_LOCAL_MODE=1`, sem `FLUX_PERSISTENCE=json`, sem `FLUX_DATA_FILE` em produção.

### A. Readback não-mutante via Supabase/PostgREST RPC

```bash
cd 'F:/Projetos/_FBR/FBR Agency Flux/09-codigo'
node - <<'NODE'
const required = ['FLUX_SUPABASE_URL','FLUX_SUPABASE_SERVICE_ROLE_KEY']
for (const key of required) if (!process.env[key]) throw new Error(`${key}=UNSET`)
const origin = new URL(process.env.FLUX_SUPABASE_URL).origin
const key = process.env.FLUX_SUPABASE_SERVICE_ROLE_KEY
const response = await fetch(`${origin}/rest/v1/rpc/flux_relational_read`, {
  method: 'POST',
  headers: { apikey: key, authorization: `Bearer ${key}`, 'content-type': 'application/json' },
  body: '{}',
  cache: 'no-store',
})
const text = await response.text()
console.log(JSON.stringify({ status: response.status, ok: response.ok }, null, 2))
if (!response.ok) process.exit(1)
const data = JSON.parse(text)
const expected = ['flux_tenants','flux_projects','flux_cards','flux_jobs','flux_handoffs','flux_events','flux_receipts']
for (const table of expected) if (!Array.isArray(data[table])) throw new Error(`missing array ${table}`)
console.log(JSON.stringify({ version: data.version, counts: Object.fromEntries(expected.map((t) => [t, data[t].length])) }, null, 2))
NODE
```

Interpretação:
- `status: 200` + arrays esperadas = RPC legível; ainda não prova escrita.
- `status: 401` = autenticação/secret errado; não aplicar migration como resposta a 401.
- `status: 404`/`PGRST202` = RPC/schema ausente; requer migration aprovada.

### B. Readback do app sem fallback local

```bash
cd 'F:/Projetos/_FBR/FBR Agency Flux/09-codigo'
unset FLUX_LOCAL_MODE FLUX_DATA_FILE
export FLUX_PERSISTENCE=supabase
npm run typecheck
npm run lint
npm run build
```

Depois iniciar runtime autorizado e ler:

```bash
curl -fsS 'https://<runtime-host>/api/flux/snapshot?scope=public&tenantId=<tenantId>' | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const j=JSON.parse(s); console.log({projects:j.projects?.length,cards:j.cards?.length,jobs:j.jobs?.length,handoffs:j.handoffs?.length,currentCounts:j.currentCounts})})"
```

Aceite do readback do app:
- resposta HTTP 200;
- `projects/cards/jobs/handoffs` refletem as mesmas entidades do RPC;
- não há `PERSISTENCE_NOT_CONFIGURED`;
- logs não mostram leitura de `data/flux-state.json`;
- `FLUX_PUBLIC_READ_SCOPE` restringe o tenant/projeto esperado.

### C. Readback mutante mínimo somente após autorização explícita

Não executar nesta story. Quando autorizado, criar uma ação idempotente de baixo risco (ex.: Handoff operacional de teste em card dedicado), confirmar `flux_runtime_revision.version` incrementado em +1 e ler a entidade persistida via RPC e via app. Sem esse passo, a escrita remota permanece pendente.

## Checks locais executados

| Comando | Resultado |
|---|---|
| `git status --short` na raiz | Apenas PRDs novos/untracked já existentes: `02-prd/FLUX-020...`, `FLUX-021...`, `TASKLIST...`; relatório criado depois desta leitura. |
| `npm run test -- tests/relational-persistence.test.ts tests/relational-rpcs-004.test.ts tests/backend-relacional.test.ts tests/dashboard.test.ts tests/jobs-ui.test.ts tests/handoffs-operational.test.ts` | PASS — 6 arquivos, 22 testes, 12.71s. |
| `npm run lint` | PASS com 1 warning existente em `src/app/layout.tsx` por uso de `<a>` para `/`. |
| `npm run typecheck` | FAIL — `tests/external-adapters.test.ts` importa `SupabaseFluxRepository`, que não existe mais em `src/lib/persistence`; export atual é `SupabaseRestTransport`/`RelationalFluxRepository`. |
| ambiente (`FLUX_*`/`SUPABASE_*`) | Todos unset localmente: sem credencial/runtime para readback remoto. |

## Achados principais

### Fatos
- A persistência operacional foi migrada para contrato relacional: `RelationalFluxRepository`, `SqlRelationalTransport`, `SupabaseRestTransport`, `relationalSpecs` e RPCs `flux_relational_read/commit`.
- `configuredRepository()` falha fechado em runtime não-local sem configuração relacional; não há fallback JSON silencioso em produção normal.
- Dashboard/Jobs/Handoffs UI usam `getScopedSnapshot` e podem ler a fonte relacional quando runtime está configurado.
- O readback remoto não foi executado porque não há `FLUX_DATABASE_URL`, `SUPABASE_URL` ou service role no ambiente local.
- O script `scripts/supabase-persistence-smoke.mjs` está desalinhado com o desenho atual: consulta `flux_state`, não as RPCs relacionais.

### Riscos / lacunas
- `tests/external-adapters.test.ts` está obsoleto e quebra o typecheck por import removido (`SupabaseFluxRepository`).
- `src/app/api/flux/jobs/route.ts` e `src/app/api/flux/handoffs/route.ts` não usam `readScopeFromRequest`; as páginas UI são escopadas, mas essas APIs GET ainda merecem correção antes de declarar isolamento multi-tenant completo.
- Existem dois arquivos 004: `004_flux_relational_rpcs.sql` e `004_flux_runtime_relational.sql`. O primeiro é mais completo e documenta não usar FORCE RLS; o segundo força RLS. Isso deve ser resolvido por decisão técnica antes de migration remota.
- Sem readback remoto autorizado, Supabase/Postgres externo permanece pendente. Fakes/PGlite/JsonStore só provam contrato local.

## Handoff

```yaml
de: "Subagente Flux A / FLUX-020"
para: "Íris/Kora/Gabe/Théo"
card: "FLUX-020"
objetivo do job: "Auditar persistência relacional e preparar readback remoto do FBR Agency Flux sem mutação externa não autorizada"
entregável: "F:/Projetos/_FBR/FBR Agency Flux/08-historico/FLUX-020-persistencia-readback.md"
decisões/suposições:
  - "FATO: nenhum secret foi lido, impresso, rotacionado ou alterado."
  - "FATO: nenhuma migration remota foi aplicada e nenhum deploy foi executado."
  - "FATO: testes relacionais locais passaram; typecheck falha por teste obsoleto de adapter Supabase antigo."
  - "HIPÓTESE: o remoto provavelmente exige 004_flux_relational_rpcs.sql para expor as RPCs atuais; precisa de confirmação por readback autorizado."
pendências/blockers:
  - "BLOCKER alta: runtime remoto sem credencial autorizada neste ambiente; owner Théo/Sergio; dependência secret refs e Gate para leitura/aplicação de migration."
  - "BLOCKER média: alinhar/remover teste `tests/external-adapters.test.ts` que ainda referencia `SupabaseFluxRepository`; owner Théo."
  - "RISCO média: APIs GET de Jobs/Handoffs sem read-scope explícito; owner Théo/Gabe para correção antes de afirmar multi-tenant completo."
  - "RISCO média: duplicidade/divergência entre migrations 004; owner Théo para escolher fonte única antes de remoto."
gate: "revisão; publicação/mutação remota bloqueada até aprovação explícita de Sergio"
critérios de aceite/evidência:
  - "Migrations mapeadas: 003/004, relational-schema e testes locais citados neste relatório."
  - "Fonte de verdade por superfície documentada com paths de código."
  - "HTTP 401, schema ausente e fallback local separados em matriz de diagnóstico."
  - "Roteiro de readback pós-credencial incluído e não executado sem autorização."
```
