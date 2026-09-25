# Auditoria pós-deploy — Authority / Flux / Control Tower / Blogs

- **Task:** AUDIT-20260918-AUTH-FLUX-CONTROL-BLOGS-001
- **Data:** 2026-09-18
- **Owner:** David
- **Modo:** read-only; nenhum deploy, migration, secret, publicação ou mutação remota executado.
- **Fonte transversal:** `F:\Projetos\_FBR\AuthorityEngine\GLOBAL-FLOW-AUTHORITY-BLOGS-FLUX-CONTROL-TOWER.md`

## Veredito executivo

O deploy público existe em algumas superfícies, mas os quatro projetos ainda não formam uma cadeia E2E comprovada. O próximo E2E deve começar pelo Authority e parar em cada readback não confirmado, sem avançar por narrativa.

## Evidência executada

### Gates locais

- **Authority Engine:** `npm run check` PASS — build TypeScript + 49 testes.
- **FBR Agency Flux:** typecheck PASS; build PASS; lint PASS com 1 warning (`<a>` para `/` em `layout.tsx`); suíte `163/164`, 1 falha `EBUSY` limpando diretório temporário em `tests/iris-worker.test.ts`.
- **GestaoDB / Control Tower:** npm test PASS — 42 testes; typecheck PASS; build PASS.
- **FBR Blogs:** typecheck PASS; 30 testes PASS; build PASS; lint PASS sem warnings.

### Readback público sanitizado

- `https://authority.fbr.news/health` → HTTP 200; `persistence=json-store`; `externalIntegrations=not_configured`; publicação bloqueada sem adapter configurado.
- `https://agency.fbr.news/` → HTTP 200.
- `https://agency.fbr.news/api/flux/snapshot?scope=public` → HTTP 400; `READ_SCOPE_REQUIRED`; exige escopo explícito tenant/project.
- `https://control-tower.fbr.news/api/control-tower/health` → HTTP 200; `status=healthy`; `database=connected`; `version=1.0.0`.
- `https://supabase-control-tower-api.fbr.news/api/control-tower/health` → HTTP 401 sem autorização.
- `https://afterforty.fbr.news/` → DNS não resolve; HTTP 000.

## Inconsistências encontradas

### AUD-01 — Authority público não usa a persistência declarada como provisionada
- **Fato:** `STATUS.md` registra schema `custom_authorityengine` provisionado, mas também registra `PGRST106` e persistência local.
- **Readback:** health público confirma `persistence=json-store`.
- **Impacto:** o Authority público não prova leitura/escrita no schema Supabase nem pode alimentar o Flux por read model remoto.
- **Classificação:** BLOQUEADO para E2E remoto.
- **Owner:** Théo/infra + Sergio para Gate/readback.
- **Correção:** expor/reconciliar o schema no runtime autorizado; executar criação → aprovação → readback autenticado do Authority.
- **Aceite:** health/readback e API demonstram persistência remota da Persona aprovada, com tenant/owner e versão.

### AUD-02 — Flux público responde, mas o escopo público não está operacionalmente configurado
- **Fato:** home pública retorna 200, mas snapshot sem tenant/project retorna `READ_SCOPE_REQUIRED`.
- **Impacto:** a superfície pode carregar sem dados e o E2E não consegue provar estado público sem conhecer/configurar o escopo autorizado.
- **Classificação:** BLOQUEADO para readback público do Dashboard.
- **Owner:** Théo/owner do runtime + Sergio para escopo autorizado.
- **Correção:** configurar `FLUX_PUBLIC_READ_SCOPE` com pares/tenant wildcard válido conforme contrato; repetir snapshot e home.
- **Aceite:** snapshot público retorna somente o escopo autorizado, com projetos/cards/jobs/handoffs coerentes; ausência de escopo continua 400.

### AUD-03 — Suíte do Flux não está totalmente verde
- **Fato:** 163/164; falha `EBUSY` na limpeza do diretório temporário do worker Íris. Typecheck/build/lint passam.
- **Impacto:** orquestração local não pode ser chamada de totalmente verificada.
- **Classificação:** PENDENTE local; não atribuído ao deploy sem reprodução causal.
- **Owner:** David/Flux QA.
- **Correção:** isolar cleanup/concorrência do `iris-worker.test.ts`; executar o teste e a suíte completa novamente.
- **Aceite:** 164/164 sem diretórios temporários vazando e sem mascarar erro de negócio.

