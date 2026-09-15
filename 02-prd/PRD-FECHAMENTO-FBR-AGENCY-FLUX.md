# PRD de Fechamento — FBR Agency Flux

## Status
`AUDITADO` | `FECHAMENTO_CONDICIONADO`

**Data da auditoria:** 2026-09-15  
**Repositório auditado:** `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`  
**Branch/commit auditado:** `main` / `967c607`  
**Objetivo:** transformar o diagnóstico real em backlog executável para fechar o FBR Agency Flux como camada transversal de gestão autônoma, automatizada e verificável dos projetos da FBR.

> Este PRD não autoriza commit, push, deploy, migration, reset, publicação, gasto, alteração de DNS, rotação de secret ou mutação externa. Essas ações exigem Gate específico de Sergio.

---

## 1. Veredicto executivo

### 1.1 O projeto atende à gestão autônoma e automatizada de todos os projetos da FBR?

**Não. Atende parcialmente.**

A base atual atende a uma **fundação local de coordenação e auditoria**, com dashboard, cards, jobs, Handoffs, blockers, Gates, autenticação local, triagem determinística da Íris e worker em execução única.

Ela ainda não atende ao requisito de operar autonomamente todos os projetos porque faltam:

- fonte pública de verdade persistente e comprovada após restart/redeploy;
- integração outbound real e autorizada com o Hermes;
- worker contínuo, heartbeat e follow-up permanente;
- deduplicação durável entre reinícios;
- RBAC/RLS remoto e isolamento multi-projeto comprovados;
- criação genérica de projeto a partir de briefing/MD, sem fixture específica do After Forty;
- execução remota verificável dos owners especializados;
- backup, restore, locking e recuperação testados;
- E2E remoto com readback independente.

**Classificação atual:** `BASE LOCAL FUNCIONAL / NÃO OPERACIONAL COMPLETO`.

### 1.2 Todos os PRDs estão atendidos?

**Não.** O PRD operacional é amplo e possui implementação parcial. Os quatro documentos adicionais em `02-prd` — Tara Lindqvist, Maia Mendes, Heidi Braun e Nadia Volkova — são **character bibles/entradas de marca**, não PRDs de software. Eles têm conteúdo editorial e visual, mas não possuem critérios de implementação, owner técnico, integração com intake, versionamento operacional ou teste de aderência dentro do Flux.

O PRD operacional declara como requisitos, entre outros: intake genérico, decomposição, contexto versionado de agents, estados, heartbeat, Handoffs, blockers, Gates, persistência, autorização, readback, filtros, atualização operacional e E2E. A auditoria confirmou apenas parte deles localmente.

### 1.3 A simulação E2E pretendida está funcional?

**Não como E2E operacional completo.**

O que existe é uma **preparação/simulação local parcialmente funcional**:

- fixture explícita After Forty;
- 18 suítes e 83 testes aprovados;
- typecheck, lint e build aprovados;
- rotas e contratos locais para cards, jobs, Handoffs, blockers, approvals, Gates, eventos e Íris;
- distinção entre dados locais, históricos e live.

Isso não prova o E2E pretendido porque não houve comprovação independente de banco persistente remoto, reload/restart/redeploy com preservação de decisões, integração Hermes real, execução contínua, RLS, isolamento remoto, browser autenticado completo, falhas/conflitos e readback público completo.

---

## 2. Evidências atuais

### Validação local executada nesta auditoria

| Verificação | Resultado |
|---|---:|
| `npm test` | **PASS — 18 suítes / 83 testes** |
| `npm run typecheck` | **PASS** |
| `npm run lint` | **PASS** |
| `npm run build` | **PASS** |
| Git status | **limpo após remoção de alteração automática do build** |
| Build warnings | 2 warnings não fatais de tracing dinâmico do filesystem |

### Estado do código

O código atual possui:

- repositório JSON local e adapter Supabase REST;
- persistência atômica local por arquivo temporário + rename;
- contratos de dispatcher e webhook Hermes;
- deduplicação process-local;
- APIs de cards, jobs, Handoffs, approvals, Gates, eventos e snapshot;
- autenticação local server-side com actor derivado da sessão;
- orquestrador Íris para intake, Handoff e evento;
- worker Íris com `--once` e `--dry-run`;
- UI de dashboard, Jobs e Handoffs com polling de cinco segundos;
- fixture `after-forty-intake.fixture.json` separada do histórico.

