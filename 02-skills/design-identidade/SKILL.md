---
name: design-identidade
description: Sistema de design visual, paletas de cores, tipografia, tokens e layouts de interfaces premium.
---

# Skill: Design System, Identidade Visual & Diretrizes de Imagens

Esta skill estabelece o padrão estético e visual dos projetos e blogs da FBR Agency.

## 💎 1. Padrão Estético: Estética Premium
- **Tipografia Moderna**: Uso de fontes expressivas (Inter, Outfit, Plus Jakarta Sans, Syne, Space Grotesk).
- **Paleta de Cores Harmônica**: Cores profundas, contrastes calibrados (WCAG AA+), uso inteligente de acentos e gradientes sutis.
- **Glassmorphism & Profundidade**: Sombras suaves, bordas translúcidas (`border: 1px solid rgba(255,255,255,0.1)`), fundos em camadas.
- **Micro-interações e Estados**: Hover states elegantes com zoom suave em cards de imagem (`transform scale-105 transition-all duration-300`).

---

## 🖼️ 2. Padrão Mandatório de Imagens do Site & Blog

Todo blog desenvolvido na FBR Agency **DEVE CONTER IMAGENS REAIS OU ILUSTRAÇÕES DE ALTA RESOLUÇÃO**. É proibido entregar páginas ou artigos compostos exclusivamente por blocos de texto sem suporte visual.

### 🌟 A. Hero Section da Página Inicial (`/`)
O Hero da Home é o cartão de visitas do blog e deve causar forte impacto visual imediato:
- **Layout Recomendado**: 
  - **Split Hero (50/50)**: Texto + Badges + CTAs na coluna esquerda e uma imagem/mockup/fotografia imersiva em alta resolução na coluna direita.
  - **Banner Imersivo Full-Width**: Imagem de fundo panorâmica (proporção 21:9 ou 16:9) com overlay de gradiente escuro (`bg-gradient-to-t from-background via-background/80 to-transparent`) para garantir legibilidade perfeita da tipografia.
- **Dimensões Mínimas**: 1920x1080px ou 1600x900px, formato WebP ou JPEG otimizado.

### 📰 B. Capas & Imagens de Destaque dos Artigos (`Featured Images`)
- **Proporção Obrigatória**: `16:9` (`aspect-video` em CSS/Tailwind) ou `4:3` para thumbnails compactas.
- **Dimensões**: 1200x675px para capa principal do artigo e 800x450px para cards na listagem (`/articles`).
- **Composição Visual**: Fotografia do produto em uso, setup temático ou ilustração editorial alinhada ao nicho.
- **Estilo em Cards**: Cantos arredondados (`rounded-xl` ou `rounded-2xl`), badge de categoria sobreposta e efeito suave de zoom ao passar o mouse (`group-hover:scale-105`).

### 📖 C. Imagens Internas do Corpo dos Artigos
- Cada artigo com mais de 800 palavras deve incluir **no mínimo 1 ou 2 imagens de apoio no corpo do texto**:
  - Fotos de detalhes de produtos analisados (monitores, fones, ergonomia, cosméticos, etc.).
  - Gráficos comparativos, infográficos ou prints de interface.
  - Legendas explicativas (`<figcaption>`) e texto alternativo acessível (`alt="Descrição precisa"`).

### 👤 D. Páginas Institucionais (`/about`, `/contact`, `/guides`)
- **/about**: Foto editorial ou avatar em alta definição do Gestor Editorial do blog, além de imagem do estúdio/cenário da marca.
- **/guides**: Banners temáticos em estilo card horizontal destacando cada guia definitivo.

---

## 📁 3. Estrutura de Pastas de Assets
Ao desenvolver o blog, armazene as imagens em:
`03-projetos/<nome-do-projeto>/04-site/public/images/`
- `hero/` -> Imagens do Hero da Home (`hero-main.webp`, etc.)
- `articles/` -> Capas dos artigos nomeadas pelo slug (`artigo-01-monitors.webp`, etc.)
- `authors/` -> Foto do Gestor Editorial (`author-avatar.webp`)
- `ui/` -> Ícones, badges e logos da marca.

## 📄 4. Formato de Entrega de Design
Salvar tokens e styleguide em:
`03-projetos/<nome-do-projeto>/03-design-ui/tokens.css` e `03-design-ui/README.md`
