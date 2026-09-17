# PRD — FBR Agency Flux v1.5

## Status
`DRAFT_EXECUTAVEL` | objetivo: transformar o Control Tower parcial em uma experiência demonstrável, limpa e operacionalmente honesta.

## Objetivo

Entregar uma versão que Sergio consiga demonstrar ao sócio como sistema de gestão transversal da FBR Agency, sem histórico confundindo o presente, sem ações mortas e sem alegar autonomia que não existe.

## Resultado esperado

Um novo projeto deve seguir:

```text
briefing
→ projeto/tenant
→ Sprint/Stories
→ cards/jobs
→ dependências
→ execução ou HOLD
→ Handoff/evidência
→ QA/Gate
→ readback
```

## Dentro do escopo v1.5

- Dashboard demonstrável com separação atual/histórico.
- Projetos, Sprints e Stories como entidades navegáveis.
- Intake genérico com preview antes de persistir.
- Handoff/blocker sem duplicação visual.
- Jobs com prioridade, dependência e próximo check.
- Worker local operacional com ciclo explícito e status honesto.
- Observabilidade e receipts visíveis.
- Auth persistente ou limitação claramente apresentada.
- Multi-tenant por tenant wildcard seguro.
- E2E local demonstrável do After Forty.
- Runbook de deploy, migration, rollback e apresentação.

## Fora de escopo ou dependente de Gate

- Publicação de conteúdo.
- Gasto, campanha, compra ou HopLink.
- DNS/TLS de novos domínios.
- Migration destrutiva.
- Uso ou rotação de secrets sem registro no Secret Manager.
- Alegação de dispatcher Hermes/heartbeat real sem receipt.

## Stories e critérios

### S15-01 — Separar estado atual de histórico

**Owner:** Théo/Kora.  
**Aceite:** Home, Handoffs e Jobs exibem primeiro somente registros não históricos; histórico fica em filtro/aba explícita; contagens atuais não somam legado.

### S15-02 — Corrigir cards na Home

**Owner:** Théo.  
**Aceite:** cards são indexados por `project.id`; projeto cujo nome difere do id exibe seus cards prioritários.

### S15-03 — Entidade Sprint

**Owner:** Íris/Kora/Théo.  
**Aceite:** Sprint tem id, objetivo, status, owner, início, fim, dependências e projeto/tenant; aparece na UI e no snapshot.

### S15-04 — Entidade Story

**Owner:** Íris/Kora/Théo.  
**Aceite:** Story tem id, Sprint, objetivo, owner, aceite, status, cards/jobs associados e evidência.

### S15-05 — Navegação Sprints/Stories

**Owner:** Théo.  
**Aceite:** nova tela permite filtrar por projeto, Sprint, status e owner; mostra progresso e bloqueios.

### S15-06 — Intake com preview

**Owner:** Íris/Théo.  
**Aceite:** usuário visualiza projeto, cards, jobs, dependências e critérios antes de persistir; persistência só ocorre após submit autenticado.

### S15-07 — Resumo executivo acionável

**Owner:** Kora/Théo.  
**Aceite:** Home responde: o que está atrasado, quem é o owner, próxima ação, decisão de Sergio, blockers e próximo check.

### S15-08 — Handoffs ativos primeiro

**Owner:** Kora/Théo.  
**Aceite:** filtro padrão exclui legacy; histórico é acessível por filtro explícito; detalhe mostra ciclo, Sprint, Story e blockers.

### S15-09 — Blocker sem duplicação

**Owner:** Théo/Gabe.  
**Aceite:** um Handoff renderiza um Chat por Handoff ou lista identificada por blocker; nunca aparecem botões idênticos sem contexto.

### S15-10 — Jobs com next check

**Owner:** Kora/Íris.  
**Aceite:** cada job não concluído mostra owner, próxima ação, nextCheck, motivo de espera e fallback.

### S15-11 — Worker operacional local

**Owner:** Íris/Théo.  
**Aceite:** `worker:iris --once` atualiza required actions, ciclos, holds e eventos; a UI mostra data do último ciclo e próximo ciclo.

### S15-12 — Dispatcher demonstrável

**Owner:** Théo.  
**Aceite:** fake adapter demonstrável permite disparar evento, atualizar job e ler receipt; integração real permanece explicitamente marcada como externa quando não configurada.

### S15-13 — Auth persistente/RBAC

**Owner:** Théo/Gabe.  
**Aceite:** sessão não desaparece silenciosamente após restart em homologação; tenant e roles são server-side; cross-tenant falha.

### S15-14 — Receipts e timeline

**Owner:** Gabe/Kora.  
**Aceite:** cada mutação relevante tem receipt visível e timeline de eventos no detalhe.

### S15-15 — E2E local After Forty

**Owner:** Gabe.  
**Aceite:** intake → Sprint/Stories → jobs → Handoff/blocker → readback → reload é reproduzível com evidências.

### S15-16 — Segurança de secrets

**Owner:** Théo/Sergio.  
**Aceite:** service role exposta é rotacionada; nenhum secret aparece em Git, logs, PRD, resposta ou painel público.

### S15-17 — Smoke de apresentação

**Owner:** Gabe/Kora.  
**Aceite:** roteiro de 5 minutos valida login, dashboard, projeto, Sprint, Story, Job, Handoff, blocker, receipt e limitações.

### S15-18 — Runbook de operação

**Owner:** Théo.  
**Aceite:** documento contém deploy, migration, env, rollback, health, readback, backup, incidente e Gate.

## Ordem de execução

```text
S15-01 + S15-02
→ S15-03 + S15-04
→ S15-05 + S15-06
→ S15-07 + S15-08 + S15-09 + S15-10
→ S15-11 + S15-12 + S15-14
→ S15-13 + S15-16 + S15-18
→ S15-15
→ S15-17
→ QA independente
```

## Definition of Done v1.5

- [ ] Não há histórico confundido com operação atual.
- [ ] Home exibe cards corretamente.
- [ ] Sprints e Stories são rastreáveis.
- [ ] Intake gera plano e preview.
- [ ] Handoffs e blockers são operáveis sem duplicação.
- [ ] Jobs têm owner, nextCheck e dependência.
- [ ] Worker e dispatcher têm evidência real ou limitação explícita.
- [ ] Receipts aparecem no detalhe.
- [ ] E2E local After Forty passa.
- [ ] Secrets estão rotacionados e ausentes dos artefatos.
- [ ] Smoke de apresentação passa.
- [ ] QA independente aprova o código local.
- [ ] Gates externos continuam separados de implementação local.
