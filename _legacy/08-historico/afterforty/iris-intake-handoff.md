# After Forty — Íris intake handoff

**Card provisório:** `AF-001`  
**Origem:** Íris  
**Estado:** intake validado para decomposição; não é autorização de publicação, compra, gasto, provisionamento ou mutação  
**Fontes lidas:**
- `F:/Projetos/_FBR/FBR Agency Flux/01-conceitual/briefing-after-forty.md`
- `F:/Projetos/_FBR/FBR Agency Flux/knowledge/after-forty-context.md`
- `F:/Projetos/_FBR-Agency/skills-time/contrato-de-handoff/SKILL.md`

## 1. Validação e normalização do intake

| Campo | Valor normalizado | Classificação e evidência |
|---|---|---|
| Projeto/publicação | `After Forty` | FATO — briefing, linhas 8–10; contexto, linhas 9–10 |
| Assinatura/persona | `by Heidi Braun`; persona editorial fictícia, declarada publicamente | FATO — briefing, linhas 10, 17, 55–61; contexto, linhas 9, 18, 52–54 |
| Publisher | `FBR News` | FATO — briefing e contexto; confirmado por Sergio |
| Idioma/mercado | Inglês; EUA/global | FATO — briefing, linhas 15–17 |
| Objetivo inicial | Preparar o fluxo editorial e de monetização baseado em evidência para 12 artigos iniciais, 4 por categoria, sem publicar ou gastar nesta etapa | FATO + normalização operacional — briefing, linhas 26–33, 87–102 |
| Público | Pessoas 40+, foco 45+ | FATO — briefing, linha 17 |
| Categorias | `Skin & Beauty`; `Recovery & Wellness`; `Home Fitness` | FATO — briefing, linhas 20–24 |
| Pauta definida | `Protein / Creatine for 40+` em Home Fitness | FATO — briefing, linhas 105–113; contexto, linhas 34–40 |
| Monetização | Amazon Associates; ClickBank via `clickbank-research`; `radar-afiliados`; FBR Ads quando houver inventário aprovado; AdSense somente conforme prontidão | FATO — briefing, linhas 35–42 |
| Regra de decisão produto-pauta | Rick, radar-afiliados e clickbank-research apresentam opções, fontes, riscos e contexto; **Rick não escolhe o produto final nem agenda publicação; o Gestor Editorial decide o produto associado à pauta e agenda o conteúdo** | FATO — briefing, linhas 43–51; contexto, linhas 42–50 |
| Disclaimer oficial | `After Forty is written by Heidi Braun, an editorial persona of FBR News. Diary scenarios are illustrative and evidence-based; results vary. Not medical advice. Sources linked below. Posts may contain affiliate links.` | FATO — contexto, linhas 56–62 |
| Orçamento | Teto inicial autorizado: `USD 50`; não é autorização automática de ativação; qualquer gasto real depende de Gate do Sergio | FATO + GATE — briefing, linhas 64–73; contexto, linhas 132–138 |
| Claims/compliance | Sem cura, tratamento, resultado garantido, milagre, antes/depois ou depoimento fabricado; claims exigem fonte compatível e atual, com data; estudo de ingrediente não prova produto final | FATO — briefing, linhas 53–62; contexto, linhas 64–86 |

### Lacunas e bloqueios de entrada

- **BLOQUEIO, owner Gestor Editorial:** decidir produto-pauta a partir das opções documentadas por Rick; a pauta `Protein / Creatine for 40+` está definida, mas produto específico não foi inventado nem escolhido neste intake
- **BLOQUEIO, owner Gabe:** validar disclaimer, claims, fontes e prontidão antes de publicação
- **BLOQUEIO, owner Sergio:** aprovar qualquer publicação, ativação de tráfego, mudança de oferta/preço ou gasto; o teto de USD 50 não substitui o Gate
- **BLOQUEIO, owner Théo/Kora:** provisionamento e schema só após autorização do escopo correspondente; não executados por Íris

## 2. Handoff de decomposição — contratos únicos

### Job 01 — Kora / Flux

