# PRD — FBR Agency Flux Operacional

## Status
`DRAFT_FOR_VALIDATION`

Este documento é a fonte de verdade para transformar o FBR Agency Flux de uma base documental e dashboard local em uma camada operacional transversal da FBR Agency

Nenhuma aprovação deste documento autoriza commit, push, deploy, migration, publicação, gasto ou alteração externa

---

## After Forty — intake E2E inicial (2026-09-14)

O piloto After Forty foi reiniciado localmente após o reset do estado `fbr-agency-flux`. O pacote operacional verificável está em `08-historico/afterforty/e2e-intake-operacional.md`; o fixture está em `09-codigo/data/after-forty-intake.fixture.json`. O estado inicial contém somente o projeto After Forty, o card AF-001, quatro jobs `ready`, dois Handoffs `received`, quatro Gates pendentes e blockers abertos com owner, nextAction, resolutionPlan e evidência. Nenhum job foi executado e nenhuma migration, provisionamento, deploy, DNS, publicação ou gasto ocorreu.

O escopo confirmado é publisher FBR News, responsável Sergio Castro, inglês, EUA/global, domínio `afterforty.fbr.news`, público 40+, categorias Skin & Beauty, Recovery & Wellness e Home Fitness, e 12 artigos iniciais. O produto-pauta específico permanece ausente e não deve ser inventado. Bia e Rick/Amazon Research são paralelizáveis após o registro Kora; Théo está com o próximo job pronto para preparar a proposta técnica, condicionado aos Gates e sem mutação remota.

## Coordenação operacional da Íris e fronteiras de decisão

`src/lib/iris-orchestrator.ts` implementa triagem determinística em `triage on intake`, `triage on handoff` e `triage on event`, com validação de card/plano/owner/aceite, matriz rastreável (produto-pauta → Gestor Editorial com Rick / Amazon Research; provisionamento → Théo; Gate → Sergio), instrução operacional, correlationId, idempotência e readback. `POST /api/flux/iris/triage` é autenticado, suporta dry-run e não executa efeitos externos. Blockers permanecem `open` até evidência persistida.

A inteligência é contrato de todos os agentes: cada recebimento declara `decisionScope`, `gapAssessment`, `proposedResolution`, `collaborationRequest`, `sergioQuestion`, `decisionNeeded`, evidência e `nextCheck`. Assuntos cobertos pelo plano são resolvidos pela Íris; dependências especializadas geram colaboração; somente `outside_plan` (nova decisão, conflito, mudança de escopo/prioridade ou risco humano) escala Sergio com alternativas e recomendação, em `awaiting_sergio_decision`. Não existe monitoramento contínuo sem worker/heartbeat/cron.

A regra operacional é no-idle/no-silent-wait: trabalho não concluído deve estar em execução, preparado, em track paralelo, encaminhado/consultado ou aguardando dependência/decisão externa explícita com owner, pergunta, próximo check e atividade paralela. A Íris constrói grafo `dependsOn/blocks/canStart`, inicia todos os `canStart=true`, registra `parallelGroup/track` e reavalia após Handoff/evento. Pesquisa e provisionamento After Forty são tracks paralelos; conteúdo comercial só depende do entregável produto-pauta.

## Semântica operacional de Jobs

A página `/jobs` deve distinguir explicitamente intenção de execução observada. Jobs `planned`/`ready` da origem `local/intake-fixture`, sem `startedAt` e sem evento/heartbeat real, são **Planejado**: não contam como Realtime nem Stale. Registros `historical` ou derivados de `filesystem` são **Histórico** e nunca são stale. **Realtime** exige origem live/dispatcher, job iniciado e evento real de dispatcher ou `lastSeen` posterior a `startedAt`. **Stale** só pode ser contado para Realtime iniciado cujo heartbeat exceda o threshold de 30 segundos. Contadores, filtros, cards e detalhes devem usar a mesma classificação; o fixture After Forty deve resultar em `planned=4`, `realtime=0`, `stale=0`.

## 1. Resumo executivo

