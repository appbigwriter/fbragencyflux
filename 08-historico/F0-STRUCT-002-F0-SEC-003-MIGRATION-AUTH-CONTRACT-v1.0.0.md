# F0-STRUCT-002 + F0-SEC-003 — contrato local v1.0.0

**Status:** entregue para revisão/Gate; somente documentação e contrato local.  
**Escopo:** FBR Agency Flux + integração contratual GestaoDB/Control Tower.  
**Fonte transversal:** `F:/Projetos/_FBR/AuthorityEngine/02-prd/GLOBAL-FLOW-AUTHORITY-BLOGS-FLUX-CONTROL-TOWER.md` (aprovado por Sergio em 2026-09-18).  
**Regra:** nenhum SQL remoto, deploy, segredo ou chamada externa foi executado.

## 1. Classificação de evidência

### FATO
- Flux possui `001_flux_foundation.sql`, `002_flux_state_version_cas.sql`, `003_flux_relational_persistence.sql`, `004_flux_relational_rpcs.sql` e o arquivo concorrente `004_flux_runtime_relational.sql`.
- `001` habilita RLS, mas declara que as policies seriam adicionadas depois; suas tabelas-base não têm tenant obrigatório.
- `003` repete a fundação, introduz `flux_tenants` e dezenas de tabelas tenant-aware, habilita RLS sem policies e converte `flux_events.payload` de jsonb para text.
- `004_flux_relational_rpcs.sql` declara depender de 003 e cria policies tenant-scoped, RPCs e CAS; usa `app.tenant_id` e explicitamente desfaz FORCE RLS.
- `004_flux_runtime_relational.sql` repete grande parte do 004 e aplica `FORCE ROW LEVEL SECURITY`, criando colisão semântica com o 004 canônico.
- `002` altera `public.flux_state`, tabela que é criada no GestaoDB `supabase/migrations/011_flux_external_state.sql`, não em nenhuma migration Flux.
- GestaoDB tem dois arquivos `010_*` e dois `011_*`: `010_complete_schema_provisioning.sql`, `010_service_identity_and_secrets.sql`, `011_flux_external_state.sql`, `011_project_configuration_artifacts.sql`.
- CT-001 usa service-role server-side em `src/app/api/control-tower/projects/[slug]/configuration/route.ts`; a rota POST/GET não deriva actor/scopes de sessão e grava `created_by: 'admin-panel'`.
- Middleware do GestaoDB aceita sessão admin ou qualquer token aceito por `isValidAgentApiKey`; a autorização fina não ocorre na rota CT-001.
- `control_tower_final_schema.sql` define `is_admin()` retornando sempre `true`; `006_control_tower_public_read.sql` permite SELECT autenticado com `using (true)` para `projects` e `templates`.
- Auth helper CT aceita secrets estáticos com `*`, token Flux com scopes amplos (`projects:provision`, `projects:sql:execute`, etc.) e fallback JWT `default-secret-change-me` quando nenhum secret está configurado.
- Flux local deriva actor da sessão server-side; decisões de Gate exigem actor `Sergio` e scope `local`; endpoints removem actor do body e usam a sessão. Leitura exige allowlist explícita tenant/projeto, mas mutações locais ainda recebem tenantId opcional e não há actor/tenant persistido em sessão.
- O global flow exige: Central de Aprovações, Sergio nos Gates iniciais/publicação, snapshot versionado, readback antes de transição, secrets apenas por referência e nenhuma migration remota sem Gate.

### DECISÃO
- Não existe ordem canônica segura baseada somente no nome atual dos arquivos.
- `004_flux_relational_rpcs.sql` é o único 004 candidato à sequência canônica; `004_flux_runtime_relational.sql` fica **LEGACY/QUARANTINED**, não executar.
- A sequência lógica proposta abaixo usa IDs de domínio, não renomeia nem aplica migrations existentes.
- CT-001 é operação administrativa/configuração, não aprovação de publicação; deve exigir principal derivado da sessão e scope específico.

### RECOMENDAÇÃO
- Migrar futuramente para nomes únicos com prefixo de domínio (`CT-010A`, `CT-010B`, `CT-011A`, `CT-011B`, `FLUX-001`...) ou mecanismo de migration IDs explícitos. Não renomear arquivos já aplicados sem tabela de compatibilidade/readback.
- Corrigir `is_admin()` e remover fallback de segredo antes de qualquer exposição remota.
- Substituir policies genéricas por policies tenant/organização e RPCs allowlisted; nunca conceder `projects:sql:execute` ao caminho CT-001.