### Estado externo

Não há readback atual suficiente para declarar a operação remota concluída. Os documentos registram:

- persistência pública de approval anteriormente retornando a `pending`;
- build remoto Easypanel sem causa interna confirmada;
- Control Tower/Supabase com bloqueios de contrato/credencial em validações anteriores;
- dispatcher remoto não habilitado e não lido de volta;
- nenhum remote database, migration, service, deploy, publication, commit ou push executado nesta auditoria.

---

## 3. Inventário consolidado dos PRDs

| Documento | Classificação | Estado | Decisão |
|---|---|---|---|
| `02-prd/PRD-Agency-Flux-operacional.md` | PRD de produto/sistema | Parcialmente implementado; ainda `DRAFT_FOR_VALIDATION` | Tornar fonte operacional versionada após incorporar este fechamento |
| `02-prd/TaraLandvqist.md` | Character bible de marca | Conteúdo editorial; sem integração técnica comprovada | Reclassificar como input de projeto/brand, fora do core do Flux |
| `02-prd/MaiaMendes.md` | Character bible de marca | Conteúdo editorial; sem integração técnica comprovada | Reclassificar como input de projeto/brand, fora do core do Flux |
| `02-prd/HeidiBraun.md` | Character bible de marca | Conteúdo editorial; sem integração técnica comprovada | Reclassificar como input de projeto/brand, fora do core do Flux |
| `02-prd/NadiaVolkova.md` | Character bible de marca | Conteúdo editorial; sem integração técnica comprovada | Reclassificar como input de projeto/brand, fora do core do Flux |
| `01-conceitual/MP-000-foundation.md` | Fundação | Em validação; itens externos não concluídos | Não marcar como aprovado até cumprir os Gates remotos |
| `03-arquitetura/criterio-e2e-operacional.md` | Contrato de aceite E2E | Implementado documentalmente | Usar como contrato obrigatório de fechamento |

### Lacunas dos documentos

| Lacuna | Causa verificável | Impacto | Solução | Aceite |
|---|---|---|---|---|
| PRDs de marca não entram no intake | São documentos narrativos sem schema/metadata operacional | Projetos não recebem persona, restrições e aderência de modo determinístico | Criar tipo `project_input` com origem, versão, owner e critérios | Um briefing referencia o documento e o job recebe a versão exata e seu checksum |
| PRD operacional ainda mistura escopo local, remoto e piloto | Evolução histórica acumulada no mesmo documento | Status pode ser interpretado como conclusão | Manter este PRD como baseline de fechamento e separar estado por ambiente | Cada requisito tem status e evidência local/remota/pública |
| Fase 2 é declarada, mas não operacionalizada | Marketing, Vendas, Suporte e ML aparecem como intenção | Não existe automação transversal para esses domínios | Criar módulos e contratos genéricos, sem criar especialistas desnecessários | Novo projeto de cada domínio gera cards, owners, Gates e readback |
| Critério de E2E exige mais do que a suíte local cobre | Testes automatizados não exercitam todos os serviços reais | Falsa sensação de completude | Implementar matriz E2E local, homologação e público | Todos os gates da matriz têm evidência independente |

---

## 4. Escopo de fechamento

### Dentro do escopo

1. Contrato genérico de projeto, intake, jobs, agents, dependências e critérios.
2. Persistência externa durável com isolamento por projeto/tenant.
3. Autonomia operacional: Íris, Kora, follow-up, heartbeat, retry e escalonamento.
4. Dispatcher Hermes autenticado, observável e idempotente.
5. Dashboard de estado real, origem do dado, stale e limitações.
6. Handoffs, blockers, evidências, Gates e approvals com readback.
7. Segurança, secrets, RBAC/RLS, locking, backup e recuperação.
8. E2E After Forty como prova de aceitação do Flux.
9. Deploy homologado e operação pública somente após Gates.
10. Documentação, matriz de aceite, receipts e encerramento formal.

### Fora do escopo

