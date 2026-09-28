---
name: geracao-imagens
description: Autonomia e protocolos para criação de prompts avançados, disparo de apps/APIs de geração de imagens por IA e ingestão de assets visuais no site.
---

# Skill: Geração Autônoma de Imagens & Produção Visual por IA

Esta skill concede **autonomia operacional** aos Agentes Gestores da FBR Agency para conceber, gerar prompts e acionar ferramentas de geração de imagens por IA, populando os blogs e aplicações com ativos visuais de altíssimo padrão.

---

## ⚡ 1. Nível de Autonomia & Escopo do Agente

O Agente Gestor possui **autonomia total** para:
1. **Identificar lacunas visuais** no site (Hero sem banner, artigos sem capa, páginas sem fotos de apoio).
2. **Elaborar prompts visuais em inglês** calibrados com a identidade e nicho do projeto.
3. **Disparar ferramentas e APIs de IA de geração de imagem** (ex: Midjourney, Flux.1, OpenAI DALL-E 3 / gpt-image, Google Imagen, Stability ou ferramentas nativas do Hermes como `image_gen`).
4. **Baixar e persistir as imagens** diretamente na pasta `04-site/public/images/` do projeto.
5. **Vincular os caminhos das imagens** no frontmatter dos artigos (`.md`) e nos componentes Next.js (`page.tsx`, `ArticleCard.tsx`).

---

## 🎨 2. Framework Obrigatório para Prompts de Imagem

Ao gerar prompts para ferramentas de IA, siga a estrutura de 5 camadas da FBR Agency:

```
[Sujeito Principal e Ação] + [Ambiente e Cenário Detalhado] + [Iluminação e Atmosfera] + [Estilo Fotográfico / Lente / Detalhes Técnicos] + [Proporção de Tela]
```

### Exemplos de Prompts Calibrados por Tipo de Asset:

#### 🌟 A. Hero Banner da Página Inicial (16:9 ou 21:9)
- **Gamer Aesthetic**: `Ultra-clean modern gaming battlestation with curved ultrawide OLED monitor, minimalist Scandinavian walnut desk, subtle cyber cyan and warm amber accent LED lighting, matte black mechanical keyboard, studio photography, 8k resolution, cinematic atmosphere --ar 16:9`
- **The Thirties (Mulheres 30+)**: `Authentic candid portrait of a confident 35-year-old woman in a sunlit modern apartment, enjoying a morning wellness routine, soft morning sunlight, natural warm tones, Leica 35mm f/1.4 aesthetic, genuine lifestyle photography, ultra-realistic --ar 16:9`
- **After Forty (Longevidade)**: `Active 45-year-old woman with healthy radiant skin doing mindful morning yoga in a minimalist Scandinavian home, natural organic textures, golden hour soft glow, Hasselblad medium format portrait, high aesthetic --ar 16:9`

#### 📰 B. Capas de Artigos de Blog (16:9)
- `Close-up shot of premium wireless audiophile gaming headphones resting on a wooden stand next to a minimalist setup, soft studio depth of field, f/2.8 bokeh, elegant dark aesthetic, crisp details --ar 16:9`
- `Comparison of modern 4K OLED gaming display alongside high refresh rate IPS monitor on a clean desk setup, side-by-side technical review aesthetic, professional tech journalism photography --ar 16:9`

#### 👤 C. Avatar do Gestor Editorial (`/about`) (1:1)
- `Professional editorial headshot of a stylish 32-year-old tech and lifestyle journalist, relaxed authentic expression, modern studio backdrop, soft Rembrandt lighting, natural skin texture, 85mm portrait --ar 1:1`

---

## 🛠️ 3. Pipeline de Execução & Armazenamento

Quando o agente gerar ou obter as imagens:

1. **Destino Físico Obrigatório**:
   - Hero da Home: `04-site/public/images/hero/hero-main.webp`
   - Capas de Artigos: `04-site/public/images/articles/<slug-do-artigo>.webp`
   - Fotos de Apoio no Texto: `04-site/public/images/articles/<slug-do-artigo>-detalhe-1.webp`
   - Avatar do Gestor: `04-site/public/images/authors/<slug-do-gestor>.webp`

2. **Formato & Otimização**:
   - Preferência por `.webp` ou `.jpg` otimizado.
   - Resoluções:
     - Hero: 1920x1080px (16:9)
     - Capas de Artigos: 1200x675px (16:9)
     - Avatares: 600x600px (1:1)

3. **Reconciliação no Código**:
   - Atualizar a propriedade `featured_image` no arquivo `.md` correspondente em `02-conteudo/`.
   - Garantir que o componente do Next.js consome a rota `/images/articles/<slug>.webp`.

---

## 🚀 4. Regra de Entrega
Nenhum blog é considerado pronto para lançamento sem que:
- [x] O Hero da Home contenha uma imagem de alto impacto.
- [x] 100% dos artigos publicados possuam imagens de capa dedicadas.
- [x] A página `/about` possua a fotografia do Gestor Editorial.