O FBR Agency Flux é a camada transversal que recebe a concepção de um projeto, organiza escopo, agentes, skills, workflows, dependências, Handoffs, evidências e Gates e mantém Sergio informado sobre o estado real da execução

A FBR não quer uma página estática, um mock ou um relatório posterior. O resultado esperado é que um arquivo conceitual de projeto seja transformado em uma operação rastreável, na qual:

```text
briefing
→ escopo
→ cards e jobs
→ agentes responsáveis
→ execução observável
→ Handoffs em mini cards
→ evidências e artefatos
→ blockers com solução declarada
→ Gates humanos somente quando necessários
→ readback verificável
```

Sergio não deve aprovar cada movimento rotineiro. Deve conseguir ver tudo em tempo real e ser chamado somente para decisões que exigem autoridade humana

---

## 2. Proposta de valor

### Para Sergio

- saber o que está acontecendo sem reconstruir o contexto em conversas
- distinguir imediatamente execução, Handoff, risco, blocker e Gate
- aprovar somente ações de impacto
- ter uma solução concreta para cada bloqueio, com owner e evidência de encerramento
- verificar se uma aprovação continua existente após reload, restart e redeploy
- receber uma entrega completa ou uma explicação objetiva do que falta e como resolver

### Para a FBR Agency

- aplicar o mesmo fluxo a blogs, anúncios, projetos e negócios diferentes
- preservar ownership dos projetos e dos agentes especialistas
- reduzir retrabalho causado por contexto perdido
- criar histórico auditável de decisões e execução
- separar concepção, gestão e execução externa
- evoluir workflows, skills, métricas e controles na Fase 2

### Para os agentes

- receber escopo, entrada, objetivo e critério de aceite claros
- saber quem é o próximo responsável
- registrar progresso e heartbeat
- entregar Handoff com artefato, evidência, riscos e solução para blockers
- não depender de memória de chat para continuar um job

---

## 3. Situação atual do sistema

### 3.1 O que já existe

O repositório atual contém:

```text
F:\Projetos\_FBR\FBR Agency Flux
```

com a estrutura obrigatória:

```text
01-conceitual
02-prd
03-arquitetura
04-database
05-workflows
06-design
07-marketing
08-historico
09-codigo
README.md
```

O dashboard é uma aplicação Next.js/TypeScript em:

```text
F:\Projetos\_FBR\FBR Agency Flux\09-codigo
```

Há uma versão pública conhecida em:

```text
https://agency.fbr.news
```

A versão pública não deve ser considerada equivalente à versão local até que o redeploy e o readback sejam comprovados

### 3.2 Inventário detalhado do que está feito

#### A — Fundação documental e governança

| Item | Estado | Evidência / localização |
|---|---|---|
| Conceito do FBR Agency Flux | implementado | `README.md`, `01-conceitual` |
| Escopo da Fase 1 | implementado | `README.md`, documentação de arquitetura |
| Fase 2 com Marketing, Vendas, Suporte, Machine Learning e governança adaptativa | implementado | `README.md`, skill `fbr-agency-flux` |
| Estrutura obrigatória de diretórios | implementado | raiz do projeto |
| Papéis de Sergio, Íris, Kora, Théo, Gabe e especialistas | implementado | README, skill compartilhada e catálogos |
| Regra de Design System no intake | implementado | `06-design/regra-design-system-no-intake.md` |
| Contrato de Handoff | implementado | documentação do Flux e skill compartilhada |
| Zero Secret Leaks | implementado como regra | documentação e skill |
| Separação entre decisão local e efeito externo | implementado como regra | ADR de Gates e dashboard |
| Critério formal de E2E | implementado | `03-arquitetura/criterio-e2e-operacional.md` |
| Política flexível de evidências | implementado | `03-arquitetura/politica-flexivel-de-evidencias.md` |
| Governança de Gates | implementado documentalmente | ADR de aprovação formal |

#### B — Aplicação local

