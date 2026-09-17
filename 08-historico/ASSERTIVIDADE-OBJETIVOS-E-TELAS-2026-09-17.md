# Auditoria de assertividade — objetivos globais e telas do Agency Flux

**Data:** 2026-09-17  
**Tarefa:** FLUX-007  
**Método:** confronto entre objetivos/contratos do Flux, código local e leitura textual das telas públicas em `https://agency.fbr.news/`.  
**Escopo:** Dashboard, Handoffs e Jobs.  

## 1. Critério de assertividade adotado

A conclusão de uma tarefa não depende apenas de a peça existir ou de o código estar verde. A pergunta obrigatória é:

> Esta entrega atende às expectativas do briefing? Realiza o que o usuário precisa? Coopera de forma efetiva para os objetivos globais do projeto?

Uma tela é assertiva quando permite ao usuário identificar a situação correta, decidir o próximo passo, executar ou encaminhar a ação permitida e verificar o resultado sem reconstruir o contexto por fora do sistema.

## 2. Objetivos globais do Agency Flux

1. **Coordenar transversalmente os projetos da FBR Agency**, sem ficar limitado a um projeto, blog ou agente.
2. **Transformar briefing em execução rastreável:** intake → projeto/tenant → Sprint/Story → cards/jobs → dependências → execução ou HOLD → Handoff/evidência → QA/Gate → readback.
3. **Dar ao usuário uma visão operacional real**, respondendo o que está acontecendo agora, o que está atrasado, quem é o owner, qual é a próxima ação e quando deve ocorrer o próximo check.
4. **Reduzir procedimentos manuais básicos**, tornando fluida a passagem de contexto, a atribuição, o acompanhamento, o encaminhamento e o readback.
5. **Preservar ownership e responsabilidade**, deixando claro quem deve agir, qual resultado deve produzir e para quem a entrega segue.
6. **Evitar perda de contexto nos Handoffs**, com objetivo, feito, riscos, dependências, critérios de aceite, evidência e próximo responsável.
7. **Tratar blockers como trabalho executável**, não como notas passivas: causa, owner, próxima ação, plano, evidência e fallback.
8. **Controlar Jobs**, distinguindo planejado, em execução, HOLD, revisão, falha, concluído e histórico, com dependências e próximo check.
9. **Governar Gates e decisões de Sergio**, separando decisão, autorização, execução e verificação; nenhuma aprovação local deve ser confundida com mutação externa.
10. **Produzir rastreabilidade**, com eventos, receipts, correlation IDs, artifacts, evidências e readback.
11. **Operar múltiplos projetos e tenants com isolamento**, sem cross-tenant e sem dashboard preso a um único projeto.
12. **Automatizar de forma honesta**, com worker, dispatcher, heartbeat e retry quando comprovados; quando não comprovados, a limitação precisa estar visível.
13. **Separar presente de histórico**, para que legado não pareça atividade atual nem distorça contagens.
14. **Apoiar decisão executiva**, permitindo ao sócio entender em poucos minutos estado, riscos, gargalos, progresso e próximos passos.
15. **Ser uma fonte de verdade operacional**, e não apenas uma interface de consulta de JSON ou um catálogo de registros antigos.

## 3. Dashboard

### O que o Dashboard deveria fazer

- apresentar projetos atuais e cards prioritários;
- mostrar cards/jobs/Handoffs atuais separados do histórico;
- destacar atrasos, HOLDs, blockers, gates e decisões pendentes;
- exibir owner, próxima ação e próximo check;
- apontar o usuário para a ação seguinte;
- mostrar eventos e receipts suficientes para confiar no estado;
- navegar para Jobs, Handoffs e Sprints/Stories;
- funcionar agregado para múltiplos projetos permitidos.

### Evidência pública observada

A tela pública respondeu com:

- `Gates pendentes: 0`;
- `Cards ativos: 2`;
- `Atenção necessária: 0`;
- `Jobs: 2`;
- projeto `After Forty` como `Planejado`;
- `Nenhum blocker aberto`;
- `0 Handoffs aguardando owner`;
- `0 jobs stale`;
- `0 ações em HOLD`;
- `Íris ainda não executou ciclo`;
- navegação pública visível apenas para `Handoffs` e `Jobs`.

### Avaliação

**Classificação: NÃO ATENDE para apresentação como Dashboard operacional completo.**