### BLOQUEIO
- Não é possível provar estado remoto, migration já aplicada, owner efetivo de functions/RLS, existência de `app.tenant_id` no runtime, nem POST/GET real de CT-001 sem acesso autorizado ao Supabase. Isso permanece bloqueado por Gate/credenciais/runtime externo.

## 2. Sequência canônica e pré-condições

### 2.1 Control Tower público

| Ordem lógica | ID canônico proposto | Arquivo atual | Pré-requisito | Resultado |
|---|---|---|---|---|
| CT-000 | CT-BASE | `control_tower_final_schema.sql` | banco Supabase + pgcrypto | organizations, templates, projects, jobs, audit e functions-base |
| CT-006 | CT-RLS-READ | `006_control_tower_public_read.sql` | CT-BASE | somente leitura autenticada (estado atual é permissivo; revisar antes de produção) |
| CT-007 | CT-CORE-RECONCILE | `007_control_tower_reconcile_core_columns.sql` | CT-BASE | reconcilia FKs/colunas |
| CT-008 | CT-STATS | `008_control_tower_stats_rpc.sql` | CT-BASE | RPC de métricas |
| CT-009 | CT-SQL-EXEC | `009_control_tower_project_sql_exec.sql` | CT-BASE | function SECURITY DEFINER; **risco alto, não liberar por padrão** |
| CT-010A | CT-PROVISION | `010_complete_schema_provisioning.sql` | CT-BASE + `update_updated_at_column()` | provisionamento de schemas |
| CT-010B | CT-IDENTITY-SECRETS | `010_service_identity_and_secrets.sql` | CT-BASE + CT-010A | identities, namespaces, bindings |
| CT-011A | CT-FLUX-STATE | `011_flux_external_state.sql` | CT-BASE | `flux_state`; necessário para FLUX-002 |
| CT-011B | CT-CONFIG-ARTIFACTS | `011_project_configuration_artifacts.sql` | CT-BASE + `update_updated_at_column()` | artefatos CT-001 |

Os dois 010 e os dois 011 são **IDs distintos**. A ordem entre CT-011A e CT-011B é independente, mas CT-011B exige a tabela `projects` e a function de timestamp. CT-010B exige `projects` e a function de timestamp. O runner deve falhar se detectar basename duplicado.

### 2.2 Flux dedicado

**Instalação nova recomendada:**

`CT-BASE → CT-010A → CT-010B → CT-011A → FLUX-001 → FLUX-003 → FLUX-004-RPC → FLUX-RLS-RBAC (a criar/aprovar)`

- `FLUX-001` é a fundação legada/referência de tabelas. Em instalação nova, `FLUX-003` é o schema relacional que inclui tenant e amplia a fundação; não executar `001` e `003` como se fossem migrations independentes sem diff/compatibilidade.
- `FLUX-002` só pode entrar depois de CT-011A e somente se `flux_state` ainda for fonte compatível. Ele altera `public.flux_state`, não o schema dedicado Flux.
- `FLUX-004-RPC` = `004_flux_relational_rpcs.sql`, após FLUX-003. Ele é a migration canônica de RPC/RLS atual, mas precisa de revisão de segurança das policies e de `SECURITY DEFINER`.
- `004_flux_runtime_relational.sql` não entra: duplica objetos, aplica FORCE RLS e não possui a mesma lista/semântica de policies do 004-RPC.

**Upgrade de instalação que já tem FLUX-001:** snapshot + inspeção de schema → FLUX-003 apenas com plano de compatibilidade para `payload` jsonb→text e backfill de tenant → FLUX-004-RPC → readback. Não executar 003 cegamente.

## 3. Rollback, backup e readback (plano, não execução)

