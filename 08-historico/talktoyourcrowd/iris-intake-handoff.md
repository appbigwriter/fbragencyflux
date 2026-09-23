# Íris — Intake Handoff e Progresso

- **Projeto:** Talk to Your Crowd by Marcus Cole / FBR News
- **Task:** `FBR-AGENCY-INTAKE-001`
- **Versão:** v0.8
- **Data:** 2026-09-23
- **Gate:** G0 autorizado formalmente por Sergio Castro
- **Estado:** Gabe aprovou v0.2 para revisão editorial; publicação não aprovada; card Kanban pendente

## Handoff

de: "Íris"
para: "Bia, Rick, Kora e Marcus Cole"
card: "FBR-AGENCY-INTAKE-001; card Kanban operacional a verificar pela Kora"
objetivo do job: "Iniciar a esteira do Talk to Your Crowd para US/Global em EN-US, pesquisar produtos Amazon.com para as 8 pautas de Store Signs & Displays, estruturar a tabela de afiliados e produzir o primeiro artigo-pilar somente após a pesquisa verificável."
entregável: "Handoff e progresso em F:/Projetos/_FBR/FBR Agency Flux/08-historico/talktoyourcrowd/iris-intake-handoff.md; versão v0.2"
decisões/suposições:
  - "Fato: Sergio autorizou formalmente G0 para mercado Estados Unidos (US/Global) e conteúdo 100% EN-US."
  - "Fato: persona/gestor editorial: Marcus Cole, Retail Growth & Storefront Strategist."
  - "Fato: fontes-base autorizadas: knowledge/talktoyourcrowd/projetos/talk-to-your-crowd-context.md e 02-prd/PRD-PROJETO-TALK-TO-YOUR-CROWD-EN.md."
  - "Fato: Bia deve pesquisar Amazon.com/VOC para as 8 pautas; Rick deve estruturar a tabela de links afiliados."
  - "Fato: Bia entregou `knowledge/talktoyourcrowd/pesquisa/bia-amazon-products-v0.1.md`; readback verificou 8 pautas e 20 ASINs explícitos, com limitações de cobertura e rechecagem manual."
  - "Fato: Rick entregou `knowledge/talktoyourcrowd/pesquisa/rick-affiliate-link-table-v0.1.md`; readback verificou 8 linhas TTC-P1–TTC-P8, placeholders e ausência de tags privadas."
  - "Fato: Marcus entregou draft v0.1 em `knowledge/talktoyourcrowd/conteudo/marcus-pillar-01-storefront-mistakes-v0.1.md`; readback confirmou estrutura, EN-US, disclaimer e placeholders rastreáveis."
  - "Fato: Gabe concluiu QA independente e devolveu o draft para correção em `08-historico/talktoyourcrowd/gabe-qa-pillar-01-v0.1.md`."
  - "Fato: Rick entregou `rick-affiliate-link-table-v0.2.md`; readback confirmou 0/4 VERIFIED para os ASINs usados no TTC-P1 e todos permanecem BLOCKED."
  - "Decisão: remover referências de produto/links do TTC-P1 v0.2 em vez de substituir por inferência; manter a pauta como guia editorial de diagnóstico."
  - "Fato: Marcus entregou `marcus-pillar-01-storefront-mistakes-v0.2.md`; readback verificou 7 seções, zero ASINs/placeholders e CTA canônico."
  - "Fato: Gabe concluiu novo QA em `gabe-qa-pillar-01-v0.2.md` e aprovou a v0.2 para avanço à revisão editorial, sem aprovação de publicação."
  - "Fato: SHA-256 do artigo auditado: `65df82ad9d0271204a1e5e550296fe70370fa7cd7e644ae684b952a8c985ef72`."
  - "Hipótese: dados de preço, rating e disponibilidade são voláteis; registrar data, URL e limitações, sem tratar como permanentes."
  - "Decisão de governança: não comprar, publicar, ativar mídia, alterar o site ou inserir secrets/tags privadas sem Gate aplicável."