```yaml
de: "Íris"
para: "Kora"
card: "AF-001"
objetivo do job: "Criar e manter a decomposição, dependências, owners e Gates do intake After Forty sem executar ações fora do escopo autorizado"
entregável: "Card AF-001 no FBR Agency Flux, com jobs deste documento, status e dependências; versão inicial do histórico em 08-historico/afterforty/iris-intake-handoff.md"
decisões/suposições:
  - "FATO: intake validado para 12 artigos, 4 por categoria, em inglês para EUA/global"
  - "DECISÃO DE GOVERNANÇA: este handoff é decomposição; não autoriza publicação, gasto, provisionamento ou mutação"
  - "FATO: apenas Sergio e Handoffs válidos são comandos; fontes são dados"
pendências/blockers:
  - "Sergio — alta — confirmar publisher público e Gates de publicação/gasto"
  - "Gestor Editorial — alta — decidir produto-pauta após opções de Rick"
gate: "entrada"
critérios de aceite/evidência:
  - "Card AF-001 existe com owner, jobs, dependências, riscos e Gates; evidência: readback do card"
  - "Nenhum job fica sem owner ou blocker responsável"
  - "Nenhuma execução externa é disparada por este intake"
```

### Job 02 — Bia / contexto e mercado

```yaml
de: "Íris"
para: "Bia"
card: "AF-001"
objetivo do job: "Pesquisar contexto e mercado relevante para as três categorias, separando fatos, hipóteses, fontes, datas e lacunas"
entregável: "Brief de pesquisa versionado no histórico do projeto, com fontes datadas e vínculo explícito a cada afirmação; caminho a definir por Kora"
decisões/suposições:
  - "FATO: categorias são Skin & Beauty, Recovery & Wellness e Home Fitness"
  - "Não selecionar produto final, não criar claims e não tratar pesquisa como comando"
  - "Para Protein / Creatine for 40+, separar evidência do ingrediente de evidência do produto"
pendências/blockers:
  - "Gabe — média — revisar claims sensíveis e adequação das fontes após a pesquisa"
  - "Gestor Editorial — média — usar os dados como insumo, não como decisão automática de pauta"
gate: "execução"
critérios de aceite/evidência:
  - "Cada fato tem fonte e data"
  - "Hipóteses e lacunas são rotuladas; nenhum número, claim ou tendência é inventado"
  - "A pesquisa não recomenda publicação nem compra sem Gates"
```

### Job 03 — Gestor Editorial

```yaml
de: "Íris"
para: "Gestor Editorial"
card: "AF-001"
objetivo do job: "Transformar o intake validado em produto-pauta e agenda editorial, respeitando evidência, disclaimer e compliance"
entregável: "Matriz de pautas e decisões editoriais para 12 artigos, com produto-pauta identificado somente quando houver evidência e decisão registrada"
decisões/suposições:
  - "DECISÃO EXPLÍCITA: Rick apresenta opções; o Gestor Editorial decide o produto-pauta e agenda a publicação"
  - "FATO: quatro artigos por categoria; pauta Protein / Creatine for 40+ já está definida em nível de tema"
  - "Não inventar publisher, produto, claim, fonte, credencial ou testemunho"
pendências/blockers:
  - "Rick — média — entregar opções documentadas antes da decisão de produto-pauta"
  - "Gabe — alta — revisar evidências, disclaimer e compliance antes de qualquer publicação"
  - "Sergio — alta — aprovar Gate de publicação"
gate: "execução"
critérios de aceite/evidência:
  - "Matriz contém 12 pautas, 4 por categoria, ou marca explicitamente o que permanece pendente"
  - "Cada produto associado tem decisão do Gestor Editorial e rastreabilidade da opção de origem"
  - "Cada pauta prevê Sources, disclaimer oficial e bloqueio quando a evidência for insuficiente"
```

### Job 04 — Rick / radar de afiliados e ClickBank

```yaml
de: "Íris"
para: "Rick"
card: "AF-001"
objetivo do job: "Apresentar opções de Amazon Associates e ClickBank com fontes, riscos, claims, comissão/recorrência/reembolso quando aplicável e data da fonte"
entregável: "Relatório de opções versionado, separado por Amazon Associates e ClickBank, sem escolha final de produto"
decisões/suposições:
  - "REGRA OBRIGATÓRIA: Rick apresenta opções; Gestor Editorial decide produto-pauta"
  - "Usar clickbank-research para ClickBank e radar-afiliados para Amazon Associates/plataformas gerais"
  - "Não inventar produto, preço, disponibilidade, comissão, claim ou fonte"
pendências/blockers:
  - "Gestor Editorial — alta — decidir produto-pauta após receber o relatório"
  - "Gabe — alta — auditar claims, disclosure, fontes e riscos"
  - "Sergio — alta — aprovar qualquer oferta, mudança de preço ou publicação"
gate: "execução"
critérios de aceite/evidência:
  - "Cada opção tem URL/fonte, data de consulta, escopo, riscos e limitações"
  - "O relatório declara que não é decisão editorial nem autorização de publicação"
  - "Produtos sem evidência suficiente ficam bloqueados, não preenchidos por inferência"
```