- substituir Control Tower, FBR Blogs ou os demais owners especialistas;
- permitir publicação, gasto, compra, DNS ou produção sem Gate;
- transformar character bibles em funcionalidades editoriais do Flux;
- criar agentes especialistas para cada marketplace quando um agente geral instruído for suficiente;
- prometer autonomia sobre APIs sem contrato e credencial de runtime;
- usar JSON local como persistência de produção;
- declarar operação contínua baseada somente em polling da UI.

---

## 5. Arquitetura de fechamento

```text
Projeto/briefing/MD + inputs de marca
                ↓
             Intake API
                ↓
      Íris: normalização e decomposição
                ↓
 Kora: cards, jobs, owners, dependências e checks
                ↓
 Flux persistente: Postgres/Supabase + RLS + inbox
                ↓
 Dispatcher Hermes / adapters autorizados
                ↓
 Agents e projetos especialistas
                ↓
 Eventos, heartbeat, Handoffs, artefatos e evidências
                ↓
 Gabe: QA e Gates
                ↓
 Sergio: decisões de impacto
                ↓
 Readback API/UI + receipts + histórico
```

A fonte de verdade de produção será o banco externo persistente. JSON será permitido apenas para fixture, teste e importação explicitamente autorizada.

---

## 6. Requisitos de fechamento

### RF-CL-01 — Intake genérico
Um projeto novo deve ser criado a partir de briefing/MD, com owner, tenant/projeto, idioma, mercado, objetivo, ativos, Design System, restrições e inputs versionados.

### RF-CL-02 — Decomposição autônoma controlada
A Íris deve gerar cards, jobs, owners, dependências, critérios, Gates e próximos checks sem depender de intervenção humana para atividade rotineira.

### RF-CL-03 — Contrato de agent
Todo job deve conter contexto versionado, objetivo, escopo, entrada, skills, workflow, owner, aceite, evidência, correlation ID e próximo responsável.

### RF-CL-04 — Execução e follow-up
Jobs devem emitir `accepted`, `started`, `progress`, `waiting_input`, `blocked`, `handoff_sent`, `completed`, `failed` e `cancelled`; worker contínuo deve cobrar idle e stale.

### RF-CL-05 — Persistência e concorrência
Decisões, eventos, jobs, Handoffs e blockers devem sobreviver a reload, restart e redeploy; writes devem ser transacionais/idempotentes e protegidos contra lost updates.

### RF-CL-06 — Segurança e isolamento
Actor server-side, RBAC, RLS ou equivalente, isolamento por projeto/tenant, secrets apenas no runtime e erros sanitizados.

### RF-CL-07 — Gates seletivos
Gates devem existir apenas para escopo, risco, gasto, publicação, produção, infraestrutura, secrets, migração destrutiva e decisões irreversíveis.

### RF-CL-08 — Observabilidade
A UI deve distinguir planejado, live, stale, histórico, blocked, awaiting approval e completed; cada mutação deve permitir readback por API e UI.

### RF-CL-09 — E2E real
O E2E deve exercitar interface/serviços reais, sucesso/falha, autorização, persistência, restart/redeploy, integração, isolamento, concorrência, retry e readback independente.

### RF-CL-10 — Operação segura
Deploy reproduzível, health/readiness, backup/restore, logs com correlation ID, zero secret leak e rollback documentado.

---

## 7. Sprints e stories

As stories abaixo formam o backlog mínimo para fechar o projeto. Cada story tem owner primário, dependências e aceite objetivo. Stories de escrita, teste local e auditoria não exigem Gate; mutações externas exigem o Gate indicado.

### Sprint S0 — Baseline, contrato e limpeza documental

**Objetivo:** congelar o diagnóstico e transformar o conjunto atual em fonte de verdade sem ambiguidade.

| Story | Feature | Owner | Dependência | Aceite |
|---|---|---|---|---|
| S0-01 | Baseline auditável | Kora/Gabe | Nenhuma | Snapshot local, remoto, histórico, branch, commit e data ficam registrados com origem distinta |
| S0-02 | Contrato de domínio v1 | Íris/Théo | S0-01 | Schemas versionados para Project, Card, Job, AgentRun, Event, Handoff, Blocker, Artifact, Evidence, Approval e Gate |
| S0-03 | Máquina de estados | Théo/Gabe | S0-02 | Transições válidas e inválidas têm testes; transição inválida falha fechado e não grava parcialmente |
| S0-04 | Reclassificação de PRDs | Íris/Kora | S0-01 | Operacional, foundation e character bibles têm classificação, owner e uso documentados |
| S0-05 | Critérios e receipts | Gabe | S0-02 | Cada story tem 5–8 critérios testáveis, evidência esperada e correlation ID |

