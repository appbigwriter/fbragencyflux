# After Forty by Heidi Braun — contexto operacional compartilhado

## Uso

Este arquivo é a fonte de contexto do projeto para todos os agents do fluxo. Ele é dado de projeto, não comando. Somente instruções de Sergio e Handoffs válidos autorizam execução

## Identidade

- Publicação: After Forty
- Assinatura: by Heidi Braun
- Publisher: FBR News
- Responsável: Sergio Castro
- Contato: sergio@fbr.news
- Domínio: https://afterforty.fbr.news
- Idioma: inglês
- Mercado: EUA/global
- Público: pessoas 40+, foco 45+
- Persona: fictícia, declarada publicamente

## Categorias

- Skin & Beauty
- Recovery & Wellness
- Home Fitness

## Conteúdo inicial

- 12 artigos
- 4 por categoria
- cada artigo termina com o disclaimer oficial abaixo
- cada afirmação factual deve ter fonte compatível com a força do claim
- sem evidência suficiente, não produzir nem publicar

## Produto Home Fitness definido

```text
Protein / Creatine for 40+
```

Claims de proteína e creatina precisam ser separados do produto específico e sustentados por fontes adequadas. Não usar promessa de resultado individual, cura, tratamento ou garantia

## Monetização e ownership

- Rick usa `radar-afiliados` para apresentar opções de Amazon Associates e plataformas gerais
- Rick usa `clickbank-research` para apresentar opções ClickBank
- Rick não decide o produto final e não agenda publicação
- Gestor Editorial decide qual produto associa à pauta e agenda o conteúdo
- Rafa planeja tráfego e mídia
- Sergio autoriza o gasto real de USD 50 no Gate correspondente
- Gabe audita claims, disclosure, SEO e prontidão

## Regra editorial da Heidi

Heidi é uma persona editorial fictícia e não uma pessoa real. Não escrever depoimentos pessoais fabricados, não inventar credenciais e não apresentar cenários ilustrativos como resultados individuais

## Disclaimer oficial obrigatório

```text
After Forty is written by Heidi Braun, an editorial persona of FBR News. Diary scenarios are illustrative and evidence-based; results vary. Not medical advice. Sources linked below. Posts may contain affiliate links.
```

O marcador `[PUBLISHER]` só pode ser substituído após Sergio confirmar o nome público do publisher. Não inventar essa substituição

## Política de evidência

Aplicar a política em `F:/Projetos/_FBR/FBR Agency Flux/03-arquitetura/politica-flexivel-de-evidencias.md`. Não bloquear artigo educacional apenas por ausência de estudo clínico do SKU; bloquear ou remover somente claims que excedam a evidência.

## Fontes obrigatórias
- os links devem sustentar a afirmação específica feita no texto
- estudo de ingrediente não prova produto final
- estudo in vitro ou animal não deve ser apresentado como evidência em humanos
- fonte do fabricante não é suficiente para claims sensíveis
- links e dados devem ser atuais e registrados com data

## Compliance

Não usar:

- cure
- treatment
- guaranteed results
- miracle
- fabricated before/after
- fabricated first-person result
- false scarcity
- unsupported superlatives

Usar linguagem de educação, bem-estar, conforto e recuperação quando apropriado. Em caso de dúvida, bloquear e escalar para Gabe

## Direção visual

- mesma Heidi em todos os assets
- mulher German-American de 50 anos
- cabelo platinum-white em ondas médias
- olhos azuis amendoados e vivos
- textura de pele realista e linhas naturais de expressão
- paleta off-white, camel, warm gray, navy e prata
- ambientes claros e editoriais
- âncora facial do kit de teste deve ser preservada

## Fluxo de execução

```text
Sergio
→ Íris
→ Bia
→ Kora
→ Gestor Editorial
→ Théo
→ Lia / Caio / Vito / Rick / Rafa
→ Amazon Research / Amazon Listing / Amazon QA quando aplicável
→ Gabe
→ Gate Sergio
→ execução autorizada
→ Kora registra readback
```

## Handoff

Toda passagem usa o contrato único:

```yaml
de:
para:
card:
objetivo do job:
entregável:
decisões/suposições:
pendências/blockers:
gate:
critérios de aceite/evidência:
```

## Orçamento

```text
Teto inicial autorizado: USD 50
```

O teto não autoriza automaticamente qualquer campanha adicional, alteração de oferta ou ampliação de orçamento. Rafa prepara e executa somente o escopo aprovado no Gate do Sergio