### AUD-04 — Control Tower tem alterações de código não commitadas após o deploy informado
- **Fato:** `git status` do GestaoDB mostra modificados `src/lib/control-tower/projects-actions.ts`, `src/lib/control-tower/projects-create.ts` e `tsconfig.tsbuildinfo`.
- **Impacto:** não é possível atribuir o código servido ao commit conhecido apenas pelo estado local; o deploy pode não conter essas correções.
- **Classificação:** NÃO CONFIRMADO.
- **Owner:** owner do Control Tower/Théo.
- **Correção:** identificar commit efetivamente implantado; reconciliar diff; somente depois repetir build/deploy/readback com receipt.
- **Aceite:** commit servido, working tree auditado e endpoints de create/rebuild lidos de volta na mesma versão.

### AUD-05 — Fallback legado do Control Tower pode retornar sucesso sem o readback exigido
- **Fato:** `projects-create.ts` chama `provision_project_v2`; se ausente, faz fallback para `provision_project` e retorna `201`, `project_status=active`, `job_status=success` sem readback estrutural equivalente ao caminho v2.
- **Impacto:** runtime com migration v2 ausente pode declarar sucesso falso, contrariando o contrato de readback antes de `success`.
- **Classificação:** RISCO DE CONTRATO; precisa ser reproduzido em teste/runtime controlado antes de E2E.
- **Owner:** Control Tower.
- **Correção:** fallback deve exigir readback completo ou falhar fechado como migration/contrato ausente; não declarar active/success por inferência.
- **Aceite:** RPC ausente nunca retorna sucesso sem schema/job/audit readback; teste negativo cobre o fallback.

### AUD-06 — Control Tower health 200 não equivale a integração Supabase autorizada
- **Fato:** health público está saudável e conectado; gateway Supabase protegido retorna 401 sem autorização.
- **Impacto:** não há prova de catálogo, namespaces, artifacts, RLS ou readback das entidades do fluxo.
- **Classificação:** NÃO CONFIRMADO/BLOQUEADO para readback remoto autenticado.
- **Owner:** owner Control Tower + Sergio para credencial/Gate.
- **Correção:** usar runtime autorizado e readback metadata-only de project, namespace, binding e artifacts; nunca expor secret.
- **Aceite:** POST/GET ou readback correspondente prova persistência, isolamento e estado externo.

### AUD-07 — FBR Blogs continua sendo slice local, apesar do status “production-readiness-slice”
- **Fato:** STATUS declara explicitamente produção fail-closed; auditoria independente registra SupabaseRepository sem persistência de `blog_persona_bindings`, `editorial_profiles` e `integration_inbox_events`, além de ausência de readback remoto.
- **Impacto:** contrato local não prova Blog derivado da Persona aprovado em produção/staging.
- **Classificação:** CONFIRMADO LOCALMENTE; BLOQUEADO REMOTO.
- **Owner:** FBR Blogs/Théo.
- **Correção:** implementar/reconciliar persistência escolhida, adapter Authority/Flux real, migration e readback; não chamar staging/produção pronta.
- **Aceite:** payload aprovado Authority → endpoint Blogs autenticado → binding/editorial persistidos → GET/readback metadata-only.

### AUD-08 — After Forty não tem domínio público resolvendo
- **Fato:** `afterforty.fbr.news` não resolve DNS.
- **Impacto:** qualquer E2E de domínio/health/publicação do Blog é bloqueado antes da aplicação.
- **Classificação:** BLOQUEADO.
- **Owner:** infra/DNS; Sergio para Gate de publicação.
- **Correção:** provisionar DNS e validar `/<health>`/rota pública somente após projeto e namespace confirmados.
- **Aceite:** DNS, HTTPS, health e versão servida conferidos com timestamp e sem confundir domínio esperado com público.