### Sprint S1 — Intake e aplicação genérica multi-projeto

**Objetivo:** provar que o Flux não depende do After Forty nem de dados fixos.

| Story | Feature | Owner | Dependência | Aceite |
|---|---|---|---|---|
| S1-01 | Criar projeto por briefing/MD | Íris/Théo | S0-02 | Dois projetos distintos são criados a partir de entradas diferentes sem editar código ou fixture |
| S1-02 | Inputs versionados | Íris | S1-01 | Persona, Design System, restrições e assets têm versão, origem, owner e checksum |
| S1-03 | Grafo de dependências | Íris/Kora | S1-01 | Jobs independentes recebem `parallelGroup`, `track`, `dependsOn`, `blocks` e `canStart` corretos |
| S1-04 | Template de contexto de agent | Íris | S0-02 | Job sem entrada, escopo, aceite, owner ou próximo passo é rejeitado |
| S1-05 | Isolamento de projetos | Théo/Gabe | S1-01 | Consulta e mutação de um projeto não retornam nem alteram dados de outro |

### Sprint S2 — Persistência externa, schema e durabilidade

**Objetivo:** eliminar o JSON como fonte pública e provar sobrevivência do estado.

| Story | Feature | Owner | Dependência | Gate |
|---|---|---|---|---|
| S2-01 | Migration persistente | Théo | S0-02 | DDL idempotente, índices, FKs, timestamps, correlation IDs e tabela de inbox aplicados em ambiente autorizado |
| S2-02 | RLS/RBAC remoto | Théo/Gabe | S2-01 | Perfis coordinator, operator, gatekeeper e viewer são testados; cross-project access falha |
| S2-03 | Repository transacional | Théo | S2-01 | Approval, Gate, job, Handoff e evento sobrevivem a duas leituras independentes |
| S2-04 | Locking/conflito | Théo | S2-03 | Duas atualizações concorrentes não causam lost update; conflito retorna erro sanitizado e recuperável |
| S2-05 | Dedupe durável | Théo | S2-03 | Mesmo event ID reenviado após restart produz um único efeito persistido |
| S2-06 | Backup e restore | Théo/Gabe | S2-01 | Backup é criado, restaurado em ambiente de teste e comparado por snapshot/contagem/IDs |
| S2-07 | Approval readback | Gabe | S2-03 | Approval decidido permanece decidido após reload, restart e redeploy de homologação |

### Sprint S3 — Dispatcher Hermes, worker e autonomia operacional

**Objetivo:** transformar coordenação local em operação automatizada verificável.

| Story | Feature | Owner | Dependência | Gate |
|---|---|---|---|---|
| S3-01 | Webhook Hermes assinado | Théo | S2-03 | Evento assinado é aceito; assinatura inválida, evento desconhecido e payload inválido são rejeitados |
| S3-02 | Mapeamento lifecycle | Théo/Íris | S3-01 | Claim, spawn, update, complete, blocked e exit atualizam o job correto com evidência da origem |
| S3-03 | Heartbeat real | Théo/Hermes owner | S3-01 | Existe evento estável com task/job identity, timestamp e receipt; sem isso o requisito fica bloqueado explicitamente |
| S3-04 | Worker contínuo | Théo/Kora | S3-02 | Serviço periódico executa checks, registra início/fim, detecta idle/stale e reinicia com segurança |
| S3-05 | Retry e backoff | Théo | S2-05 | Falha transitória é repetida com limite; falha permanente vira blocker com owner e nextCheck |
| S3-06 | Escalonamento Íris | Íris | S1-03/S3-04 | Gap coberto pelo plano é encaminhado internamente; somente `outside_plan` chega a Sergio com alternativas |
| S3-07 | Follow-up operacional | Kora | S3-04 | Todo item não concluído tem owner, ação, nextCheck e registro de cobrança/readback |