| Item | Estado | Evidência / localização |
|---|---|---|
| Dashboard Next.js | implementado localmente | `09-codigo/src/app` |
| Snapshot operacional | implementado localmente | `src/lib/flux-repository.ts` e rota de snapshot |
| Projetos acompanhados | implementado localmente | `data/flux-state.json` |
| Cards de projeto | implementado localmente | API e interface |
| Máquina de estados de cards | implementada localmente | transições no repositório |
| Gates do FBR Flux | implementados localmente | API, UI e estado JSON |
| Approvals | implementados localmente | API, UI e estado JSON |
| Eventos | implementados localmente | API, UI e estado JSON |
| Handoffs | implementados localmente | API, UI e estado JSON |
| Artefatos reais do After Forty | sincronizados localmente | importador de filesystem |
| Jobs/agent runs | implementados localmente | modelo, API e UI |
| Importação de Handoffs/relatórios | implementada localmente | sincronizador de `08-historico/afterforty` e pacote After Forty |
| Mini cards de atividade e Handoffs | implementados localmente | `dashboard-client.tsx` |
| Filtros por agent, status e card | implementados localmente | toolbar do dashboard |
| Polling da interface | implementado localmente | polling de 5 segundos |
| Classificação de riscos e blockers | implementada localmente | modelo e testes de blockers |
| Blocker com owner, ação e plano de resolução | implementado localmente | modelo atualizado e UI |
| Registros antigos sem solução | classificados como legacy/unverified | normalização do importador |
| Autenticação server-side local | implementada | rotas de auth e sessão |
| Actor derivado da sessão | implementado | decisão não confia no actor do body |
| Bloqueio de decisão sem sessão | implementado e testado | testes de auth |
| Login local | implementado para teste | credencial lida do runtime |
| Persistência atômica local | implementada | gravação temporária seguida de rename |

#### C — After Forty como piloto operacional

| Item | Estado | Evidência / localização |
|---|---|---|
| Briefing, escopo e categorias | implementados localmente | histórico After Forty |
| 12 drafts iniciais | implementados localmente | pacote `FBR Blogs/After Forty` |
| Quatro artigos por categoria | verificado localmente | relatório de readiness |
| Sources e disclaimer nos 12 drafts | verificado localmente | validação de conteúdo |
| G3 editorial/compliance | executado localmente | relatórios de Gabe |
| About Me | corrigido localmente e aguardando revisão | cópias do draft e consumo |
| Três direções de logo | criadas como DRAFT / NOT FINAL | `06-design/DesignSystemBlogs/after-forty` |
| Plano social de Heidi | criado localmente | `vito-social-profiles-and-follower-acquisition-plan.md` |
| Direção Aitana como referência estrutural, sem cópia | registrada como decisão de direção | plano do Vito |
| Pacote de entrega técnica | criado localmente | `FBR Blogs/After Forty` |
| Banco `blog_afterforty` | somente documentado | sem readback externo confirmado |
| Frontend/backend After Forty | não implantados | ausência de readback público |
| Domínio `afterforty.fbr.news` | não verificado | DNS/HTTP não confirmados |
| Conteúdo publicado | não iniciado | Gate de publicação inexistente |
| Afiliados, HopLinks e mídia paga | não iniciados | não autorizados |

#### D — Validações já executadas

| Validação | Resultado |
|---|---|
| Testes iniciais do Flux | aprovados em execuções anteriores |
| Testes da autenticação | aprovados |
| Testes de observabilidade de agents | 22 testes aprovados no estado local atual |
| Typecheck | PASS local |
| Lint | PASS local |
| Build Next.js local | PASS com dois warnings de tracing de filesystem |
| Homologação básica do adapter Easypanel | criação, update, deploy, list/inspect e destroy confirmados anteriormente |
| `getAction` Easypanel | limitado por log ausente no servidor, incidente documentado |
| Persistência pública de approval | FAIL: `approval-af-001` voltou a `pending` |
| Build remoto Easypanel | FAIL, mas o log fornecido não contém a causa interna |
| Tempo real do dispatcher Hermes | não verificado/indisponível no adapter atual |

### 3.3 Diagnóstico honesto

O dashboard atual atende minimamente à função de **protótipo operacional local** e à inspeção de artefatos, cards, Gates e Handoffs

