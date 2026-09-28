# The Thirties — Inventário de imagens e assets v1

Data: 2026-09-28
Escopo: site `04-site` e primeiro conteúdo TT-005
Status: nenhum asset visual final está conectado ao código; o inventário antecede a geração.

## Diagnóstico do site atual

- `app/page.tsx` usa somente texto e CSS; não há `<Image>`, hero visual, thumbnail ou avatar.
- Não existe diretório `public/` com imagens editoriais.
- Não existem logo, favicon, Open Graph image, imagens de artigo ou thumbnails de vídeo.
- A tasklist exige assets com origem, licença e rótulo quando gerados por IA.
- O design token atual favorece editorial caloroso, body-neutral e não sexualizado.

## Assets obrigatórios para o primeiro staging

| ID | Asset | Arquivo sugerido | Dimensão | Uso | Alt text/label | Prioridade |
|---|---|---|---:|---|---|---|
| IMG-001 | Wordmark/logo textual | `public/brand/the-thirties-wordmark.svg` | vetorial | header, footer, metadata | `The Thirties by Maia Mendes` | P0 |
| IMG-002 | Favicon/app icon | `app/icon.svg` | 1:1, 512px | browser, social fallback | `The Thirties icon` | P0 |
| IMG-003 | Default Open Graph card | `public/og/default.jpg` | 1200×630 | compartilhamento sem imagem específica | `The Thirties by Maia Mendes — Evidence-based living, in your thirties.` | P0 |
| IMG-004 | Maia avatar editorial | `public/brand/maia-avatar.webp` | 800×800 | About, author card, artigo | descrição factual da ilustração; marcar “AI-assisted illustration” se aplicável | P0 |
| IMG-005 | Home hero editorial | `public/editorial/home-hero.webp` | 1600×1000 | homepage | descrição da cena; sem promessa corporal | P0 |
| IMG-006 | TT-005 cover | `public/editorial/tt-005-capsule-wardrobe.webp` | 1600×1000 | card e artigo | `Neutral capsule wardrobe pieces arranged for an everyday week` | P0 |
| IMG-007 | TT-005 video thumbnail | `public/editorial/tt-005-video-thumb.webp` | 1280×720 | card/player/SEO | `Everyday capsule wardrobe pieces arranged for real-life outfits` | P0 |

## Assets recomendados para o pacote TT-005

| ID | Asset | Dimensão | Função | Observação |
|---|---|---:|---|---|
| IMG-008 | Flat lay “start with your week” | 1600×1000 | explicar papéis de uso | roupas reais, sem marcas visíveis |
| IMG-009 | Três-question filter graphic | 1600×1000 | visualizar o filtro de compra | tipográfico/diagramático; não precisa de foto |
| IMG-010 | Accessory comparison | 1600×1000 | mostrar um acessório em dois looks | sem “must-have”, sem corpo antes/depois |
| IMG-011 | What I’d do callout illustration | 1200×800 | bloco editorial | pode ser ilustração abstrata; manter legibilidade |

## Assets de expansão editorial

| ID | Pauta | Asset principal | Dimensão |
|---|---|---|---:|
| IMG-012 | TT-007 Green Flags | ilustração de conversa calma entre duas pessoas adultas | 1600×1000 |
| IMG-013 | TT-009 Everyday Bag | flat lay de bolsa e itens cotidianos | 1600×1000 |
| IMG-014 | Dear Maia | selo/ilustração da série “You Asked” | 1200×800 |
| IMG-015 | Everyday Wellness | ilustração editorial de rotina de sono/pausa | 1600×1000 |
| IMG-016 | Hormones & Cycle | diagrama editorial neutro, não anatômico | 1600×1000 |
| IMG-017 | Fertility/Preconception | ilustração informativa não clínica | 1600×1000 |
| IMG-018 | Relationships | card visual de green flags | 1600×1000 |

## Direção visual obrigatória

- Editorial sofisticada, calorosa e body-neutral.
- Mulheres 30+ representadas com diversidade de pele, cabelo, corpo, deficiência e estilo, sem sexualização.
- Nenhum “before/after”, emagrecimento, aparência como prova de saúde ou estereótipo latino.
- Nenhuma marca, embalagem, logotipo ou produto identificável sem catálogo/licença validado.
- Para temas YMYL, preferir diagramas e ilustrações informativas a imagens clínicas dramáticas.
- Todo asset gerado por IA deve ser rotulado internamente e, quando exigido pela plataforma, publicamente.
- Prompts não devem pedir texto legível dentro da imagem; texto deve ser renderizado em HTML/SVG.

## Prompt-base para geração

“Editorial illustration for an English-language publication for women in their thirties, warm evidence-aware lifestyle magazine, sophisticated natural light, diverse adult woman or still life, body-neutral, non-sexualized, no visible logos, no readable text, no medical claims, calm composition with negative space for headline, palette based on warm paper, ink, muted terracotta and soft sage, high-quality art direction, accessible contrast.”

Adaptar o sujeito e a composição por asset. Não reutilizar o prompt-base em temas de fertilidade/gravidez sem acrescentar “non-clinical, non-diagnostic, respectful, no promise of outcome”.

## Critérios de aceite por imagem

1. Arquivo existe no path definido e abre sem corrupção.
2. Dimensão e formato correspondem ao uso.
3. Alt text factual está registrado.
4. Origem/licença/geração está registrada.
5. Não há logos, claims, texto ilegível ou produto não validado.
6. Contraste e enquadramento funcionam em mobile.
7. Imagem não substitui Sources, disclosure ou disclaimer.
8. `next/image` usa dimensões e `sizes` apropriados.

## Próxima ordem de produção

1. Aprovar direção visual e avatar da Maia.
2. Criar IMG-001 a IMG-007 para o staging.
3. Registrar origem, prompt, seed/modelo ou licença em `03-design-ui/asset-register.md`.
4. Conectar logo, favicon, OG e imagens de TT-005 no Next.js.
5. Validar alt text, carregamento, LCP, contraste e build.
6. Só então produzir IMG-008 em diante conforme cada pauta entrar em desenvolvimento.

Nenhuma imagem deve ser publicada ou usada como endorsement de produto antes de validação de catálogo e Gate aplicável.