1. Gate de Sergio registra escopo, owner, janela, checksum dos arquivos e reversibilidade.
2. Antes do SQL remoto: snapshot/backup autorizado; exportar catálogo (`pg_class`, `pg_attribute`, `pg_constraint`, `pg_policy`, `pg_proc`) e registrar checksum do backup. Se não houver backup/readback, estado `blocked`.
3. Aplicar uma unidade lógica por vez em transação quando possível; registrar migration ID e receipt. Nunca fazer `DROP SCHEMA ... CASCADE` como rollback padrão.
4. DDL aditivo: rollback é `REVERT` específico por objeto somente após confirmar que não há dependentes; dados não são apagados automaticamente. Para policies/functions, restaurar definição anterior por script versionado.
5. `payload jsonb→text`: rollback exige backup e conversão comprovada; não é rollback seguro por `ALTER TYPE` sem validação. Tratar como migration de risco alto.
6. Readback mínimo após cada unidade: `to_regclass`, `information_schema.columns`, constraints/FKs, `pg_policies`, `pg_proc`, contagem/identificador de rows, owner/security_definer, RLS/forcerls. Depois: duas leituras consistentes, restart/redeploy autorizado e readback da API.
7. CT-001: POST idempotente por `(project_id, artifact_type)`, GET posterior, confirmar payload sem secrets, `updated_at`, audit/actor e tenant/org. Sem readback remoto, não marcar CT-001 publicado.
8. Em falha: parar sequência, preservar último readback confirmado, criar blocker com erro sanitizado, nextAction e nextCheck; não cair para JSON local como fonte de verdade.

## 4. Contrato de tenant, RLS, RBAC e actor

### 4.1 Tenant e escopo

- Tenant canônico é `flux_tenants.id` no Flux. Toda entidade operacional Flux deve possuir tenant direto ou herdar tenant por FK parent; tenantless só para legado explicitamente marcado e nunca em leitura pública.
- Control Tower atual usa `organizations.id` em `projects`; CT-001 deve derivar `organization_id`/tenant de `projects`, não aceitar tenant no body. A futura ponte Flux↔CT deve carregar IDs e versões, não permitir leitura de tabela interna alheia.
- Contexto de DB obrigatório: transaction-local `set_config('app.tenant_id', '<uuid>', true)` por adapter autorizado. Sem contexto: zero linhas e writes negados.
- Project scope é allowlist: `tenant/project` exato ou `tenant/*` somente para principal com scope concedido. Nunca aceitar `*/*`.

### 4.2 Principals e scopes

| Principal | Pode | Não pode |
|---|---|---|
| Sergio/admin humano | ler tenant autorizado; aprovar/reprovar/devolver Gates; liberar publicação somente com pacote versionado | aprovar pacote desatualizado; ignorar blocker/readback |
| Flux coordinator | criar/atualizar jobs, eventos, handoffs, blockers, readbacks no tenant atribuído; solicitar aprovação | decidir Gate humano; executar SQL arbitrário; publicar |
| Flux operator/agent | executar trabalho atribuído e anexar evidência no scope | cruzar tenant; decidir aprovação; expor secrets |
| Control Tower service | provisionar/reconciliar projeto e artefatos allowlisted por evento assinado e idempotente | ler/mutar outros tenants; SQL arbitrário; emitir aprovação |
| Auditor/read-only | SELECT somente em tenant/project explicitamente permitido | qualquer INSERT/UPDATE/DELETE ou download de secret |

Scopes mínimos sugeridos: `flux:read`, `flux:write`, `flux:approvals:request`, `flux:approvals:decide` (somente Sergio), `flux:readbacks:write`, `ct:projects:read`, `ct:configuration:write`, `ct:secrets:references:write`, `ct:sql:execute` (separado, Gate explícito; não CT-001).

### 4.3 Actor derivado de sessão

- O actor efetivo vem da sessão/JWT validada no servidor (`sub`, issuer, audience, status, expiry, scopes, tenant/org bindings). Body/query não pode sobrescrevê-lo.
- Toda mutação grava `actor_id`, `actor_type`, `tenant_id`, `scope`, `correlation_id`, `causation_id`; `created_by: 'admin-panel'` sozinho não é evidência de autoria.
- Flux Gate: somente sessão de Sergio + role `gatekeeper` + scope tenant/project + pacote/snapshot ainda vigente; decisão gera approval event e readback.
- CT-001: sessão admin ou service principal com `ct:configuration:write`, projeto dentro da organização autorizada, tipo allowlisted; GET exige `ct:projects:read`. A rota deve negar token agent genérico sem esse scope.
- Service role permanece server-side; nunca frontend/download/evento/log. JWT não pode usar secret default; secrets ausentes devem falhar closed.

## 5. Matriz de autorização e testes negativos