Ele ainda não atende minimamente ao objetivo final da FBR como sistema operacional transversal porque:

```text
fonte de verdade pública não é durável
aprovação não sobrevive de forma comprovada a redeploy
atividade dos agentes é histórica, não tempo real
dispatcher Hermes não está conectado ao Flux
build remoto está falhando
E2E remoto não foi concluído
After Forty não tem readback externo de banco, deploy ou domínio
```

Conclusão: a base está avançada, mas o produto ainda não está pronto para ser chamado de Agency Flux operacional

---

## 4. Objetivos do produto

### O1 — Concepção executável

Transformar um arquivo conceitual em escopo, arquitetura, cards, jobs, responsáveis, dependências, critérios e plano de execução

### O2 — Observabilidade integral

Mostrar, em tempo real ou com indicação explícita da limitação:

```text
agent
job
etapa
status
progresso
heartbeat
última atualização
dependências
Handoff
artefato
evidência
risco
blocker
solução do blocker
owner do desbloqueio
Gate pendente
próximo passo
```

### O3 — Comunicação por Handoffs

Representar Handoffs e atualizações rotineiras em mini cards, sem transformá-los em Gates

### O4 — Gates seletivos

Solicitar decisão humana somente para escopo, risco, gasto, publicação, infraestrutura, alteração irreversível ou decisão estratégica

### O5 — Persistência confiável

Preservar decisões, eventos, jobs e Handoffs após reload, restart, redeploy e leitura independente

### O6 — Entrega verificável

Não marcar um projeto como concluído sem banco, frontend, backend, conteúdo, QA, deploy, domínio, Smoke público e readback final quando esses itens fizerem parte do escopo

---

## 5. Fora de escopo da versão operacional inicial

- substituir os projetos especializados da FBR
- substituir o Control Tower
- executar automaticamente qualquer ação externa sem Gate aplicável
- exigir aprovação humana para cada Handoff ou publicação rotineira dentro de uma estrutura já aprovada
- inventar atividade de agent quando só existe um relatório histórico
- usar o dashboard como fonte de verdade quando o banco externo estiver indisponível
- publicar conteúdo, gastar orçamento, criar contas sociais ou ativar afiliados sem autorização específica

---

## 6. Requisitos funcionais

### RF-01 — Intake

O sistema deve registrar arquivo conceitual, público, mercado, idioma, oferta quando aplicável, prazo, orçamento, ativos, Design System, restrições, owner e formato de entrega

### RF-02 — Decomposição

A Íris deve conseguir transformar o intake em projeto, cards, jobs, dependências, responsáveis e critérios de aceite

### RF-03 — Contexto de agent

Cada job deve registrar agent, role, objetivo, entrada, escopo, skills, workflow, card, correlation_id e próximo responsável

### RF-04 — Estado operacional

Cada job deve suportar:

```text
planned
accepted
started
progress
waiting_input
blocked
review
handoff_sent
completed
failed
cancelled
```

### RF-05 — Heartbeat

O dispatcher ou adapter deve registrar `last_seen`, progresso, etapa atual e evento. O dashboard deve indicar `stale` quando o heartbeat exceder o limite configurado

### RF-06 — Handoff mini card

Cada Handoff deve exibir:

```text
de
para
card/job
objetivo
status
timestamp
artefato
evidência
riscos
blockers ativos
owner do desbloqueio
solução
próximo passo
```

### RF-07 — Blocker resolvível

Um blocker aberto deve exigir:

```text
causa
severidade
owner
nextAction
resolutionPlan
resolutionEvidence
```

Risco não deve entrar na contagem de blockers ativos

### RF-08 — Gates

Gates devem ser entidades distintas de Handoffs, approvals rotineiros e jobs. Cada Gate deve registrar escopo, impacto, custo, reversibilidade, rollback, evidência, decisão, actor e timestamp

### RF-09 — Persistência

A fonte pública de verdade deve ser um banco persistente externo ou volume durável explicitamente validado. JSON local permanece apenas como fixture/teste

