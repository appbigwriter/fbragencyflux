# Roteiro executivo — reunião com o sócio

**Projeto:** FBR Agency Flux  
**Duração máxima:** 10 minutos  
**Data:** 2026-09-17  
**Objetivo:** apresentar o estado real do Flux, separar fundação local de operação pública e obter decisão sobre os próximos gates.

## Mensagem central

> O Flux já tem uma fundação local de contratos, estados, filtros, Handoffs, Jobs, Sprints/Stories, evidências e gates. Porém, o ambiente público auditado ainda não comprova uma operação completa. A divergência local → público é o principal bloqueio; não devemos vender autonomia, deploy ou E2E remoto como concluídos.

---

## 0:00–1:00 — Problema empresarial

**Fala sugerida:**

A FBR coordena projetos, agentes, entregas e decisões que atravessam várias frentes. Sem uma camada comum, o briefing se perde entre conversas, responsáveis, Jobs, bloqueios, Handoffs e aprovações. O custo é retrabalho, falta de clareza sobre o próximo passo e dificuldade para o sócio saber, em poucos minutos, o que está acontecendo e o que exige decisão.

O problema que o Flux pretende resolver é transformar briefing em execução rastreável: projeto/tenant, Sprint/Story, card ou Job, owner, dependências, execução ou HOLD, Handoff, evidência, QA/Gate e readback.

**Não dizer:** que esse fluxo já funciona integralmente no ambiente público.

## 1:00–2:00 — O que o sistema já resolve localmente

**Fato baseado na auditoria e no código local v1.5:**

- modelo para múltiplos projetos/tenants, cards e métricas básicas;
- contratos locais para Sprints/Stories, histórico versus atividade atual, receipts e filtros;
- Handoffs com busca, filtros, detalhe e ações de retomar/encaminhar;
- Jobs com classificação de estado, filtros por projeto/card/agente/status/owner, dependências, próxima ação e evidências;
- estrutura de ownership, gates e separação entre decisão, autorização, execução e verificação;
- mensagem explícita de **sem efeito externo** quando a ação não altera um sistema externo;
- leitura pública sem login para as telas auditadas.

**Formulação correta:** isso é uma boa base local parcialmente alinhada aos objetivos; não é prova de operação E2E remota.

## 2:00–3:30 — Demonstração vertical possível

### Vertical slice a demonstrar, somente com readback verificável

```text
After Forty
→ Sprint/Story atual
→ Job planejado com owner e nextCheck
→ execução ou HOLD explícito
→ Handoff atual
→ blocker ou evidência
→ receipt/readback
→ Dashboard refletindo a mudança
```

**Sequência da demonstração:**

1. Abrir o projeto **After Forty** e mostrar o contexto do Sprint/Story.
2. Mostrar um Job com owner, dependências, próxima ação e `nextCheck`.
3. Mostrar a distinção entre planejado, execução, HOLD, revisão, falha e concluído; se não houver execução real, marcar como **planejado/aguardando dispatcher ou owner**, não como executando.
4. Abrir um Handoff e mostrar objetivo, feito, riscos, dependências, aceite, evidência e próximo responsável.
5. Mostrar blocker ou evidência e o receipt/readback correspondente.
6. Voltar ao Dashboard e confirmar se o estado exibido mudou de forma coerente.

**Regra de apresentação:** se a cadeia não puder ser lida de volta no ambiente público, demonstrá-la apenas como fluxo local/proposto e declarar o bloqueio. Não apresentar uma tela estática, seed ou registro histórico como execução viva.

## 3:30–5:00 — Evidências observadas

### Evidência local

A auditoria registra que o código local v1.5 possui contratos para Sprints/Stories, filtros, histórico atual, receipts e ações de Handoff. Isso comprova a existência da fundação e dos contratos; não comprova, isoladamente, operação externa.

### Evidência pública auditada

Na leitura textual de `https://agency.fbr.news/` foram observados:

- Dashboard: `Gates pendentes: 0`, `Cards ativos: 2`, `Atenção necessária: 0`, `Jobs: 2`, projeto **After Forty** como `Planejado`, nenhum blocker aberto, `0 Handoffs aguardando owner`, `0 jobs stale`, `0 ações em HOLD` e `Íris ainda não executou ciclo`;
- Handoffs: `Todos os Handoffs (53)`, com os registros observados identificados como históricos e pertencentes a After Forty/AF-001;
- Jobs: `Total: 60`, `Planejados: 2`, `Em execução: 0`, `HOLD: 0`, `Concluídos: 5`, `Histórico: 58`, `Stale: 0`, `Blockers ativos: 0`;
- a maioria dos Jobs exibidos era histórica, com `etapa não declarada`; os dois atuais apareciam como planejados.

