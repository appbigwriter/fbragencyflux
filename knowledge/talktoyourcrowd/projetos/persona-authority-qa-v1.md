# Talk to Your Crowd — QA Mínimo de Persona e Autoridade v1

**Projeto:** Talk to Your Crowd  
**Fase:** Persona e autoridade editorial  
**Persona:** Marcus Cole — Retail Growth & Storefront Strategist  
**Owner do QA:** Gabe  
**Escopo:** coerência, rastreabilidade e conformidade mínima da persona; não avaliação de produtos.

## Objetivo

Confirmar que a persona pode avançar para revisão de Sergio como uma identidade editorial reconhecível, consistente e honesta. O QA verifica o conjunto character bible, voz, visual e conteúdo de autoridade, sem exigir produto, ASIN, preço, rating, disponibilidade, link afiliado ou monetização.

## Resultado do QA

Usar somente um dos estados abaixo para cada item:

- **PASS:** evidência presente e sem inconsistência relevante.
- **REVIEW:** ajuste necessário, mas não impede o desenvolvimento da persona; registrar owner e próximo passo.
- **BLOCK:** não liberar a entrega até corrigir. O bloqueio deve apontar evidência, owner e ação de desbloqueio.

Uma entrega só pode ser marcada como **QA mínimo aprovado** quando todos os itens marcados como obrigatórios estiverem em PASS e não houver BLOCK aberto.

## Checklist obrigatório

### 1. Escopo e identidade da persona

- [ ] **PASS/REVIEW/BLOCK — Character bible:** existe uma versão identificada do character bible, com nome Marcus Cole, função editorial, público, temas de autoridade, visão, limites e pontos de vista.
- [ ] **PASS/REVIEW/BLOCK — Declaração pública:** a persona é tratada como persona editorial fictícia da FBR News; não é apresentada como uma pessoa real com histórico, cargo, clientes ou experiências que não tenham sido comprovados.
- [ ] **PASS/REVIEW/BLOCK — Escopo da fase:** a entrega desenvolve autoridade sobre storefronts, sinalização, varejo local e experiência no ponto de venda; não depende de seleção ou validação de produto.
- [ ] **PASS/REVIEW — Limites:** o character bible registra temas que a persona não deve afirmar, prometer ou representar sem evidência.

### 2. Coerência entre character bible, voz e conteúdo

- [ ] **PASS/REVIEW/BLOCK — Voz:** textos de amostra usam o idioma EN-US, vocabulário, tom, ritmo, grau de assertividade e ponto de vista definidos no character bible.
- [ ] **PASS/REVIEW/BLOCK — Ponto de vista:** cada peça demonstra pelo menos uma tese, princípio ou observação compatível com a visão editorial de Marcus Cole; não é apenas texto genérico de marketing.
- [ ] **PASS/REVIEW/BLOCK — Consistência:** não há contradição entre biografia, audiência, experiência alegada, temas, valores, tom ou limites em diferentes artefatos.
- [ ] **PASS/REVIEW — Conteúdo de autoridade:** exemplos, headlines, manifesto, lead magnet ou artigos iniciais reforçam a mesma autoridade temática e não atribuem à persona resultados pessoais não comprovados.
- [ ] **PASS/REVIEW — Casos e cenários:** cenários ilustrativos são identificados como ilustrativos; não são escritos como estudos de caso reais quando não há fonte verificável.

### 3. Coerência visual

- [ ] **PASS/REVIEW/BLOCK — Âncora visual:** existe identidade visual mínima documentada (elementos, paleta, tipografia, tratamento de imagem e usos proibidos) e ela é reconhecível entre os materiais revisados.
- [ ] **PASS/REVIEW/BLOCK — Alinhamento:** o visual comunica a mesma personalidade, público e posicionamento do character bible e da voz; não sugere uma identidade, profissão ou experiência incompatível.
- [ ] **PASS/REVIEW — Proveniência:** imagens, retratos, ilustrações e referências visuais têm origem registrada ou são identificados como gerados/ilustrativos; não simulam prova de uma pessoa real.

### 4. Fato, hipótese e evidência