### RF-10 — Autorização

A API deve derivar o actor da sessão autenticada e rejeitar spoofing pelo body. A autorização deve ser server-side e por escopo

### RF-11 — Readback

Toda mutação deve gerar receipt/correlation_id e permitir leitura posterior do mesmo recurso por API e interface

### RF-12 — Filtros

O dashboard deve filtrar por projeto, card, agent, status, owner, Gate, blocker aberto e intervalo de atualização

### RF-13 — Atualização

A interface deve usar SSE, WebSocket ou polling documentado. Deve exibir a idade da última atualização e nunca apresentar histórico como tempo real

### RF-14 — E2E

O sistema deve testar ações válidas e inválidas, permissões, persistência, concorrência, falhas, readback e isolamento

---

## 7. Requisitos não funcionais

- sem secrets em código, frontend, URL, Git, logs ou Handoffs
- operações externas fail-closed quando configuração faltar
- writes idempotentes para eventos e heartbeats
- locking ou transação para evitar lost updates
- isolamento por projeto/tenant/schema
- erros sanitizados
- logs com correlation_id
- backups e restauração testados
- deploy reproduzível
- health check separado de readiness operacional
- indicação visual explícita de ambiente local, staging ou produção
- documentação atualizada no mesmo job da mudança

---

## 8. Arquitetura alvo

```text
Conceito/briefing
    ↓
FBR Flux API
    ├── projects/cards
    ├── jobs/agent_runs
    ├── handoffs
    ├── blockers
    ├── approvals/gates
    ├── events/heartbeats
    └── artifacts/evidence refs
    ↓
Control Tower / Postgres persistente
    ↓
Dashboard com SSE/WebSocket ou polling controlado
    ↑
Dispatcher Hermes adapter
    ↓
Agents e projetos especializados
```

### Fonte de verdade

```text
produção → banco persistente externo
local     → fixture/JSON para testes
```

Não deve existir fallback silencioso de produção para seed local

### Tabelas mínimas

```text
flux_projects
flux_cards
flux_jobs
flux_agent_runs
flux_agent_events
flux_handoffs
flux_blockers
flux_artifacts
flux_evidence
flux_approvals
flux_gates
flux_audit_events
```

Cada tabela deve ter projeto/tenant, timestamps, correlation_id quando aplicável e owner

---

## 9. Fluxo operacional alvo

```text
1. Sergio fornece ou aprova o conceito
2. Íris normaliza o intake
3. Kora cria projeto, cards, dependências e critérios
4. Flux registra jobs e despacha agents
5. Dispatcher emite accepted/started/progress/heartbeat
6. Agent entrega artefato e Handoff
7. Flux atualiza mini cards e estado
8. Gabe revisa evidência e qualidade
9. Blocker aberto mostra owner e plano de resolução
10. Sergio é chamado somente se houver Gate
11. Execução autorizada acontece no owner correto
12. Sistema executa readback
13. Card só é concluído com evidência
14. Histórico e receipt ficam persistidos
```

---

## 10. Lista organizada de tarefas e subtarefas

### Fase A — Baseline e contrato

#### A1 — Congelar diagnóstico atual

- [ ] registrar commit/branch efetivos
- [ ] registrar quais alterações locais estão não publicadas
- [ ] capturar snapshot atual de cards, Gates, approvals, jobs e Handoffs
- [ ] separar público, local e histórico

**Aceite:** existe um relatório com valores reais, origem e data de cada item

#### A2 — Fechar contrato de domínio

- [ ] definir schemas de Job, AgentRun, Event, Handoff, Blocker, Artifact, Evidence, Approval e Gate
- [ ] definir estados e transições válidas
- [ ] definir idempotency key
- [ ] definir correlation_id
- [ ] definir stale thresholds

**Aceite:** contratos versionados e testados sem campos ambíguos

#### A3 — Fechar contrato de Handoff

- [ ] manter `de`, `para`, `card`, objetivo, entregável, decisões/suposições
- [ ] manter pendências/blockers
- [ ] adicionar owner, ação, plano e evidência de resolução para blockers
- [ ] separar riscos de blockers
- [ ] definir estados `open`, `resolved`, `legacy`, `not_verified`