A tela é legível e comunica uma situação básica, mas não coopera efetivamente com os objetivos globais porque:

1. mostra somente uma fotografia pobre do estado, sem evidenciar o fluxo completo;
2. não apresenta Sprints/Stories na navegação pública observada;
3. não fornece uma ação concreta para o usuário iniciar ou acompanhar a cadeia briefing → execução;
4. apresenta `0` em atenção, HOLD e blockers, embora existam dezenas de registros históricos e trabalho planejado;
5. não permite concluir se o sistema está saudável ou simplesmente sem eventos atuais;
6. não demonstra worker/dispatcher em funcionamento — apenas informa que Íris ainda não executou ciclo;
7. a tela pública não aparenta ser a mesma versão do código local v1.5, que possui navegação para Sprints/Stories e labels mais recentes.

### O que atende parcialmente

- projeto multi-projeto/tenant no modelo local;
- cards por projeto;
- métricas básicas;
- acesso a Handoffs e Jobs;
- mensagem honesta de `sem efeito externo`;
- leitura pública sem login.

### Ajustes necessários

- publicar a versão v1.5 auditada antes de apresentar;
- criar um bloco explícito `Estado atual` com projetos, Sprints, Stories, Jobs, Handoffs, blockers e gates atuais;
- separar visualmente `Histórico` e `Atividade atual`;
- mostrar `último ciclo do worker`, `próximo ciclo`, `último evento` e `readback`;
- transformar cada alerta em link/ação diretamente utilizável;
- mostrar `não verificado` quando não houver atividade, em vez de permitir que zeros pareçam saúde;
- incluir Sprints/Stories na navegação pública;
- mostrar owner, nextAction e nextCheck no resumo do projeto.

## 4. Handoffs

### O que a tela deveria fazer

- listar primeiro Handoffs atuais e acionáveis;
- permitir busca/filtros por status, owner e projeto;
- abrir contexto completo sem conversa externa;
- mostrar de/para, objetivo, feito, risco, dependência, aceite, evidência, próxima ação e próximo check;
- permitir retomar ou encaminhar um blocker com formulário executável;
- deixar claro o que é histórico;
- apresentar um único Chat contextual por Handoff/blocker;
- registrar receipt e readback após a mutação.

### Evidência pública observada

A tela pública apresentou:

- `Todos os Handoffs (53)`;
- filtro `Histórico` desmarcado;
- os registros exibidos identificados como `Histórico`;
- todos os Handoffs observados pertencentes ao `After Forty`/`AF-001`;
- ausência de Handoffs atuais acionáveis na listagem observada.

### Avaliação

**Classificação: NÃO ATENDE no ambiente público atual; ATENDE PARCIALMENTE no código local v1.5.**

No código local, o filtro padrão exclui `historical` e `legacy`, há busca, filtros, detalhe, ações de retomar/encaminhar e um Chat por Handoff. Isso é alinhado ao objetivo.

No ambiente público, porém, o comportamento observado contradiz esse contrato: com `Mostrar histórico` desmarcado, os 53 itens exibidos aparecem como históricos. Isso indica uma destas condições, que precisam ser tratadas como bloqueio até readback:

- deploy público não contém a implementação local v1.5;
- estado público não possui Handoffs atuais e a tela não comunica adequadamente essa ausência;
- o filtro/normalização do runtime público diverge do código auditado.

Em qualquer hipótese, o usuário não consegue usar Handoffs públicos para continuar uma operação atual de forma assertiva.

### O que atende parcialmente

- o propósito da tela está claro: continuidade operacional;
- há busca por contexto;
- há filtros por status, owner e projeto;
- há separação conceitual de histórico;
- o contrato de encaminhamento tem campos necessários;
- a duplicação do botão de Chat foi corrigida no código local.

### Ajustes necessários

- garantir que a versão implantada execute o filtro ativo-first;
- criar estado vazio explícito: `Nenhum Handoff atual`; não misturar isso com 53 registros legados;
- exibir contagem atual e histórica separadamente;
- mostrar Sprint, Story, nextCheck, receipt e último evento no detalhe;
- garantir readback real após encaminhar/retomar;
- impedir que a tela pareça operacional quando só há arquivo histórico.

## 5. Jobs

### O que a tela deveria fazer