### Sprint S4 — Dashboard operacional e governança

**Objetivo:** permitir que Sergio veja o estado real sem reconstruir conversas.

| Story | Feature | Owner | Dependência | Aceite |
|---|---|---|---|---|
| S4-01 | Visão executiva multi-projeto | Théo/Kora | S2-03 | Home mostra projetos, cards prioritários, Gates, blockers, jobs e últimos eventos por origem |
| S4-02 | Detalhe operacional de job | Théo | S3-02 | Job mostra owner, etapa, progresso, heartbeat, dependências, artifacts, evidence, Handoff e nextStep |
| S4-03 | Filters e ordenação | Théo/Kora | S4-01 | Filtros por projeto, card, agent, status, owner, origem, blocker, Gate e atualização retornam contagens coerentes |
| S4-04 | Stale e origem | Gabe | S3-03 | Planned/historical não aparecem como realtime/stale; job live sem heartbeat excedido aparece como stale |
| S4-05 | Mini cards de Handoff | Théo/Íris | S2-03 | Handoff mostra de/para, objetivo, entregável, aceite, evidência, risco, blocker e próximo passo |
| S4-06 | Blocker resolvível | Gabe | S2-03 | Nenhum blocker aberto aparece sem causa, severidade, owner, ação, plano e evidência esperada |
| S4-07 | Gates seletivos | Gabe/Sergio | S0-05 | Atividade rotineira não cria aprovação; ações de impacto exibem escopo, impacto, custo, rollback e readback |
| S4-08 | Readback visual | Théo | S2-03 | Após cada mutação autorizada, UI confirma receipt e, após reload, exibe o estado persistido |

### Sprint S5 — Segurança, operação e recuperação

**Objetivo:** impedir que autonomia vire risco operacional.

| Story | Feature | Owner | Dependência | Gate |
|---|---|---|---|---|
| S5-01 | Runtime secrets | Théo | S2-01 | Nenhum secret em código, Git, URL, frontend, log, card, Handoff ou build args |
| S5-02 | Auth/RBAC homologado | Théo/Gabe | S2-02 | 401 sem sessão, 403 sem papel/escopo e actor do body ignorado em todos os endpoints de mutação |
| S5-03 | Health e readiness | Théo | S2-03 | Health responde disponibilidade; readiness falha quando persistência/dispatcher obrigatório não está configurado |
| S5-04 | Logging e auditoria | Théo/Gabe | S3-02 | Cada execução tem correlation ID, agent, job, step, início/fim, status, erro sanitizado e receipt |
| S5-05 | Docker/deploy reproduzível | Théo | S5-01/S5-03 | Build limpo em imagem e deploy de homologação passam sem secret leak |
| S5-06 | Rollback | Théo | S5-05 | Versão anterior pode ser restaurada e o readback confirma estado sem mutação parcial |
| S5-07 | Warnings de tracing | Théo | S5-05 | Warnings são eliminados ou delimitados/documentados com impacto medido |

### Sprint S6 — E2E After Forty e prova de fechamento

**Objetivo:** usar o After Forty como teste real do sistema, não como seed demonstrativo.

| Story | Feature | Owner | Dependência | Gate |
|---|---|---|---|---|
| S6-01 | Estado inicial limpo | Kora | S2-03 | Readback vazio/esperado de `state_key=fbr-agency-flux` antes do intake; sem apagar dados sem Gate |
| S6-02 | Intake real AF-001 | Íris/Kora | S1-01/S6-01 | AF-001 cria projetos, jobs, dependências, Handoffs, Gates e blockers com receipts |
| S6-03 | Execução paralela | Íris/agents | S3-04 | Bia/Rick e tracks independentes iniciam sem espera artificial; cada job emite eventos reais |
| S6-04 | Handoff e blocker | Gabe/Kora | S4-05/S4-06 | Handoff incompleto falha; encaminhamento válido cria ação/Handoff/evento idempotente; blocker só fecha com evidência |
| S6-05 | Approval autorizado | Sergio/Gabe | S4-07/S5-02 | Actor não autorizado falha; decisão de Sergio persiste e é lida pela API e UI após reload/restart |
| S6-06 | Falhas e recuperação | Théo/Gabe | S2-04/S3-05 | Timeout, banco indisponível, payload inválido e corrida têm erro sanitizado, sem gravação parcial e com retry/rollback quando aplicável |
| S6-07 | Browser E2E homologado | Gabe | S4/S5 | Pessoa opera interface, filtros, detalhes, ações válidas/ inválidas e confirma estado depois de reload |
| S6-08 | Readback remoto independente | Gabe | S6-07 | API, banco e interface retornam o mesmo estado; evidência inclui timestamp, receipt, origem e ambiente |
| S6-09 | Relatório de E2E | Gabe | S6-08 | Matriz do critério E2E está 100% preenchida ou cada exceção tem blocker, owner, solução e nextCheck |