**Aceite:** nenhum Handoff novo permite blocker aberto sem solução operacional declarada

### Fase B — Persistência confiável

#### B1 — Provisionar schema persistente

- [ ] definir DDL versionado
- [ ] criar tabelas e índices
- [ ] criar foreign keys
- [ ] criar RLS/isolation policies
- [ ] criar migration idempotente
- [ ] validar backup e restore

**Aceite:** duas leituras independentes retornam o mesmo estado após write

#### B2 — Implementar repository externo

- [ ] substituir JSON público como fonte de verdade
- [ ] criar adapter server-side
- [ ] implementar transações
- [ ] implementar optimistic locking ou locking equivalente
- [ ] impedir fallback silencioso para seed
- [ ] sanitizar erros

**Aceite:** approval, Gate, evento, Handoff e job sobrevivem a reload, restart e redeploy

#### B3 — Corrigir aprovação

- [ ] criar approval de teste
- [ ] aprovar com sessão válida
- [ ] ler pela API
- [ ] recarregar a interface
- [ ] reiniciar o processo
- [ ] redeployar ambiente de homologação
- [ ] ler novamente
- [ ] testar ator não autorizado

**Aceite:** `approval-af-001` ou novo approval de teste não retorna a `pending` depois do ciclo completo

### Fase C — Observabilidade em tempo real

#### C1 — Adapter do dispatcher Hermes

- [ ] identificar interface real de eventos disponível no Hermes
- [ ] definir transporte para Flux
- [ ] autenticar o adapter server-side
- [ ] emitir dispatched/accepted/started/progress/heartbeat
- [ ] emitir waiting_input/blocked/handoff_sent/completed/failed/cancelled
- [ ] garantir retry idempotente

**Aceite:** um job de teste aparece no dashboard antes da conclusão e muda de estado durante a execução

#### C2 — Heartbeat e stale

- [ ] registrar last_seen
- [ ] exibir idade da atualização
- [ ] definir stale por job
- [ ] separar stalled de blocked
- [ ] escalar ao owner

**Aceite:** job sem heartbeat fica marcado como stale sem ser falsamente declarado concluído

#### C3 — Dashboard de atividade

- [ ] separar Agents, Handoffs, Cards e Gates
- [ ] exibir mini cards
- [ ] adicionar filtros
- [ ] mostrar origem do dado
- [ ] mostrar limitação de realtime quando aplicável
- [ ] adicionar ordenação por última atualização

**Aceite:** Sergio identifica em uma única tela o que cada agent está fazendo, o que terminou e o que está bloqueado

### Fase D — Blockers e resolução

#### D1 — Classificação

- [ ] risco não entra em blockerCount
- [ ] blocker ativo exige resolução
- [ ] histórico fica legacy
- [ ] ausência de evidência fica not_verified
- [ ] status derivado somente de campos explícitos

#### D2 — Mini card de resolução

- [ ] mostrar causa
- [ ] mostrar owner
- [ ] mostrar ação concreta
- [ ] mostrar plano
- [ ] mostrar evidência esperada
- [ ] permitir registrar resolução
- [ ] registrar evidência da resolução

**Aceite:** nenhuma linha visual intitulada Blocker aparece sem informar quem resolve, como resolve e o que encerra o bloqueio

### Fase E — Build, segurança e deploy

#### E1 — Corrigir build remoto

- [ ] rotacionar secrets expostos
- [ ] remover secrets de Build Args
- [ ] manter secrets somente no runtime Secret Manager
- [ ] obter log interno completo do Next.js sem credenciais
- [ ] reproduzir localmente em imagem Docker
- [ ] corrigir causa raiz
- [ ] repetir build sem cache

**Aceite:** Easypanel conclui `npm run build` e o log não expõe secrets

#### E2 — Publicação técnica do Flux

