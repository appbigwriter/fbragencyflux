# Gamer Aesthetic — Tasklist de finalização do site

**Versão:** v01  
**Data:** 2026-09-28  
**Base:** análise técnica do estado atual do `04-site`  
**Status:** proposta para discussão; nenhum deploy ou publicação externa foi executado por este documento.

## Premissas e decisão inicial

- Stack preservada: Next.js App Router + React + TypeScript + Tailwind.
- Fonte de conteúdo proposta: Markdown/MDX versionado no repositório, sem banco para o MVP editorial.
- O banco só entra em escopo se Sergio aprovar painel administrativo, login ou edição online.
- O deploy externo continua bloqueado até existir target/contrato de infraestrutura aprovado.
- Cada tarefa só pode ser marcada como concluída com artefato e evidência verificável.

## Ordem de execução

`GSN-001` → `GSN-002` → `GSN-003` → `GSN-004` → `GSN-005` → `GSN-006` → `GSN-007` → `GSN-008` → `GSN-009` → `GSN-010` → `GSN-011` → `GSN-012` → `GSN-013` → `GSN-014` → `GSN-015` → `GSN-016` → `GSN-017` → `GSN-018` → `GSN-019`.

`GSN-020` (banco/CMS) é uma trilha opcional e não bloqueia o MVP MDX. `GSN-021` e `GSN-022` dependem da definição do target.

---

## Fase A — Decisões e arquitetura

### GSN-001 — Aprovar fonte de verdade do conteúdo
- **Objetivo:** registrar a decisão MDX local, Supabase/PostgreSQL ou Headless CMS.
- **Dependência:** nenhuma.
- **Artefato:** `decisoes-site.md`.
- **Aceite:** decisão explícita; trade-offs; impacto em custo, SEO, workflow e deploy; owner e data da decisão.

### GSN-002 — Definir contrato editorial de posts
- **Objetivo:** padronizar frontmatter e componentes permitidos.
- **Dependência:** GSN-001.
- **Artefato:** `content/post-schema.ts` ou `docs/content-contract.md`.
- **Aceite:** schema valida `slug`, `title`, `description`, `date`, `updatedAt`, `author`, `category`, `tags`, `cover`, `readingTime`, `draft` e disclosure afiliado; post inválido falha no build.

### GSN-003 — Modularizar e formatar o código existente
- **Objetivo:** eliminar JSX compactado e separar componentes reutilizáveis.
- **Dependência:** GSN-001.
- **Aceite:** typecheck, lint e build passam; componentes de layout, cards, navegação, callout e artigo ficam isolados; nenhuma rota existente quebra.

## Fase B — Conteúdo e modelo editorial

### GSN-004 — Criar pipeline Markdown/MDX
- **Objetivo:** ler, validar, ordenar e renderizar posts do diretório `content/posts/`.
- **Dependência:** GSN-002.
- **Artefatos:** loader, parser, schema e documentação.
- **Aceite:** posts publicados aparecem; drafts não aparecem em produção; ordenação por data funciona; erro de frontmatter interrompe build com mensagem clara.

### GSN-005 — Migrar os três artigos existentes para o pipeline
- **Objetivo:** transformar os artigos do `02-conteudo/` em posts renderizáveis.
- **Dependência:** GSN-004.
- **Aceite:** três posts têm slug único, metadados completos, links internos e disclosure; conteúdo não é perdido; cada rota dinâmica responde HTTP 200.

### GSN-006 — Revisar e ampliar o lote editorial inicial
- **Objetivo:** garantir conteúdo suficiente para lançamento.
- **Dependência:** GSN-005.
- **Aceite:** pelo menos três artigos publicados revisados; cada artigo possui título, introdução, seções, conclusão, fontes quando aplicável e CTA afiliado conforme compliance; sem promessas não comprovadas.

## Fase C — Rotas e experiência de leitura

### GSN-007 — Implementar rota dinâmica de artigo
- **Objetivo:** criar `app/guides/[slug]/page.tsx` ou rota equivalente aprovada.
- **Dependência:** GSN-004.
- **Aceite:** `generateStaticParams`, página 404, metadata por artigo e renderização MDX; todos os slugs válidos compilam no build.

### GSN-008 — Implementar feed de artigos na homepage
- **Objetivo:** substituir cards estáticos por artigos reais.
- **Dependência:** GSN-005.
- **Aceite:** home exibe pelo menos três cards com imagem/título/excerpt/categoria/data; cada card aponta para slug válido; estado vazio é tratado.

### GSN-009 — Implementar navegação global e breadcrumbs
- **Objetivo:** conectar Home, Guides, categorias, About, Contact e Disclaimer.
- **Dependência:** GSN-007.
- **Aceite:** nenhuma navegação interna relevante aponta para rota inexistente; breadcrumbs aparecem em páginas de artigo; navegação funciona em viewport móvel e desktop.

### GSN-010 — Implementar categorias, tags e filtros
- **Objetivo:** permitir descoberta por taxonomia.
- **Dependência:** GSN-004 e GSN-008.
- **Aceite:** páginas de categoria/tag listam somente posts correspondentes; filtros não geram links quebrados; taxonomia vem do frontmatter, não de arrays duplicados.

