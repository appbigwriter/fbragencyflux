---
name: engenharia-fullstack
description: Padrões de engenharia de software, Next.js, React, APIs, banco de dados e arquitetura desacoplada.
---

# Skill: Engenharia Fullstack, Next.js & Renderização Visual de Imagens

Esta skill guia o desenvolvimento técnico das aplicações, blogs e sites dos projetos da FBR Agency.

## 🛠️ 1. Stack Tecnológica Recomendada
- **Framework**: Next.js (App Router) com React 19.
- **Linguagem**: TypeScript com tipagem estrita e limpa.
- **Estilização**: Tailwind CSS v3/v4 ou CSS Modules / Vanilla CSS com design tokens.
- **Banco de Dados**: Supabase / PostgreSQL ou arquivos Markdown/MDX para blogs editoriais.
- **Ícones & Componentes**: Lucide Icons, Shadcn-like primitives ou componentes nativos reutilizáveis.

---

## 🖼️ 2. Implementação Técnica de Imagens no Blog Next.js

Para evitar que qualquer página ou artigo fique com aparência puramente textual ou vazia, siga estas diretrizes obrigatórias de engenharia de frontend:

### 🌟 A. Componente de Hero da Home (`app/page.tsx`)
- Implementar o Hero com suporte nativo a imagem de destaque ou fundo com overlay:
```tsx
<section className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-white/10 p-8 md:p-12 lg:p-16 my-8">
  {/* Imagem de Fundo com Overlay Gradiente */}
  <div className="absolute inset-0 z-0 opacity-40">
    <img 
      src="/images/hero/hero-main.webp" 
      alt="Hero Background" 
      className="w-full h-full object-cover"
      onError={(e) => {
        // Fallback elegante com Unsplash de alta qualidade caso a imagem local ainda não exista
        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80";
      }}
    />
    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
  </div>

  <div className="relative z-10 max-w-2xl space-y-6">
    {/* Badge + Headline + CTA */}
  </div>
</section>
```

### 📰 B. Cards de Artigos (`ArticleCard`) com Capas `16:9`
Todo card de artigo na listagem de `/articles` e na Home deve conter a imagem de capa com `aspect-video` e fallback:
```tsx
<div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-800">
  <img
    src={article.featured_image || "/images/articles/placeholder.webp"}
    alt={article.title}
    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    loading="lazy"
  />
  <span className="absolute top-3 left-3 rounded-full bg-indigo-600/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
    {article.category}
  </span>
</div>
```

### 📖 C. Página Interna do Artigo (`app/articles/[slug]/page.tsx`)
- O topo do artigo deve exibir o banner da `featured_image` em tamanho amplo (`aspect-video` ou `h-96 md:h-[480px]`) com legenda descritiva.
- Renderizar as imagens inseridas pelo markdown no corpo do artigo com bordas arredondadas e sombra suave (`rounded-2xl shadow-xl my-8 border border-white/5`).

---

## 🚀 3. Boas Práticas Gerais
- **Zero Secrets Expostos**: Chaves de API e credenciais sensíveis sempre em `.env.local` e nunca commitadas.
- **Responsividade Total**: Layouts fluidos adaptados perfeitamente a Mobile, Tablet e Desktop.
- **Performance & SEO**: Metatags Open Graph com a imagem de capa (`og:image`), tags semânticas (HTML5), Core Web Vitals otimizados.