- [ ] solicitar Sergio Gate para commit/push
- [ ] publicar versão aprovada
- [ ] provisionar env protegido
- [ ] redeployar
- [ ] confirmar health e readiness
- [ ] validar login
- [ ] validar 401 sem sessão
- [ ] validar decisão autenticada
- [ ] validar readback após restart

**Aceite:** a versão pública executa o mesmo contrato validado localmente

### Fase F — E2E After Forty

#### F1 — Banco

- [ ] reconciliar projeto `afterforty`
- [ ] verificar schema `blog_afterforty`
- [ ] verificar tabelas, policies, RLS e isolamento
- [ ] registrar readback com receipt

#### F2 — Aplicação

- [ ] preparar frontend
- [ ] preparar backend
- [ ] conectar conteúdo real
- [ ] configurar ambiente seguro
- [ ] fazer deploy autorizado

#### F3 — Domínio e público

- [ ] validar DNS
- [ ] validar TLS
- [ ] executar Smoke HTTP
- [ ] validar páginas, About Me, categorias e artigos
- [ ] verificar Sources e disclaimer

#### F4 — Readback final

- [ ] testar navegação
- [ ] testar filtros e páginas
- [ ] testar conteúdo
- [ ] testar erros
- [ ] registrar evidências
- [ ] separar implementado, verificado, bloqueado e aguardando Gate

**Aceite:** After Forty só muda para concluído após banco, frontend, backend, conteúdo, QA, deploy, domínio, Smoke e readback comprovados

---

## 11. Gates necessários

### Não exige Gate individual

```text
leitura
pesquisa
rascunho
Handoff rotineiro
heartbeat
mudança rotineira de status
criação de artefato local
testes locais
revisão interna
```

### Exige Sergio Gate específico

```text
migration externa
mudança de arquitetura com impacto
commit/push
redeploy
criação de serviço permanente
DNS/TLS/publicação
gasto/campanha
compra/candidatura
HopLink/afiliado
alteração irreversível
rotação/revogação/ampliação de secret em produção
```

Cada Gate deve conter escopo, impacto, custo, reversibilidade, rollback e readback esperado

---

## 12. Critérios finais de aceite do Agency Flux

O projeto só estará operacional quando todos forem verdadeiros:

- [ ] um briefing gera projeto, cards, jobs e owners
- [ ] agents recebem contexto versionado
- [ ] jobs aparecem antes de terminar
- [ ] progresso e heartbeat são visíveis
- [ ] Handoffs aparecem em mini cards
- [ ] riscos não são contados como blockers
- [ ] todo blocker aberto tem solução, owner e evidência esperada
- [ ] Gates são separados de atividade rotineira
- [ ] Sergio aprova apenas decisões de impacto
- [ ] actor não pode ser falsificado no body
- [ ] estado persiste após reload, restart e redeploy
- [ ] duas leituras independentes coincidem
- [ ] eventos têm correlation_id
- [ ] transições inválidas falham fechado
- [ ] conclusão exige evidência
- [ ] dados são isolados por projeto
- [ ] secrets não aparecem em nenhum artefato
- [ ] build remoto passa
- [ ] E2E remoto executa e tem readback
- [ ] a interface informa claramente ambiente e limitações

---

## 13. Definição de pronto

```text
PRONTO = implementado + testado + persistente + observável + autorizado quando necessário + verificado por readback
```

Não são suficientes:

```text
mock
seed
build verde
HTTP 200
relatório de agent
aprovação simulada
página sem interação
```

---

## 14. Riscos, causas e soluções

| Problema | Causa verificável | Solução no mesmo ciclo |
|---|---|---|
| Approval volta a pending | JSON local/estado efêmero como fonte pública | repository externo transacional + teste após redeploy |
| Muitos blockers | riscos e pendências históricas rotulados como blocker | modelo explícito open/resolved/legacy + separação de risco |
| Blocker sem solução | Handoff não exige owner/plano/evidência de resolução | contrato obrigatório de resolução |
| Dashboard não mostra execução viva | dispatcher Hermes sem adapter de eventos | adapter com eventos, heartbeat e transporte documentado |
| Build remoto falha sem diagnóstico | Easypanel mostra somente resumo | capturar log interno, reproduzir Docker e corrigir causa raiz |
| Estado local diverge do público | código/estado local não foi publicado ou persistido externamente | pipeline com Gate, deploy e readback obrigatório |
| Conclusões prematuras | build/teste local confundido com E2E | matriz de aceite separando local, remoto e público |

