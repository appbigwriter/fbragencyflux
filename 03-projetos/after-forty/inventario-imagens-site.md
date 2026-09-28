# Inventário de Imagens Necessárias — After Forty

**Auditoria baseada em:** `04-site/`, `03-design-ui/character-bible.md`, `03-design-ui/styleguide.md` e `analise-alinhamento-e-maestria.md`  
**Status atual:** o site não usa `next/image`, `<img>` ou imagens editoriais; a home usa somente texto, o monograma textual `HB` e superfícies CSS.  
**Objetivo:** preencher os gaps visuais sem inventar credenciais, depoimentos ou resultados de saúde.

## Decisão visual obrigatória

A Character Bible determina que Heidi seja representada como persona editorial e que a fotografia/semelhança final aguarde aprovação do publisher. Portanto:

- **Não gerar retrato identificável de Heidi ainda.**
- Priorizar imagens editoriais de ambiente, mãos, objetos, movimento e adultos 40+ sem identidade específica.
- Qualquer pessoa representada deve parecer adulta 40+, natural, diversa e não retocada de forma artificial.
- Não usar jaleco, consultório, estetoscópio ou enquadramento que sugira autoridade médica.
- Não mostrar “antes/depois”, juventude como objetivo, corpo idealizado ou transformação garantida.
- Registrar prompt, modelo, seed/licença e alt text para cada asset aprovado.

## P0 — necessários para a primeira versão visual

### 1. Hero editorial da home

- **Arquivo sugerido:** `04-site/public/images/hero-after-forty.webp`
- **Dimensão:** 2400×1400 px, crop responsivo 16:9/4:3.
- **Uso:** lado direito ou fundo parcial do hero da home.
- **Direção:** adulto 40+ em ambiente doméstico luminoso, postura confiante e tranquila, roupa em neutros com detalhe rose/sage, espaço negativo para headline, textura de pele natural.
- **Evitar:** retrato identificável de Heidi, estética fitness agressiva, “anti-aging”, pele plastificada.
- **Alt text:** `Adult in their 40s enjoying a calm morning routine at home`.

### 2. Imagem institucional de About Heidi

- **Arquivo sugerido:** `04-site/public/images/about-editorial-host.webp`
- **Dimensão:** 1200×1500 px, retrato vertical.
- **Uso:** `/about` e seção Sobre Heidi.
- **Direção:** host editorial adulta 40+, enquadramento documental, expressão serena, cenário de trabalho com livros e caderno, sem aparência clínica.
- **Gate:** gerar somente como personagem editorial genérica até aprovação de likeness de Heidi.
- **Alt text:** `Editorial host working at a desk in a warm, natural setting`.

### 3. Open Graph padrão

- **Arquivo sugerido:** `04-site/public/images/og-after-forty.webp`
- **Dimensão:** 1200×630 px.
- **Uso:** metadata social da home e fallback de artigos.
- **Direção:** wordmark After Forty, textura paper, composição rose/sage, sem texto pequeno ilegível.
- **Alt text:** `After Forty by Heidi Braun — evidence-led guidance after 40`.

### 4. Capa/thumbnail para as três categorias

Criar três imagens horizontais consistentes, para cards e páginas de categoria:

- `skin-health.webp` — 1600×1000 px — frasco neutro, toalha, luz natural e textura de pele sem close invasivo.
- `strength-movement.webp` — 1600×1000 px — faixa elástica/halteres leves em ambiente doméstico real.
- `recovery-longevity.webp` — 1600×1000 px — mesa de cabeceira, luz de manhã, livro e rotina de descanso.

**Regra:** produtos sem marca ou embalagem fictícia; não parecer anúncio ou endosso médico.

## P1 — necessárias para os 12 artigos publicados

Criar uma imagem de capa por artigo, 1600×1000 px, com composição editorial consistente:

1. `article-01-retinol-bakuchiol.webp` — frascos genéricos de skincare e folhas botânicas, sem claims.
2. `article-02-morning-skincare.webp` — rotina matinal simples diante de espelho, sem pessoa identificável.
3. `article-03-sunscreen.webp` — aplicação de protetor solar em braço/mão adulta, sem marca.
4. `article-04-hyaluronic-ceramides.webp` — textura de creme, cerâmica e água, visual não clínico.
5. `article-05-sleep-circadian.webp` — quarto calmo com luz natural de manhã e relógio não-dramático.
6. `article-06-joint-collagen.webp` — caminhada leve/ação cotidiana, sem radiografias ou promessa de regeneração.
7. `article-07-stress-cortisol.webp` — pausa de respiração/caderno em ambiente cotidiano, sem “detox” visual.
8. `article-08-mobility.webp` — mobilidade suave de quadril/lombar em casa, sem pose extrema.
9. `article-09-creatine.webp` — colher e recipiente genérico de creatina monohidratada, sem marca/claim.
10. `article-10-building-muscle.webp` — treino doméstico com halteres/faixa e adulto 40+, natural.
11. `article-11-low-impact-cardio.webp` — caminhada, bicicleta ou água em intensidade confortável.
12. `article-12-protein-guide.webp` — prato com fontes variadas de proteína, sem “diet culture”.

## P2 — infográficos editoriais opcionais

Não são fotografias; devem ser gráficos acessíveis e baseados nos artigos:

- comparação retinol vs. bakuchiol;
- rotina de skincare matinal;
- progressão de treino de força;
- escala de esforço para cardio de baixo impacto;
- distribuição prática de proteína ao longo do dia.

Cada infográfico deve incluir fonte, data de revisão e versão textual acessível no HTML. Não publicar números sem fonte no próprio conteúdo.

## Assets técnicos

Antes do uso em produção, criar/validar:

- `favicon.svg` e ícones Apple/Android derivados do monograma aprovado;
- `og-after-forty.webp` conectado ao metadata global;
- versões WebP/AVIF e fallback JPG quando necessário;
- dimensões explícitas e `sizes` em `next/image`;
- alt text descritivo, não promocional;
- compressão e lazy loading fora do primeiro viewport;
- registro de origem/licença ou prompt/modelo/seed.

## Ordem recomendada de produção

1. OG padrão + hero da home.
2. Três capas de categoria.
3. Capas dos artigos 01–04 (skin).
4. Capas dos artigos 05–08 (recovery/mobility).
5. Capas dos artigos 09–12 (fitness/nutrition).
6. About/portrait somente após decisão de likeness.
7. Infográficos após validação dos dados e fontes.

## Critérios de aceite visual

- [ ] Cada asset tem arquivo, dimensão, formato, alt text e registro de origem.
- [ ] Nenhuma imagem sugere credencial médica, resultado garantido ou produto endossado sem validação.
- [ ] A imagem de hero reserva espaço real para headline em desktop e mobile.
- [ ] As capas formam uma família visual coerente com paper/rose/sage/Cormorant/DM Sans.
- [ ] O site usa `next/image` com dimensões, `sizes` e prioridade somente no hero.
- [ ] A aprovação de likeness de Heidi permanece separada do restante da produção.