### GSN-011 — Implementar busca
- **Objetivo:** permitir busca client-side no catálogo publicado do MVP.
- **Dependência:** GSN-008.
- **Aceite:** busca por título, resumo e tags; estado sem resultados; teclado/acessibilidade; sem chamada a serviço externo obrigatório.

### GSN-012 — Completar template de artigo
- **Objetivo:** elevar o template demo a template editorial de produção.
- **Dependência:** GSN-007.
- **Aceite:** autor, data, data de atualização, tempo de leitura, sumário, headings, links relacionados, CTA afiliado e disclaimer; contraste e foco verificados.

## Fase D — Imagens, SEO e distribuição

### GSN-013 — Implementar imagens e assets otimizados
- **Objetivo:** adicionar capas/thumbnails com `next/image`.
- **Dependência:** GSN-005 e GSN-008.
- **Aceite:** cada post publicado tem imagem válida ou fallback explícito; dimensões, alt text e fonte/licença registrados; nenhuma imagem quebra o build.

### GSN-014 — Implementar metadata e Open Graph dinâmicos
- **Objetivo:** gerar metadata por rota e artigo.
- **Dependência:** GSN-007.
- **Aceite:** title, description, canonical, OG e Twitter cards variam por página; URLs usam o domínio aprovado; preview sem secrets e sem dados fictícios apresentados como reais.

### GSN-015 — Implementar sitemap e robots
- **Objetivo:** habilitar indexação controlada.
- **Dependência:** GSN-007.
- **Aceite:** `/sitemap.xml` inclui apenas rotas públicas; `/robots.txt` bloqueia drafts e aponta para sitemap; ambos respondem HTTP 200 no build/servidor.

### GSN-016 — Implementar Schema.org JSON-LD
- **Objetivo:** adicionar `Organization`, `WebSite`, `Article` e `BreadcrumbList` conforme a rota.
- **Dependência:** GSN-012 e GSN-014.
- **Aceite:** JSON-LD é válido, não duplica conteúdo enganoso e contém somente dados presentes na página.

## Fase E — Qualidade, compliance e observabilidade

### GSN-017 — Auditoria de links, acessibilidade e responsividade
- **Objetivo:** revisar a experiência real das rotas.
- **Dependência:** GSN-009, GSN-012 e GSN-013.
- **Aceite:** links internos/externos testados; teclado e foco verificados; headings hierárquicos; viewport móvel sem overflow horizontal; imagens com alt.

### GSN-018 — Revisar compliance editorial e afiliados
- **Objetivo:** validar disclosures e linguagem de monetização.
- **Dependência:** GSN-006 e GSN-012.
- **Aceite:** disclosure visível antes de CTAs afiliados; About/Contact/Disclaimer acessíveis; nenhuma afirmação de preço, disponibilidade ou desempenho sem fonte/qualificação.

### GSN-019 — QA automatizado e release candidate
- **Objetivo:** consolidar a versão candidata a publicação.
- **Dependência:** GSN-017 e GSN-018.
- **Aceite:** `npm run lint`, typecheck, `npm run build`, testes de rotas e auditoria npm passam; relatório registra comandos, resultados, data e limitações.

## Fase F — Trilhas condicionais

### GSN-020 — Avaliar banco/CMS e painel editorial (opcional)
- **Objetivo:** decidir se o MVP precisa de edição online e persistência de conteúdo.
- **Dependência:** GSN-001 e GSN-019.
- **Gate:** aprovação explícita de Sergio antes de criar schema, migration, autenticação ou custo recorrente.
- **Aceite:** decisão documentada; se aprovado, contrato de dados, RLS, migrations idempotentes, backup, auth e plano de rollback definidos antes da implementação.

### GSN-021 — Definir target e contrato de infraestrutura
- **Objetivo:** escolher Easypanel/VPS, Vercel ou staging privado.
- **Dependência:** GSN-019.
- **Gate:** aprovação explícita de Sergio.
- **Aceite:** owner, domínio, DNS, runtime, variáveis por referência, health check, rollback, custo e responsável operacional registrados.

### GSN-022 — Executar deploy externo e readback
- **Objetivo:** publicar somente após target aprovado.
- **Dependência:** GSN-021.
- **Gate:** aprovação de deploy; não inferir autorização por silêncio.
- **Aceite:** URL HTTPS real; `/`, `/guides` e pelo menos um artigo respondem HTTP 200; sitemap/robots acessíveis; logs sem secrets; readback externo anexado ao registro; rollback testado ou documentado.

## Definition of Done da finalização

O site só será considerado finalizado quando:

- GSN-001 a GSN-019 estiverem concluídas com evidências;
- GSN-020 estiver decidida (executada ou explicitamente fora do escopo);
- GSN-021 estiver aprovada e documentada;
- GSN-022 estiver executada com URL e readback externo;
- build, lint, typecheck, acessibilidade, compliance e rotas estiverem verificados;
- nenhuma credencial, token ou secret aparecer em código, logs, commits ou handoffs.