| Caso negativo | Resultado esperado |
|---|---|
| Flux sem sessão | 401 |
| body diz `actor=Sergio`, sessão é Íris | decisão usa Íris e retorna 403 |
| Íris tenta decidir Gate | 403 / `SERGIO_REQUIRED` |
| sessão local tenta ação publicada/externa | 403 ou `GATE_REQUIRED`; nenhum efeito externo |
| tenant A lendo/escrevendo tenant B | zero rows/403; nenhuma mutação |
| ausência de `app.tenant_id` | zero rows e write negado |
| escopo vazio, `*/*`, duplicado ou wildcard cross-tenant | 400/403 |
| pacote aprovado com versão alterada | 409/403; approval superseded |
| CT-001 sem scope de configuração | 403 |
| CT-001 slug de projeto inexistente/outro org | 404/403 sem vazamento |
| CT-001 type inválido ou domínio ausente | 400; sem upsert |
| GET CT-001 com token somente Flux read | 403 |
| token revogado/suspenso/expirado | 401 |
| secret ausente e JWT sem secret | 503/401; nunca `default-secret-change-me` |
| `ct:sql:execute` fora de Gate | 403; nenhuma execução |
| artefato público contendo service role/API secret | teste falha; geração abortada |
| evento duplicado | idempotente; não cria segundo artefato/projeto |

Os testes devem usar fixture local/mocks; não podem chamar Supabase, Easypanel, DNS, Hermes ou rede.

## 6. Reconciliação com o global flow

- **FATO/DECISÃO alinhados:** Authority Engine continua fonte da Persona; Flux orquestra Central/Gates/jobs/readbacks; Control Tower provisiona catálogo/configuração; publicação exige aprovação integral; secrets são referências.
- **Gap de contrato:** global flow ainda deixa nomes finais de migrations, API/eventos, assinatura, ownership das tabelas e RLS final em validação. Este artefato fecha a ordem local proposta, mas não substitui aprovação de schema/API.
- **Gap local crítico:** CT-001 está localmente implementado/testado, porém sua autorização atual é middleware amplo + service-role; falta enforcement de scope/tenant/actor na rota e migration 011B ainda não tem RLS visível.
- **Gap Flux crítico:** 004-RPC cria `FOR ALL` por tenant, mas não separa RBAC/scopes; as RPCs SECURITY DEFINER e o read agregado precisam de allowlist/tenant enforcement antes de remote Gate.

## 7. Blockers e próximo Gate

1. **BLOQUEADOR REMOTO:** migration IDs aplicados, schema/policies/owners e readback Supabase não são verificáveis localmente.
2. **BLOQUEADOR DE SEGURANÇA:** CT `is_admin() = true`, policies `using(true)`, fallback JWT default e scope `*`/SQL amplo exigem correção e revisão antes de produção.
3. **BLOQUEADOR DE MIGRATION:** dois basenames 010 e dois 011, mais dois 004 Flux, exigem migration registry/IDs únicos antes de aplicar.
4. **BLOQUEADOR DE DADOS:** upgrade 001→003 envolve conversão jsonb→text e tenant backfill; sem backup não há rollback honesto.
5. **Próximo Gate:** Sergio aprovar este contrato e o plano; depois owner remoto executar cada unidade autorizada e anexar readback sanitizado. Nenhuma aplicação foi feita nesta entrega.

## Evidência local

- Global flow: `F:/Projetos/_FBR/AuthorityEngine/02-prd/GLOBAL-FLOW-AUTHORITY-BLOGS-FLUX-CONTROL-TOWER.md`, seções 4–18.
- Flux MP-000: `F:/Projetos/_FBR/FBR Agency Flux/01-conceitual/MP-000-foundation.md`.
- SQL Flux: `F:/Projetos/_FBR/FBR Agency Flux/04-database/001_flux_foundation.sql`, `002_flux_state_version_cas.sql`, `003_flux_relational_persistence.sql`, `004_flux_relational_rpcs.sql`, `004_flux_runtime_relational.sql`.
- SQL CT: `F:/Projetos/_FBR/GestaoDB/supabase/migrations/control_tower_final_schema.sql`, `006_control_tower_public_read.sql`, `007_control_tower_reconcile_core_columns.sql`, `008_control_tower_stats_rpc.sql`, `009_control_tower_project_sql_exec.sql`, ambos 010 e ambos 011.
- CT-001: `F:/Projetos/_FBR/GestaoDB/docs/control-tower/CT-001-project-configuration-artifacts.md` e rota `src/app/api/control-tower/projects/[slug]/configuration/route.ts`.
- Auth: `F:/Projetos/_FBR/GestaoDB/src/lib/auth/control-tower.ts`, `src/middleware.ts`; Flux `09-codigo/src/lib/auth.ts`, `src/lib/read-scope.ts`.