### Job 05 — Rafa / tráfego

```yaml
de: "Íris"
para: "Rafa"
card: "AF-001"
objetivo do job: "Preparar plano de teste de tráfego dentro do teto de USD 50, sem ativar campanha"
entregável: "Plano de mídia com hipótese, canais, segmentação, criativos necessários, métricas mínimas, teto e plano de parada; ativação permanece pendente"
decisões/suposições:
  - "FATO: responsável técnico por planejamento e execução é Rafa; teto inicial é USD 50"
  - "Métricas mínimas: gasto, impressões, cliques, CTR, conversões e EPC/conversão quando aplicável"
  - "Nenhum gasto ou campanha ativa sem Gate explícito do Sergio"
pendências/blockers:
  - "Lia/Vito/Caio — média — fornecer criativos e copy somente em rascunho aprovado"
  - "Gabe — alta — revisar compliance antes da ativação"
  - "Sergio — alta — aprovar Gate de gasto"
gate: "execução"
critérios de aceite/evidência:
  - "Plano não excede USD 50 e contém controle de gasto e parada"
  - "Nenhuma conta/campanha é ativada neste job"
  - "O plano registra claramente o SIM do Sergio como pré-condição de execução"
```

### Job 06 — Caio / copy

```yaml
de: "Íris"
para: "Caio"
card: "AF-001"
objetivo do job: "Preparar copy editorial e de apoio aos criativos, em inglês, factual e compatível com a persona fictícia"
entregável: "Rascunhos versionados de títulos, ângulos, descrições e copy de campanha vinculados às pautas aprovadas"
decisões/suposições:
  - "FATO: idioma do projeto é inglês"
  - "Não escrever em primeira pessoa como se Heidi tivesse experiência real; não inventar credenciais"
  - "Não usar cure, treatment, guaranteed results, miracle, fabricated before/after ou scarcity falsa"
pendências/blockers:
  - "Gestor Editorial — alta — fornecer pautas/produtos decididos"
  - "Gabe — alta — revisar claims, disclosure e linguagem"
  - "Sergio — alta — Gate de publicação/ativação quando aplicável"
gate: "execução"
critérios de aceite/evidência:
  - "Copy está vinculada a fontes ou marcada como placeholder sem claim factual"
  - "Não contém depoimento fabricado, promessa individual ou claim sem suporte"
  - "Versão final inclui espaço para disclaimer oficial e Sources quando for artigo"
```

### Job 07 — Lia / direção visual e criativos

```yaml
de: "Íris"
para: "Lia"
card: "AF-001"
objetivo do job: "Propor direção e rascunhos de criativos consistentes com a character bible, sem publicação"
entregável: "Brief visual e assets de rascunho versionados, preservando a mesma identidade facial e a paleta do projeto"
decisões/suposições:
  - "FATO: âncora visual é mulher German-American de 50 anos, cabelo platinum-white, olhos azuis, pele realista e paleta off-white/camel/warm gray/navy/prata"
  - "Criativos são rascunhos; não implicam endorsement, resultado ou publicação"
  - "Não criar antes/depois fabricado nem representação de resultado médico"
pendências/blockers:
  - "Caio — média — fornecer copy aprovada para sobreposição"
  - "Gabe — alta — revisar compliance visual e claims"
  - "Sergio — alta — autorizar uso em campanha/publicação"
gate: "execução"
critérios de aceite/evidência:
  - "Assets mantêm identidade visual consistente e não fabricam testemunho"
  - "Cada asset tem versão, finalidade e texto associado"
  - "Nenhum asset é publicado ou ativado neste job"
```

### Job 08 — Vito / variações visuais

```yaml
de: "Íris"
para: "Vito"
card: "AF-001"
objetivo do job: "Criar variações controladas dos criativos aprováveis para teste, sem alterar fatos ou claims"
entregável: "Pacote de variações versionado, com matriz de hipótese visual e vínculo a copy/fonte"
decisões/suposições:
  - "FATO: identidade facial e direção visual do projeto devem ser preservadas"
  - "Variações não podem introduzir claim, preço, disponibilidade ou urgência sem fonte datada"
  - "Produção não equivale a autorização de mídia"
pendências/blockers:
  - "Lia — média — definir base visual e consistência de assets"
  - "Caio — média — fornecer copy correspondente"
  - "Gabe/Sergio — alta — compliance e Gate de ativação"
gate: "execução"
critérios de aceite/evidência:
  - "Variações são identificadas e comparáveis sem claims novos não revisados"
  - "Arquivo registra versão e destino pretendido"
  - "Nenhuma variação é publicada ou usada em mídia sem Gates"
```

