# After Forty — pacote E2E inicial de intake e operação

**Versão:** 1.0 · **Estado:** `LOCAL_FIXTURE_READY` · **Data:** 2026-09-14  
**Atuação:** Íris (intake) / Kora (Kanban e estado)  
**Escopo:** preparação local após reset do estado `fbr-agency-flux`; não é execução E2E remota.

## Projeto e escopo

| Campo | Valor | Evidência/classificação |
|---|---|---|
| Projeto | After Forty | FATO — briefing confirmado |
| Publisher | FBR News | FATO — briefing/contexto |
| Responsável | Sergio Castro | FATO — briefing |
| Persona/byline | Heidi Braun; persona editorial fictícia | FATO — briefing/contexto |
| Idioma/mercado | Inglês; EUA/global | FATO — briefing |
| Público | Pessoas 40+, foco 45+ | FATO — briefing |
| Domínio | `afterforty.fbr.news` | FATO — briefing; disponibilidade pública não verificada |
| Categorias | Skin & Beauty; Recovery & Wellness; Home Fitness | FATO — briefing |
| Conteúdo inicial | 12 artigos, 4 por categoria | FATO — briefing |
| Tema confirmado | Protein / Creatine for 40+ | FATO — briefing; produto específico ausente |

### Entregáveis

1. Intake normalizado e critérios de aceite.
2. Card `AF-001` no escopo local do Flux.
3. Jobs iniciais paralelizáveis para Kora, Bia e Rick/Amazon Research.
4. Job `job-af-001-theo-provision-plan` pronto para Théo preparar a proposta técnica, sem migration/provisionamento remoto.
5. Handoffs mínimos de intake, todos com `status: received`.
6. Sequência de Gates `AF-GATE-01` a `AF-GATE-04`.
7. Fixture JSON reproduzível em `09-codigo/data/after-forty-intake.fixture.json`.

## Owners e dependências

- **Íris:** normalizar briefing, escopo e routing; não aprova ações de risco.
- **Kora:** manter card, jobs, dependências, Handoffs, blockers e readback local.
- **Bia:** pesquisar contexto e mercado; não escolher produto nem criar claim.
- **Rick / Amazon Research:** apresentar opções rastreáveis; não escolher produto-pauta, comprar ou publicar.
- **Gestor Editorial:** decidir produto-pauta e agenda somente após opções rastreáveis.
- **Gabe:** revisar claims, fontes, disclaimer, disclosure e compliance.
- **Théo:** preparar e, somente após Gate aplicável, executar provisionamento/migration autorizado.
- **Sergio:** aprovar ação externa específica, gasto, publicação e mutação irreversível.

Dependência principal: intake → registro Kora → pesquisa paralela → decisão editorial → produção/revisão → Gate técnico → execução autorizada → readback. Jobs Bia e Rick podem iniciar em paralelo com o registro Kora; o job de Théo fica preparado, mas não executa ação remota.

## Jobs iniciais

| Job | Owner | Estado | Paralelização/dependência | Aceite |
|---|---|---|---|---|
| `job-af-001-kora-intake` | Kora | `ready` | inicia no Gate de entrada | AF-001, owners, dependências, blockers e Gates persistidos |
| `job-af-001-bia-context-research` | Bia | `ready` | paralelo com Rick após registro | fatos, hipóteses, fontes, datas e lacunas separados |
| `job-af-001-rick-affiliate-options` | Rick / Amazon Research | `ready` | paralelo com Bia após registro | opções com URL/data/riscos, sem escolha final |
| `job-af-001-theo-provision-plan` | Théo | `ready` | preparado; depende de Gate técnico | proposta de schema, pré-checks e rollback, sem mutação remota |

`ready` significa disponível para execução local dentro do escopo; nenhum desses jobs foi iniciado ou concluído. O fixture registra `progress: 0`, `lastEvent: dispatched` e `verification: not_verified` para evitar falsa conclusão.

## Handoffs mínimos

- `handoff-af-intake-iris-kora`: Íris → Kora, intake e decomposição; `received`.
- `handoff-af-intake-kora-theo`: Kora → Théo, preparação técnica do próximo job; `received`.

Recebido não significa executado, aprovado ou concluído. Os Handoffs não autorizam publicação, gasto, DNS, deploy, migration, compra ou provisionamento.

## Blockers reais

| ID | Causa | Owner | nextAction | resolutionPlan | Evidência |
|---|---|---|---|---|---|
| `blocker-afterforty-product-scope` | Produto-pauta específico não foi fornecido; só há categorias e tema | Gestor Editorial | receber opções e registrar decisão por pauta | manter pendente; não inventar SKU/preço/claim/link; Gabe revisa depois | briefing; `iris-intake-handoff.md` |
| `blocker-afterforty-remote-provisioning` | endpoint autenticado/readback externo e escopo técnico não estão confirmados neste escopo local | Théo | validar contrato/endpoint no runtime seguro, sem secrets no repositório | após Gate técnico, health/readback e plano idempotente; até lá sem mutação | `runtime-control-tower.md`; `09-codigo/README.md` |
| `blocker-afterforty-sergio-gate` | ações externas exigem Gate explícito e datado; nenhum foi fornecido para esta preparação | Sergio | emitir Gate com alvo, escopo, versão e ambiente específicos | registrar decisão; executar e verificar separadamente; manter bloqueado até então | critério E2E; PRD operacional |

Os blockers estão com `status: open`, owner, nextAction, resolutionPlan e evidência declarados. Não há resolução inventada.

## Sequência de Gates

1. **AF-GATE-01 — Entrada e escopo:** confirmar projeto, público, domínio, categorias, entregáveis e owners.
2. **AF-GATE-02 — Jobs e Handoffs:** confirmar o card, jobs `planned/ready`, dependências e Handoffs `received`.
3. **AF-GATE-03 — Técnico:** autorizar somente a proposta de provisionamento; não equivale a executar migration.
4. **AF-GATE-04 — Execução externa:** Sergio autoriza alvo/ambiente/versão/ação específicos; deploy, DNS, publicação, gasto e mutação continuam proibidos sem autorização correspondente.
5. **Readback:** depois de eventual execução autorizada, Kora confere o estado real e registra evidência; esta etapa não ocorreu.

## Próximo job executável para Théo

**Job:** `job-af-001-theo-provision-plan`  
**Entrada:** briefing, este pacote, `AF-001`, blockers e Gates locais.  
**Saída esperada:** proposta técnica versionada com contrato do Control Tower, nome/slug a validar, schema previsto, pré-checks, rollback e readback.  
**Proibições:** não executar migration, criar projeto/schema, criar serviço, configurar DNS, usar secrets no arquivo, fazer deploy ou publicar.  
**Condição de avanço:** Gate técnico e autorização explícita aplicável; a autorização deve ser limitada ao alvo, ambiente, versão e ação descritos.

## Readback local

- Fixture: `09-codigo/data/after-forty-intake.fixture.json`.
- Estado usado pelo executor local: `09-codigo/data/flux-state.json`.
- Contagens esperadas: 1 projeto, 1 card, 4 jobs, 2 Handoffs, 3 blockers abertos, 4 Gates pendentes, 0 approvals, 0 artifacts.
- Nenhum comando remoto de seed, migration, provisionamento, deploy, DNS ou publicação foi executado.
