# SharpEye — Inventário de imagens e ativos visuais necessários

**Revisado em:** 28/09/2026  
**Base:** `analise-alinhamento-e-maestria.md`, `03-design-ui/brand-assets.md`, `03-design-ui/design-tokens.md`, `03-design-ui/wireframes.md`, artigos-pilar e `04-site/architecture.md`.

## Decisão de produção

O site não precisa de fotografia genérica nem de retrato de Nadia. A persona é editorial/fictícia e um retrato gerado poderia sugerir credenciais ou identidade real. A linguagem visual deve priorizar **diagramas, plantas, layouts, sinalização e imagens editoriais de espaços**, com alt text, fonte/status e uso claramente identificado.

## Matriz de ativos

| ID | Ativo | Onde será usado | Prioridade | Formato/dimensão | Produzir com |
|---|---|---|---|---|---|
| IMG-001 | Logo principal SharpEye | Header, footer, metadata | P0 | SVG vetorial + PNG fallback | vetor/manual; não diffusion |
| IMG-002 | Monograma/fav ícone | favicon, avatar, social | P0 | SVG, 32/180/512px | vetor/manual; testar legibilidade |
| IMG-003 | Social/OG card base | OpenGraph, compartilhamento | P0 | 1200×630 PNG/WebP | composição HTML/SVG ou geração com texto aplicado depois |
| IMG-004 | Hero editorial “Make the right people stop” | Homepage | P0 | desktop 2400×1350; mobile crop | imagem/diagrama espacial autoral |
| IMG-005 | Featured Teardown | Homepage e `/the-teardown` | P0 | 1600×1000 | diagrama de estande/loja com uma mudança destacada |
| IMG-006 | Five-Second Test visual | Artigo Pilar 01 | P0 | 1600×1000 + versão 800×800 | composição antes/depois com hierarquia visual |
| IMG-007 | Diagramas de distância/legibilidade | Artigo Pilar 01 | P1 | SVG responsivo | vetor/HTML; régua, cone de visão, níveis de leitura |
| IMG-008 | Comparativo de formatos | Artigo Pilar 02 | P0 | 1600×1000 + 1200×630 | infográfico: portable/modular/custom/rental |
| IMG-009 | Matriz de decisão | Artigo Pilar 02 | P1 | SVG/HTML responsivo | vetor/HTML; não rasterizar texto principal |
| IMG-010 | Review rubric visual | Artigo Pilar 03 | P1 | 1600×1000 | scorecard editorial com critérios, sem estrelas falsas |
| IMG-011 | Planta baixa/layout com hotspots | The Teardown | P1 | SVG ou Canvas acessível | vetor interativo; fallback estático obrigatório |
| IMG-012 | Signage Autopsy | artigo/formato editorial | P1 | 1600×1000 + SVG anotado | exemplo autorizado, público, anonimizado ou composite |
| IMG-013 | Biblioteca de placeholders | cards, erro, vazio, draft | P2 | SVG/CSS | gerar como componente, não imagem de banco |
| IMG-014 | Textura/sistema de fundo | shell e seções | P2 | CSS/SVG pattern | tokens; evitar peso e ruído visual |

## Pacote mínimo para iniciar o código (P0)

1. `logo.svg`
2. `mark.svg`
3. `favicon.svg` e exportações 32/180/512px
4. OG card base 1200×630
5. Hero da home
6. Featured Teardown
7. Five-Second Test visual
8. Comparativo de formatos

Sem esses oito ativos, o site pode ser codificado com placeholders identificados, mas não deve ser apresentado como visualmente pronto.

## Ativos que não devem ser gerados sem fonte/permissão

- Fotos reais de lojas, estandes ou clientes.
- Logos de terceiros.
- “Antes/depois” que represente um negócio real sem autorização.
- Reviews, estrelas, números de conversão ou resultados de vendas.
- Retrato fotorealista de Nadia que possa sugerir pessoa/credencial real.

Para exemplos sem autorização, usar **composite editorial** claramente rotulado como “illustrative/composite”.

## Requisitos para cada imagem

- Nomear com ID e slug, por exemplo `img-006-five-second-test-v1.webp`.
- Registrar prompt/brief, seed ou método, data, autor/ferramenta e licença.
- Registrar alt text, finalidade, status (`draft`, `approved`, `blocked`) e origem.
- Exportar WebP/AVIF quando adequado e manter fonte SVG/PNG editável.
- Testar contraste, crop mobile, compressão, lazy loading e fallback.
- Imagens com texto devem preferir SVG/HTML para preservar acessibilidade e SEO.

## Prompts/briefs iniciais para geração

### IMG-004 — Hero

“Editorial architectural design notebook, abstract trade-show and retail spatial composition, dark ink #111318, paper #F5F2EC, restrained industrial signal orange #D86B45 and cobalt #315A78, clear negative space on left for headline, precise floor-plan lines, no logos, no readable text, no people, sophisticated documentary diagram aesthetic, 16:9.”

### IMG-005 — Featured Teardown

“Top-down editorial diagram of a small exhibition booth, one clear visitor path, one highlighted friction point and one proposed improvement, architectural plan and subtle perspective hybrid, ink/paper/cobalt/signal palette, no brand logos, no readable text, clean annotation zones, 16:10.”

### IMG-006 — Five-Second Test

“Split editorial illustration of a trade-show booth viewed from an aisle: left side visually noisy and unclear, right side with one focal message and readable hierarchy, neutral fictional booth, no real brands, no readable words, architectural visualization notebook style, high contrast, 16:10.”

### IMG-008 — Format comparison

“Four equal editorial panels comparing portable, modular, custom and rental trade-show display structures, distinct geometry and constraints, clean architectural infographic composition, no logos, no readable text, paper/ink/graphite with signal and cobalt accents, 16:10.”

## Sequência recomendada

1. Aprovar conceito de logo A/B/C e gerar `IMG-001/002`.
2. Produzir `IMG-003` com texto aplicado no layout, não confiar em texto gerado.
3. Gerar/diagramar o pacote P0 restante.
4. Validar permissões, alt text, crops e compressão.
5. Registrar os ativos aprovados no content/source registry antes de publicar.

## Gate

A criação de imagens não autoriza publicação, uso de logos de terceiros, coleta de submissões, monetização ou deploy. Ativos realistas de espaços de terceiros exigem permissão ou devem ser substituídos por composites claramente identificados.