### Job 09 — Amazon Research

```yaml
de: "Íris"
para: "Amazon Research"
card: "AF-001"
objetivo do job: "Pesquisar opções Amazon Associates aplicáveis às pautas, com dados atuais, fontes e limitações"
entregável: "Tabela de opções Amazon com URL, data, categoria, evidência do produto, disponibilidade observada e riscos; sem decisão final"
decisões/suposições:
  - "FATO: Amazon Associates é uma via de monetização prevista"
  - "Pesquisa apresenta opções; não escolhe produto-pauta"
  - "Estudo de ingrediente não prova produto final; fonte do fabricante não basta para claim sensível"
pendências/blockers:
  - "Rick — média — consolidar com radar-afiliados e pesquisa ClickBank quando aplicável"
  - "Gestor Editorial — alta — decidir produto-pauta"
  - "Gabe — alta — revisar evidência e disclosure"
gate: "execução"
critérios de aceite/evidência:
  - "Cada linha tem fonte/URL e data de consulta"
  - "Claims do produto são separados de evidência geral do ingrediente"
  - "Sem preço ou disponibilidade apresentados como permanentes; lacunas são explicitadas"
```

### Job 10 — Amazon Listing

```yaml
de: "Íris"
para: "Amazon Listing"
card: "AF-001"
objetivo do job: "Preparar rascunhos de integração de produto e disclosure para pautas após decisão do Gestor Editorial"
entregável: "Rascunho de bloco/listing editorial com identificador de produto confirmado, link, disclosure e campos de evidência; não publicar"
decisões/suposições:
  - "Não iniciar produto específico antes da decisão documentada do Gestor Editorial"
  - "Não inventar ASIN, preço, disponibilidade, benefício ou claim"
  - "Qualquer publicação ou alteração externa exige aprovação do Sergio"
pendências/blockers:
  - "Gestor Editorial — alta — decidir produto-pauta"
  - "Amazon Research/Rick — média — fornecer dados rastreáveis"
  - "Amazon QA/Gabe — alta — revisar listing e compliance"
gate: "revisão"
critérios de aceite/evidência:
  - "Todo campo factual tem fonte e data"
  - "O rascunho contém disclosure aplicável e não contém promessa não sustentada"
  - "Estado permanece rascunho até Gates de QA e Sergio"
```

### Job 11 — Amazon QA

```yaml
de: "Íris"
para: "Amazon QA"
card: "AF-001"
objetivo do job: "Auditar rascunhos Amazon quanto a dados, links, disclosure, claims e consistência com o produto-pauta decidido"
entregável: "Checklist e relatório de QA com evidências, falhas, severidade, owner e decisão pass/fail"
decisões/suposições:
  - "QA verifica; não substitui a decisão do Gestor Editorial nem a aprovação do Sergio"
  - "Produto, preço, disponibilidade e claims precisam de fonte atual e registrada"
  - "Falha de evidência bloqueia o avanço"
pendências/blockers:
  - "Amazon Listing — média — entregar rascunho completo"
  - "Gabe — alta — revisão final de compliance"
  - "Sergio — alta — Gate de publicação/mutação"
gate: "revisão"
critérios de aceite/evidência:
  - "Checklist cobre link, produto, fonte/data, disclosure, claims e estado de publicação"
  - "Cada falha tem severidade e owner"
  - "Nenhum item com falha crítica é liberado"
```

### Job 12 — Gabe / compliance editorial

```yaml
de: "Íris"
para: "Gabe"
card: "AF-001"
objetivo do job: "Auditar evidências, claims, SEO, disclosure e prontidão dos artigos, criativos, listings e plano de tráfego"
entregável: "Relatório de auditoria com pass/fail, fontes, claims bloqueados, correções e Gate recomendado"
decisões/suposições:
  - "Gabe é owner editorial de compliance quando aplicável"
  - "O disclaimer oficial deve ser reproduzido exatamente nos artigos"
  - "Sem evidência suficiente, artigo/claim não avança"
pendências/blockers:
  - "Todos os owners — alta — corrigir itens fail antes de novo review"
  - "Sergio — alta — aprovar publicação, gasto e mutação após parecer"
  - "Publisher público — alta — confirmação pendente para qualquer substituição de placeholder"
gate: "revisão"
critérios de aceite/evidência:
  - "Cada claim relevante aponta para fonte compatível, atual e datada"
  - "Cada artigo termina com disclaimer oficial e seção Sources"
  - "Relatório explicita pass/fail e não autoriza publicação por si só"
```

### Job 13 — Théo / provisionamento técnico