**Leitura executiva:** esses zeros não provam saúde operacional; podem significar ausência de eventos atuais, worker ou dispatcher não comprovado. A versão pública também aparenta divergir do código local v1.5.

## 5:00–6:30 — Limitações públicas atuais

- O Dashboard público é uma fotografia básica, não um cockpit operacional completo.
- A navegação pública observada não evidenciou Sprints/Stories.
- Handoffs atuais acionáveis não foram comprovados; a listagem mostrou registros históricos apesar de o filtro de histórico estar desmarcado.
- Jobs históricos dominam a visão pública: 58 históricos contra 2 planejados.
- Não foi comprovado worker/dispatcher, heartbeat, retry, execução viva ou ciclo da Íris.
- A tela pública não explica por que os Jobs planejados não começaram.
- `nextCheck`, dependências, fallback e fonte do estado não estão suficientemente visíveis no primeiro nível público.
- Não há readback público comprovado após uma mutação operacional.
- Faltam QA independente, publicação da versão auditada e validação do estado externo.

**Classificação honesta da auditoria:** Dashboard, Handoffs e Jobs atendem parcialmente no desenho/código local e **não atendem ainda** como operação pública completa.

## 6:30–7:30 — O que não prometer

Não prometer nem insinuar que:

- o Flux é autônomo ou opera agentes sem intervenção/configuração comprovada;
- worker, dispatcher, heartbeat ou retry estão funcionando em produção;
- o deploy público contém a versão local v1.5;
- existe operação E2E remota concluída;
- Jobs planejados já foram executados;
- zeros de blockers, HOLD, stale ou execução representam saúde do sistema;
- Handoffs, Jobs e Dashboard públicos são fonte de verdade operacional;
- uma aprovação local equivale a execução ou verificação externa;
- há integração externa, mutação, publicação ou deploy concluídos sem receipt e readback;
- a existência de contratos e telas equivale à entrega do objetivo empresarial.

## 7:30–9:30 — Próximos gates

### Gate 1 — Reconciliação local → público

- **Critério:** publicar a versão local v1.5 auditada ou documentar exatamente a versão pública vigente.
- **Prova:** versão/commit identificável, health check e leitura das telas públicas.
- **Owner sugerido:** Theo, com QA de Gabe.
- **Bloqueio atual:** divergência entre código local e ambiente público.

### Gate 2 — Vertical slice público

- **Critério:** concluir a cadeia After Forty → Sprint/Story → Job → execução/HOLD → Handoff → evidência/blocker → receipt/readback → Dashboard.
- **Prova:** evidência de cada transição e leitura de volta no ambiente público.
- **Regra:** sem readback, não declarar concluído.

### Gate 3 — Assertividade das telas

- **Critério:** separar atividade atual de histórico; mostrar estado vazio honesto; exibir owner, próxima ação, `nextCheck`, dependências, fallback, fonte do estado, último evento/heartbeat e próximo follow-up.
- **Prova:** roteiro de QA reproduzível nas três telas.

### Gate 4 — Operação e governança

- **Critério:** comprovar, separadamente, worker/dispatcher, eventos, retry/heartbeat, permissões, isolamento por projeto/tenant e gates humanos.
- **Prova:** logs sanitizados, correlation ID, artifacts, receipts e testes de isolamento.
- **Não presumir:** configuração é diferente de operação verificada.

### Gate 5 — Decisão executiva

- **Decisão a solicitar ao sócio:** aprovar o foco na reconciliação e no vertical slice antes de expandir funcionalidades, ou aceitar formalmente uma apresentação restrita à fundação local.

## 9:30–10:00 — Fechamento

**Fala sugerida:**

O investimento feito já produziu uma fundação local útil para governança e coordenação. O próximo valor não está em adicionar mais telas, mas em provar uma jornada completa no ambiente que o usuário verá. Até que os gates sejam cumpridos, a descrição correta é: **fundação local parcialmente implementada, ambiente público ainda não validado como operação E2E**.

## Referência e rastreabilidade

- Fonte principal: `F:/Projetos/_FBR/FBR Agency Flux/08-historico/ASSERTIVIDADE-OBJETIVOS-E-TELAS-2026-09-17.md`.
- Auditoria: FLUX-007, realizada em 2026-09-17, por confronto entre objetivos/contratos, código local e leitura textual das telas públicas.
- Fatos, limitações e gates deste roteiro devem ser atualizados somente após nova evidência objetiva e readback.