---

## 15. Próximo ciclo recomendado

A ordem executável é:

```text
1. preservar o inventário
2. rotacionar secrets expostos
3. corrigir build remoto com log completo
4. fechar contrato e schema de persistência
5. migrar approvals/events/jobs/Handoffs
6. conectar dispatcher Hermes
7. validar mini cards e blockers
8. executar E2E local completo
9. Sergio Gate para commit/push
10. Sergio Gate para redeploy
11. E2E remoto com readback
12. After Forty
```

Enquanto os itens 3, 5 e 6 não forem concluídos, o FBR Agency Flux deve ser classificado como:

```text
BASE LOCAL FUNCIONAL
NÃO OPERACIONAL COMPLETO
```

---

## 16. Handoff de decisão para Sergio

```yaml
from: David
para: Sergio
card: FLUX-PRD-001
objetivo_do_job: fechar o PRD operacional do FBR Agency Flux com inventário real e plano executável
entregavel: 02-prd/PRD-Agency-Flux-operacional.md
decisoes_tomadas:
  - Flux é camada transversal e não substitui owners dos projetos
  - visibilidade é obrigatória; aprovação não é necessária para cada atividade
  - Handoffs e atividade rotineira aparecem em mini cards
  - Gates ficam restritos a decisões de impacto
  - blocker deve mostrar solução, owner e evidência de encerramento
  - JSON local não é fonte de verdade pública
pendencias_e_blockers:
  - build remoto falha sem causa interna no log fornecido
  - persistência pública de approvals não foi comprovada
  - dispatcher Hermes ainda não está conectado ao Flux
  - E2E remoto e After Forty público não foram concluídos
precisa_de_gate: false para leitura e revisão deste PRD; true para as ações externas listadas no documento
criterios_de_aceite:
  - inventário detalhado incluído
  - situação atual separada por estado
  - proposta de valor incluída
  - requisitos funcionais e não funcionais incluídos
  - tarefas e subtarefas ordenadas
  - cada bloqueio possui causa e solução
  - critérios E2E verificáveis incluídos
evidencia:
  - README.md
  - 03-arquitetura/criterio-e2e-operacional.md
  - 08-historico/overnight-delivery-readiness.md
  - 08-historico/agent-activity-observability.md
  - 09-codigo/src/lib/flux-repository.ts
  - 09-codigo/src/app/dashboard-client.tsx
status: DRAFT_FOR_VALIDATION

## Estado local — Jobs operacional e home executiva (2026-09-14)
- Implementado `/jobs` humano e operacional: resumo real por status/origem/live-historical/stale/activeBlocker, filtros por projeto/card/agent/status/owner/origem/ciclo/stale/blocker, prioridade limitada a 6, lista completa e painel de detalhe.
- O detalhe distingue explicitamente `review`, `blocked`, `stale`, `historical`, `filesystem readback` e `realtime`, preservando objective, role, timestamps, lastSeen, progress, currentStep, artefatos, evidências, Handoffs, riscos, blockers, nextStep, correlationId e source.
- Ações locais disponíveis apenas com dados declarados: retomada de job histórico usa owner/nextStep existentes; encaminhamento exige owner/nextStep e blocker ativo; readback não conclui trabalho nem inventa owner.
- Home limitada a resumo executivo, projetos/cards prioritários, gates pendentes/recentes, atenção e últimos cinco eventos, com links `/handoffs` e `/jobs`.
- Critérios automatizados em `09-codigo/tests/jobs-ui.test.ts`: contagens, filtros, limite de seis, detalhe, distinção histórico/live e stale/readback.
- Pendência de validação: execução da suíte completa, typecheck, lint, build e Docker Smoke devem ser registrados no histórico após rodar.
```