### AUD-09 — Namespace divergente entre Control Tower e Blogs
- **Fato:** auditoria do Control Tower registra Developer Doc em `fbr/blogs/<id>/`, enquanto configuração usa `fbr/<business_type>/<id>`; Blogs usa helper `fbr/blogs/<projectId>/`.
- **Impacto:** handoff pode instruir runtime a buscar secrets em namespace diferente do artifact/provider.
- **Classificação:** INCONSISTÊNCIA DE CONTRATO.
- **Owner:** Control Tower + Blogs.
- **Correção:** escolher helper canônico por tipo/contrato e atualizar Developer Doc, artifacts, bindings e testes conjuntamente.
- **Aceite:** blog/store/saas/custom geram e leem o mesmo namespace em todos os handoffs e adapters.

### AUD-10 — Evento Authority → Flux → Blogs ainda não tem prova pública
- **Fato:** Authority possui contratos/rotas locais para aprovação e evento aprovado; Flux possui inbox/orquestração local; Blogs possui endpoint autenticado e validações locais.
- **Ausência:** não foi verificado outbox assinado remoto, adapter real Flux → Blogs, token/identity em runtime ou readback de binding.
- **Classificação:** IMPLEMENTADO LOCALMENTE; NÃO CONFIRMADO REMOTO.
- **Aceite futuro:** evento com `event_id`, persona/version/hash/approval IDs → Flux dedupe → job → Blogs valida/aplica → receipt metadata-only → readback em todos os quatro sistemas.

## Matriz atual

| Camada | Local | Público/remoto | Estado correto |
|---|---|---|---|
| Authority health/UI | confirmado | health confirmado | persistência externa não confirmada |
| Authority Persona/outbox | testes locais | não confirmado | bloqueado para E2E remoto |
| Flux UI/build | confirmado | home 200 | snapshot público bloqueado por scope |
| Flux worker/E2E | 163/164 | não confirmado | pendente cleanup + runtime |
| Control Tower health | confirmado | 200/database connected | catálogo/readback protegido não confirmado |
| Control Tower APIs | testes locais | versão servida não identificada | não confirmado |
| Blogs contrato | 30 testes/build | domínio After Forty indisponível | slice local confirmado |
| Namespace | helpers existentes | divergência documental/cross-project | inconsistente |
| Publicação | fail-closed | não executada | bloqueada corretamente |

## Sequência do próximo E2E — começando pelo Authority

1. **Authority — entrada:** criar dados-base mínimos para uma Persona/blog de teste.
2. **Authority — formação:** confirmar Persona/version/approval package e estado `pending_approval`.
3. **Authority — aprovação:** aprovar versão específica como Sergio e ler de volta `personaId`, `versionId`, `version`, `snapshot/hash` e `approvalId`.
4. **Authority — evento:** confirmar outbox/event envelope ou marcar bloqueio se só existir rota local.
5. **Flux — inbox:** enviar/reprocessar o evento com `event_id`; provar idempotência e ausência de duplicidade.
6. **Flux — job/gate:** confirmar job, handoff, gate e estado antes de qualquer efeito externo.
7. **Control Tower — provisionamento:** somente com Gate autorizado; criar/reconciliar projeto, namespace e artifacts; readback metadata-only.
8. **Blogs — binding:** validar Persona aprovada, versão e hash; persistir binding/editorial; ler receipt sem snapshot/secret.
9. **Flux — consolidação:** readback de jobs/handoffs/blockers/artifacts e publicação ainda bloqueada até G6/G7.
10. **Domínio:** somente depois de projeto/namespace confirmados, validar DNS/health de After Forty.

## Conclusão

- **Confirmado:** quatro repositórios compilam; Authority 49 testes; Control Tower 42 testes; Blogs 30 testes; Flux build/typecheck/lint e maioria dos testes; Authority/Flux/Control Tower têm superfícies públicas respondendo.
- **Não confirmado:** commit efetivamente servido do Control Tower, persistência remota Authority, readback Supabase, outbox/adapter público, persistência Blog relacional, E2E transversal.
- **Bloqueado:** Flux snapshot sem scope, gateway Supabase sem autorização, After Forty sem DNS, suíte Flux com cleanup EBUSY, namespace divergente.
- **Decisão operacional:** não tratar o deploy como fechamento dos projetos. O próximo teste deve começar pelo Authority e parar no primeiro readback não confirmado.