- mostrar o trabalho atual antes do histórico;
- distinguir planejado, execução real, HOLD, revisão, concluído, falho e não verificado;
- exibir agente, objetivo, projeto, card, etapa, status, progresso, dependências, owner, próxima ação e nextCheck;
- indicar stale/heartbeat com significado;
- permitir atualizar progresso ou encaminhar para owner sem marcar conclusão indevida;
- permitir abrir detalhes técnicos e readback sem obrigar o operador a ler JSON;
- evitar que Jobs históricos dominem a visão executiva.

### Evidência pública observada

A tela pública mostrou:

- `Total: 60`;
- `Planejados: 2`;
- `Em execução: 0`;
- `HOLD: 0`;
- `Concluídos: 5`;
- `Histórico: 58`;
- `Stale: 0`;
- `Blockers ativos: 0`.

A maioria dos Jobs exibidos aparece como `Histórico`, com `etapa não declarada` e última atividade em `2026-09-16T00:02:34Z`. Os dois Jobs atuais aparecem como `Planejado`.

### Avaliação

**Classificação: ATENDE PARCIALMENTE no desenho local; NÃO ATENDE como cockpit operacional público atual.**

Pontos positivos locais:

- métricas executivas;
- filtros por projeto, card, agente, status e owner;
- classificação planejado/histórico/em execução;
- cards prioritários;
- detalhe com dependências, próxima ação, owner e evidências;
- ações que não presumem conclusão;
- indicação de sessão necessária para mutação.

Falhas que impedem assertividade:

1. `nextCheck` existe no contrato de `AgentRun`, mas não aparece no detalhe visível da tela local observada;
2. a listagem pública mostra `etapa não declarada` repetidamente;
3. 58 históricos dominam a tela contra apenas 2 planejados;
4. `0 em execução` e `0 stale` não provam operação saudável — podem significar ausência de worker/live events;
5. a tela não informa claramente por que os 2 Jobs planejados não começaram;
6. não há dependência/nextCheck visível no primeiro nível, justamente o que permite ação rápida;
7. a versão pública parece desatualizada em relação ao código local.

### Ajustes necessários

- mostrar somente Jobs atuais por padrão e dar filtro histórico explícito;
- exibir nextCheck, motivo de espera, dependências e fallback na linha prioritária;
- marcar planejado sem início como `aguardando dispatcher/owner`, não apenas `Planejado`;
- exibir fonte do estado: live, local ou filesystem;
- mostrar `último heartbeat` e `próximo follow-up` separados;
- criar empty state operacional para ausência de Jobs live;
- publicar e validar a versão local v1.5 no ambiente público.

## 6. Diagnóstico global

A fundação local avançou, mas a peça demonstrada ao usuário ainda não coopera efetivamente para o objetivo global do Agency Flux. O maior problema atual não é somente uma tela incompleta: é a divergência entre implementação local e ambiente público.

**Fato verificado:** localmente existem contratos v1.5 para Sprints/Stories, histórico atual, receipts e filtros.  
**Fato verificado:** publicamente foram observados 53 Handoffs históricos e 60 Jobs, dos quais 58 históricos e 2 planejados.  
**Conclusão:** não é seguro apresentar o ambiente público como sistema de gestão operacional completo.  
**Bloqueio:** QA independente, deploy da versão auditada e readback público ainda faltam.  

## 7. Decisão de assertividade

| Peça | Código local v1.5 | Ambiente público observado | Coopera com os objetivos globais? |
|---|---|---|---|
| Dashboard | Parcialmente | Não atende | Não ainda |
| Handoffs | Parcialmente/boa base | Não atende | Não ainda |
| Jobs | Parcialmente/boa base | Não atende | Não ainda |

## 8. Próximo ajuste prioritário

Antes de qualquer apresentação, deve ser executado um vertical slice público verificável:

```text
After Forty
→ Sprint/Story atual
→ Job planejado com owner e nextCheck
→ execução/hold explícito
→ Handoff atual
→ blocker ou evidência
→ receipt/readback
→ Dashboard refletindo a mudança
```

Se essa cadeia não puder ser lida de volta no ambiente público, a tela não deve ser apresentada como operação concluída.

## 9. Aprendizado registrado

A existência de filtros, entidades e contratos no código não garante assertividade. A unidade correta de verificação é a jornada que o usuário precisa executar no ambiente em que fará a demonstração. O próximo trabalho deve priorizar a reconciliação local → deploy → estado externo → interface → readback antes de expandir funcionalidades.