### Sprint S7 — After Forty público e encerramento formal

**Objetivo:** fechar o produto apenas depois da prova operacional e dos Gates externos.

| Story | Feature | Owner | Dependência | Gate |
|---|---|---|---|---|
| S7-01 | Banco `blog_afterforty` | Théo | S6-09 | Schema, tabelas, policies, RLS e isolamento lidos de volta no ambiente autorizado |
| S7-02 | Aplicação After Forty | Théo/FBR Blogs | S7-01 | Frontend/backend reais conectados ao conteúdo e ambiente seguro |
| S7-03 | DNS/TLS/domínio | Théo | S7-02 | `afterforty.fbr.news` responde com TLS válido e smoke HTTP registrado |
| S7-04 | QA de conteúdo | Gabe/editorial | S7-02 | 12 artigos, Sources, disclaimers, About Me, categorias e links passam critérios editoriais |
| S7-05 | Deploy público | Théo | S7-03/S7-04 | Deploy autorizado, health/readiness e rollback verificados |
| S7-06 | Publicação | Sergio/editorial | S7-04 | Conteúdo só é publicado após Gate explícito e readback público |
| S7-07 | Fechamento do Flux | Gabe/Kora | S7-05/S7-06 | DoD completo, riscos residuais aceitos, documentação atualizada e status final `COMPLETED` com evidências |

---

## 8. Dependências críticas e blockers

| Blocker | Causa | Impacto | Solução | Owner | Evidência de encerramento |
|---|---|---|---|---|---|
| Persistência remota não comprovada | runtime/contrato/credencial Supabase não validados | Approval e estado podem voltar a `pending` | Aplicar migration autorizada, configurar secret no runtime, smoke GET/POST/readback e teste pós-redeploy | Théo/Sergio | Receipt remoto sem exposição de secret e duas leituras coincidentes |
| Dispatcher remoto não habilitado | endpoint, secret, Gate e readback não fornecidos | Íris não aciona agentes de modo verificável | Configurar webhook Hermes em ambiente autorizado e testar evento assinado | Théo/Hermes owner | `hooks list`, delivery receipt, job readback e log sanitizado |
| Heartbeat outbound ausente | contrato Hermes documentado não expõe `kanban_heartbeat` | realtime/stale completo não pode ser provado | Criar observer/plugin aprovado ou declarar heartbeat limitado a adapter interno | Hermes owner/Théo | evento assinado com task/job identity e timestamp, ou decisão formal de limitação |
| Dedupe apenas process-local | `seen` é memória do processo | replay após restart pode duplicar mutação | inbox persistente com chave única `eventId` | Théo | replay pós-restart sem segunda mutação |
| Build remoto sem causa | log Easypanel insuficiente | deploy não é reproduzível | capturar log interno, reproduzir Docker, corrigir e repetir sem cache | Théo | build remoto PASS sem secret leak |
| E2E público incompleto | banco, deploy, domínio e browser readback não comprovados | Flux não prova gestão real | Executar S6 e S7 com evidências independentes | Gabe/Théo | matriz E2E 100% ou blockers formalmente aceitos |

---

## 9. Gate policy

### Pode avançar autonomamente

- leitura e auditoria;
- pesquisa e proposta;
- criação de artefatos locais;
- testes locais;
- Handoffs rotineiros;
- heartbeat e mudança rotineira de status;
- triagem e decomposição dentro do plano aprovado;
- execução em fixture/local sem efeito externo.

### Exige Gate de Sergio