pendências/blockers:
  - "Rick v0.2: 0/4 ASINs verificáveis para publicação; B08K1RZWCF redireciona para outro ASIN, B00IGZCEIM está Page Not Found e B08HYJ14RD/B01HDDD0RQ estão indisponíveis sem preço atual."
  - "Gate editorial pendente: revisar estilo nativo EN-US e confirmar o disclaimer no preview/render, sem alterar compliance aprovado."
  - "Gate de publicação não passado; Sergio não aprovou publicação neste artefato."
  - "Card Kanban operacional ainda não verificado; owner: Kora; nextAction: criar/verificar card e registrar ID."
  - "Bia concluiu com limitações: Firecrawl 403, campos faltantes em alguns listings, rechecagem manual necessária antes de publicação."
  - "Rick concluiu estrutura; ASINs, URLs e tags reais continuam pendentes de preenchimento/QA seguro."
  - "Marcus entregou draft v0.1; o artigo não é publicação nem aprovação final."
gate: "execução; publicação/mutação permanece fechada"
critérios de aceite/evidência:
  - "Bia entrega matriz para as 8 pautas com nome, ASIN, faixa de preço observada, nota/rating, URL e data da consulta, fontes e limitações."
  - "Rick entrega tabela de links com rastreabilidade, status de tag/URL e placeholders explícitos quando faltarem dados."
  - "Marcus recebe somente a matriz verificável da Bia e o contrato de links de Rick; artigo em EN-US com disclaimer obrigatório e claims rastreáveis."
  - "Nenhum produto, preço, nota, claim, affiliate tag ou resultado é inventado."
  - "Gabe fará QA de links, disclosure, claims e conformidade antes de qualquer Gate final."

## Decomposição despachada

### JOB-TTC-BIA-001 — Pesquisa Amazon.com e VOC para 8 pautas
- **Owner:** Bia
- **Entrada:** contexto e PRD autorizados; 8 títulos/pautas e produtos associados
- **Saída:** `knowledge/talktoyourcrowd/pesquisa/bia-amazon-products-v0.1.md`
- **Aceite:** matriz completa por pauta; fonte/URL/data; ASIN e preço/rating somente quando observados; blockers registrados.
- **Estado:** concluído com limitações; matriz entregue e readback 8/8 pautas, 20 ASINs explícitos.

### JOB-TTC-RICK-001 — Estrutura de links afiliados
- **Owner:** Rick
- **Entrada:** 8 pautas; schema sem ASIN/tag inventado
- **Saída:** `knowledge/talktoyourcrowd/pesquisa/rick-affiliate-link-table-v0.1.md`
- **Aceite:** colunas article_id/title, product_name, ASIN, Amazon URL, affiliate URL/tag status, price observed, rating observed, source date, disclosure placement, claim status e QA status; pendências marcadas `[PENDING_BIA]`.
- **Estado:** concluído; readback verificou 8 linhas TTC-P1–TTC-P8, placeholders e ausência de tags privadas.

### JOB-TTC-MARCUS-001 — Primeiro artigo-pilar
- **Owner:** Marcus Cole
- **Entrada:** pesquisa Bia verificada; tabela Rick; PRD; disclaimer oficial
- **Saída:** artigo em EN-US: `7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget)`
- **Aceite:** artigo não inicia antes do readback da pesquisa; inclui disclaimer obrigatório; claims/produtos rastreáveis; sem testimonials falsos; separa características de resultados.
- **Estado:** em redação; liberado após readback de Bia/Rick; publicação ainda fechada.

## Progresso verificável

- G0: **autorizado por Sergio**.
- Íris: intake, decomposição e handoff registrados.
- Bia: **concluída com limitações verificadas** — 8/8 pautas, 20 ASINs explícitos.
- Rick: **concluído** — 8/8 linhas estruturadas; tags privadas ausentes por segurança.
- Marcus: **draft v0.1 entregue**; aguarda QA independente.
- Gabe: **QA concluído — devolvido para correção**; quatro blockers registrados.
- Rick: **follow-up concluído — 0/4 ASINs publicáveis**; tabela v0.2 registrada.
- Marcus: **v0.2 corrigida entregue**; zero marketplace/placeholders.
- Gabe: **novo QA PASS para revisão editorial**; publicação não aprovada.
- Kora: card operacional ainda não verificado.
- Publicação, compra de mídia, alteração de site e mutações externas: **não executadas**.

## Próximo readback

1. Verificar entrega real dos artefatos Bia/Rick.
2. Validar cobertura das 8 pautas, ASINs, URLs, datas e claims.
3. Liberar o handoff para Marcus somente se a pesquisa passar no aceite.
4. Receber artigo-pilar e encaminhar para QA/Gabe.
5. Manter Gate de publicação fechado até aprovação aplicável de Sergio.