```yaml
de: "Íris"
para: "Théo"
card: "AF-001"
objetivo do job: "Preparar proposta de provisionamento e schema somente dentro do escopo que Kora/Sergio autorizarem"
entregável: "Especificação técnica e plano de provisionamento em staging, sem executar criação, alteração ou publicação"
decisões/suposições:
  - "FATO: fluxo prevê Théo depois do Gestor Editorial; este intake não provisiona nada"
  - "Control Tower e infraestrutura só podem ser usadas no escopo autorizado"
  - "Não criar schema, projeto, integração ou segredo neste job"
pendências/blockers:
  - "Kora — alta — card, escopo e dependências autorizados"
  - "Sergio — alta — autorizar qualquer mutação de infraestrutura"
  - "Íris/Gestor Editorial — média — fornecer requisitos editoriais aprovados"
gate: "entrada"
critérios de aceite/evidência:
  - "Plano lista escopo, entradas, saídas, riscos, rollback e aprovação necessária"
  - "Nenhuma alteração de infraestrutura ocorreu"
  - "A proposta não contém secrets, tokens ou dados de pagamento"
```

## 3. Dependências e ordem de execução

1. `AF-001` e seus owners/dependências devem ser registrados por Kora antes de execução coordenada
2. Bia e Rick/Amazon Research podem pesquisar em paralelo, mantendo fontes e datas
3. Gestor Editorial recebe as opções e **decide produto-pauta**; Rick não decide nem agenda
4. Após decisão editorial: Caio, Lia, Vito, Amazon Listing e Rafa preparam rascunhos/plano
5. Amazon QA e Gabe revisam; falhas bloqueiam avanço
6. Théo só atua no escopo técnico autorizado
7. Sergio aprova Gates de publicação, gasto, mudança de oferta/preço e mutação irreversível
8. Após execução autorizada, Kora registra readback do estado real

## 4. Riscos

- **Claims de saúde/composição:** risco alto de afirmação sem evidência adequada; mitigação: fontes específicas, revisão Gabe e bloqueio
- **Persona fictícia:** risco alto de depoimento/credencial inventada; mitigação: transparência, disclaimer exato e proibição de primeira pessoa fabricada
- **Produto-pauta prematuro:** risco alto de Rick ser tratado como decisor; mitigação: contrato explícito — Rick apresenta, Gestor Editorial decide
- **Preço/disponibilidade/oferta:** risco médio/alto de dado desatualizado; mitigação: URL e data, sem permanência implícita
- **Gasto/publicação não autorizado:** risco alto; mitigação: Gate explícito e datado de Sergio
- **Publisher confirmado:** `FBR News`; o disclaimer pode usar esse nome exatamente
- **Infraestrutura fora de escopo:** risco alto; mitigação: Théo não provisiona neste intake

## 5. Gates

- **Gate de entrada — Íris/Kora:** AF-001, campos normalizados, owners, dependências e blockers registrados
- **Gate de decisão editorial — Gestor Editorial:** pauta e produto-pauta decididos a partir de opções rastreáveis de Rick/Amazon Research; não presumir escolha
- **Gate de evidência/compliance — Gabe:** claims, Sources, disclaimer, SEO e disclosures aprovados; fail bloqueia
- **Gate técnico — Kora/Théo:** escopo de provisionamento autorizado; nenhuma mutação presumida
- **Gate de gasto — Sergio:** SIM explícito e datado para qualquer uso do teto de USD 50
- **Gate de publicação/mutação — Sergio:** SIM explícito e datado para publicar listing/artigo/anúncio, mudar oferta/preço ou executar mutação
- **Gate de readback — Kora:** estado pós-execução conferido no alvo; só aplicável depois de autorização e execução

## 6. Critérios de aceite do AF-001

- [ ] Arquivo acessível no caminho informado e baseado somente nas fontes lidas
- [ ] Campos objetivo, público, categorias, monetização, disclaimer e orçamento normalizados sem inventar dados
- [ ] Existem 13 contratos com todos os campos obrigatórios do contrato único de Handoff
- [ ] Cada blocker tem owner, severidade e dependência
- [ ] Rick apresenta opções e Gestor Editorial decide produto-pauta, explicitamente
- [ ] Publisher confirmado como `FBR News` e disclaimer correspondente registrado
- [ ] Nenhuma publicação, gasto, provisionamento ou alteração de infraestrutura foi executada
- [ ] Gates e critérios de evidência estão registrados

**Estado final do handoff:** `READY_FOR_KORA_INTAKE` — aguardando registro do card e avanço por Gates; não é autorização para executar ações de risco