- migration ou alteração de banco externo;
- commit/push e publicação de versão;
- deploy/redeploy e criação de serviço permanente;
- DNS/TLS/domínio;
- rotação, revogação ou ampliação de secret em produção;
- gasto, campanha, afiliado, compra ou publicação;
- alteração irreversível, reset, exclusão ou sobrescrita de dados;
- mudança de escopo, arquitetura ou prioridade com impacto em outros projetos.

Aprovação autoriza apenas a ação, ambiente, versão e escopo registrados. Execução e verificação continuam obrigatórias.

---

## 10. Definition of Done do projeto

O FBR Agency Flux só poderá ser marcado como `COMPLETED` quando todos forem verdadeiros:

- [ ] novo briefing gera projeto sem fixture específica;
- [ ] projeto é isolado de todos os demais;
- [ ] Íris gera grafo, jobs, owners, critérios e próximos checks;
- [ ] jobs são despachados e aparecem antes de terminar;
- [ ] progresso e heartbeat têm origem real ou limitação explícita;
- [ ] worker contínuo faz follow-up e registra execução;
- [ ] Handoffs, artifacts e evidências têm readback;
- [ ] blockers mostram causa, owner, ação, plano e evidência;
- [ ] blockers só fecham com evidência validada;
- [ ] Gates não contaminam atividade rotineira;
- [ ] actor não é falsificável pelo body;
- [ ] estado persiste após reload, restart e redeploy;
- [ ] dedupe persiste após restart;
- [ ] concorrência e falhas não geram gravação parcial;
- [ ] backup e restore foram exercitados;
- [ ] nenhum secret aparece em artefatos ou logs;
- [ ] build remoto e deploy homologado passam;
- [ ] E2E After Forty tem readback independente;
- [ ] ações externas têm Gate datado de Sergio;
- [ ] documentação, sprints, stories e histórico estão atualizados.

---

## 11. Ordem executável de fechamento

```text
S0 baseline e contratos
→ S1 intake genérico
→ S2 persistência/RLS/locking/backup
→ S3 dispatcher/heartbeat/worker
→ S4 dashboard/governança
→ S5 segurança/deploy/recuperação
→ S6 E2E After Forty homologado
→ Gate de Sergio para ações externas
→ S7 After Forty público e fechamento
→ Gabe valida DoD
→ Kora registra COMPLETED
```

Sprints S1, S2 e partes de S4 podem ser paralelizados quando não houver dependência real. S6 depende de S2–S5. S7 depende de S6 e de Gates externos.

---

## 12. Handoff de fechamento

```yaml
from: David
para: Sergio
card: FLUX-CLOSE-001
objetivo: fechar o FBR Agency Flux como camada transversal autônoma, automatizada e verificável
status: BASE_LOCAL_FUNCIONAL_NAO_OPERACIONAL_COMPLETO
veredicto_gestao_autonoma: parcial
veredicto_prds: parcial; PRD operacional incompleto e character bibles fora do core técnico
veredicto_e2e: simulacao_local_parcial; E2E operacional remoto nao comprovado
artefato: 02-prd/PRD-FECHAMENTO-FBR-AGENCY-FLUX.md
sprints: S0 a S7
owners:
  - Iris: intake, decomposicao e coordenacao
  - Kora: Kanban, estado, follow-up e historico
  - Theo: engenharia, persistencia, dispatcher e deploy
  - Gabe: QA, evidencia, seguranca e Gates
  - Sergio: decisoes de impacto e Gates humanos
blockers_criticos:
  - persistencia externa duravel e readback
  - dispatcher Hermes remoto
  - heartbeat/worker continuo
  - dedupe duravel
  - RLS/RBAC/isolamento remoto
  - E2E homologado/publico
proxima_acao: iniciar S0 com baseline e contratos; nao declarar fechamento antes do DoD
precisa_de_gate_agora: nao para leitura deste PRD; sim antes de qualquer mutacao externa
```

## 13. Conclusão

O projeto tem uma base técnica local consistente e verificável, mas ainda não entrega a promessa original de gestão autônoma e automatizada de **todos** os projetos da FBR. O caminho de fechamento é executável e está decomposto acima.

A decisão correta neste momento é:

> **não fechar como concluído; fechar o diagnóstico, aprovar o backlog de fechamento e executar S0–S7 com evidência.**