- [ ] **PASS/BLOCK — Fatos:** toda afirmação factual relevante tem fonte, evidência ou referência verificável registrada no artefato ou no registro de fontes.
- [ ] **PASS/BLOCK — Hipóteses:** interpretações, apostas editoriais, exemplos e previsões são rotulados como **HIPÓTESE**, **ILUSTRATIVO** ou equivalente, sem linguagem que os transforme em fato.
- [ ] **PASS/BLOCK — Separação:** o texto distingue explicitamente **FATO**, **HIPÓTESE**, **BLOQUEIO** e **DECISÃO** quando esses tipos aparecem na entrega.
- [ ] **PASS/BLOCK — Claims de resultado:** recursos, boas práticas ou princípios de design não são apresentados como vendas, conversão, crescimento ou ROI comprovados sem evidência específica.
- [ ] **PASS/BLOCK — Lacunas:** dado ausente permanece declarado como lacuna; não é preenchido com número, fonte, cliente, resultado ou experiência inventada.

### 5. Testemunhos e prova social

- [ ] **PASS/BLOCK — Ausência de testemunho inventado:** não há depoimento, quote, review, nome de cliente, caso de sucesso, antes/depois ou citação atribuída a pessoa inexistente ou sem fonte.
- [ ] **PASS/BLOCK — Prova social real:** qualquer testemunho ou case usado tem origem verificável, autorização quando necessária e contexto suficiente para não sugerir resultado universal.
- [ ] **PASS/REVIEW — Alternativa segura:** na falta de prova real, usar explicação editorial, cenário hipotético ou princípio geral claramente rotulado, nunca um testemunho fabricado.

### 6. Disclosure quando aplicável

- [ ] **PASS — Sem associação comercial:** se a entrega não contém afiliado, produto ou relação comercial, registrar `Disclosure: não aplicável nesta entrega`.
- [ ] **PASS/BLOCK — Conteúdo com afiliado:** se houver Amazon Associates ou outra relação comercial, o disclosure é claro, visível e compatível com o contexto do conteúdo.
- [ ] **PASS/BLOCK — Persona declarada:** quando publicado, o conteúdo mantém a declaração de que Marcus Cole é uma persona editorial da FBR News e não um especialista real não comprovado.
- [ ] **PASS/BLOCK — Texto oficial quando aplicável:** para conteúdo com associação afiliada, conferir a presença ou adaptação aprovada do disclosure oficial:

> Talk to Your Crowd is written by Marcus Cole, an editorial persona of FBR News. Case scenarios are illustrative, evidence-based, and results vary by business location and industry. Posts may contain Amazon Associates affiliate links earning commissions at no extra cost to you.

## Não bloquear por produto

Os itens abaixo estão explicitamente fora deste QA e **não podem gerar BLOCK** nesta fase:

- ausência de produto, ASIN, preço, rating ou disponibilidade;
- ausência de link afiliado, affiliate tag ou monetização;
- produto ainda não pesquisado, validado ou aprovado;
- ausência de comparação, recomendação ou CTA comercial;
- atraso da trilha paralela de associação de produtos.

Se uma pauta mencionar produto antes da fase autorizada, remover a associação comercial ou marcar `[PRODUCT ASSOCIATION DEFERRED]`. Não inventar produto, ASIN, preço, claim, link ou resultado.

## Evidência mínima do handoff

O responsável pelo QA deve devolver:

```text
STATUS: PASS | REVIEW | BLOCK
ARTEFATOS REVISADOS: character bible, voz, visual e conteúdo (com versões)
ITENS PASS: <lista ou contagem>
REVIEW: <item, owner e próximo passo; se houver>
BLOCKERS: <item, evidência, owner e ação; se houver>
DISCLOSURE: aplicável / não aplicável + evidência
TESTEMUNHOS INVENTADOS: não encontrados / ocorrência bloqueadora
FATO-HIPÓTESE: verificado / ocorrência bloqueadora
PRODUTO: não avaliado; não é bloqueador nesta fase
PRÓXIMO RESPONSÁVEL: <nome>
```

## Regra de decisão

- **PASS:** persona, voz, visual e conteúdo são coerentes; fatos têm rastreabilidade; hipóteses estão rotuladas; não há testemunho inventado; disclosure está correto quando aplicável.
- **REVIEW:** há melhoria editorial ou visual não crítica, com owner e próximo passo registrados.
- **BLOCK:** há contradição de identidade, persona fictícia apresentada como pessoa real, fato/claim sem suporte apresentado como fato, testemunho inventado, ou disclosure obrigatório ausente.

Este checklist não aprova publicação comercial, produto, afiliado, campanha ou qualquer gate fora da fase de persona e autoridade.
