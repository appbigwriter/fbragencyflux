# SharpEye — Tasklist objetiva para criação do site

**Status:** tasklist de execução v1  
**Base:** parecer técnico de 28/09/2026 + `architecture.md`, `seo-setup.md`, `legal-pages.md`, `monetization-tags.md`, `deployment-verification.md`  
**Escopo:** blog público SharpEye; não confundir com o painel interno Control Tower encontrado em `.kilo/worktrees/habitual-attempt`.

## Regras de execução

- Stack padrão: Next.js + TypeScript.
- Supabase/PostgreSQL é a fonte de estado de produção; não usar JSON local como banco.
- Segredos somente por referência em runtime; nunca no repositório.
- Migration, publicação, monetização, DNS e deploy exigem Gate explícito de Sergio.
- Cada tarefa só sai de “em andamento” com evidência física, teste e readback aplicável.

## Fase 0 — decisões e preparação

- [ ] **SITE-001 — Confirmar raiz limpa do projeto**
  - Verificar que `04-site` é o site público e isolar qualquer código Control Tower.
  - Aceite: mapa de diretórios e decisão registrada; nenhuma fonte interna alterada.
  - Dependência: nenhuma.

- [ ] **SITE-002 — Aprovar contrato visual/editorial v1**
  - Consolidar persona, disclosure, design tokens, logo, wireframes e CTA.
  - Aceite: decisão Sergio registrada ou itens explicitamente marcados como provisórios.
  - Dependência: SITE-001.

- [ ] **SITE-003 — Inicializar aplicação Next.js limpa**
  - Criar/validar `package.json`, TypeScript, lint, build, `app/`, `src/`, configuração de ambiente e README.
  - Aceite: aplicação sobe localmente; typecheck, lint e build passam.
  - Dependência: SITE-001; Gate para criação/limpeza se houver conteúdo existente.

## Fase 1 — fundação técnica e dados

- [ ] **SITE-004 — Implementar design system base**
  - Tokens, tipografia, grid, responsividade, estados de loading/empty/error/blocked/verified e componentes acessíveis.
  - Aceite: página de demonstração visual; contraste e teclado verificados.
  - Dependência: SITE-002, SITE-003.

- [ ] **SITE-005 — Modelar schema do conteúdo**
  - Definir tipos/contratos para `articles`, `sources`, `teardowns`, `products`, `reviews` e `submissions`.
  - Aceite: schema versionado, campos obrigatórios, estados editoriais e regras de proveniência documentados.
  - Dependência: SITE-003.

- [ ] **SITE-006 — Preparar migrations e RLS do Supabase**
  - Criar migrations, índices, constraints, políticas RLS e seed mínimo não sensível.
  - Aceite: migration reproduzível, rollback documentado, testes de acesso e nenhum segredo no código.
  - Dependência: SITE-005.
  - **Gate:** não aplicar no Supabase remoto sem autorização explícita.

- [ ] **SITE-007 — Implementar adaptador de dados**
  - Criar camada interna para leitura de artigos/fontes e futura escrita editorial, sem acoplar componentes ao SDK.
  - Aceite: contratos tipados, tratamento de erro, estados vazio/bloqueado e testes unitários.
  - Dependência: SITE-005; aplicação remota depende de SITE-006 autorizado.

## Fase 2 — experiência pública

- [ ] **SITE-008 — Construir shell e navegação**
  - Header, footer, disclosure, links legais, busca e navegação responsiva.
  - Aceite: rotas navegam sem 404; teclado, foco e mobile verificados.
  - Dependência: SITE-004, SITE-003.

- [ ] **SITE-009 — Construir homepage**
  - Hero, Featured Teardown, lanes Stop/Read/Move, latest guides, bloco de decisão e About/disclosure.
  - Aceite: conteúdo demonstrativo identificado como draft; layout responsivo sem overflow.
  - Dependência: SITE-004, SITE-008.

- [ ] **SITE-010 — Construir templates de artigo**
  - `/guides/[slug]`, `/comparisons/[slug]`, leitura, fontes, evidências, related content e CTA.
  - Aceite: renderiza artigo válido, estado não encontrado, fontes e disclosure; sem claims sem status.
  - Dependência: SITE-007, SITE-008.

- [ ] **SITE-011 — Construir The Teardown**
  - `/the-teardown`, detalhe, observação/hipótese/recomendação, status de permissão e checklist de teste.
  - Aceite: conteúdo não autorizado não é publicado; consentimento/status aparecem na interface.
  - Dependência: SITE-007, SITE-008.

- [ ] **SITE-012 — Implementar fontes, busca e paginação**
  - `/sources`, busca por intenção/título, filtros e paginação; estados vazio/erro.
  - Aceite: resultados reproduzíveis, links de fonte funcionais, paginação sem duplicatas.
  - Dependência: SITE-007, SITE-010.

- [ ] **SITE-013 — Implementar páginas institucionais**
  - `/about`, `/privacy`, `/terms`, `/disclaimer` e disclosure da persona Nadia.
  - Aceite: todas as páginas acessíveis pelo footer; conteúdo marcado para revisão jurídica quando aplicável.
  - Dependência: SITE-002, SITE-008.

## Fase 3 — conteúdo, SEO e qualidade

- [ ] **SITE-014 — Integrar conteúdo inicial**
  - Revisar e carregar os três artigos-pilar e um Teardown aprovado como drafts ou publicados conforme Gate.
  - Aceite: fontes, data, status editorial, disclosure e slug válidos; nenhum conteúdo é publicado sem revisão.
  - Dependência: SITE-010, SITE-011; Gate editorial.

- [ ] **SITE-015 — Implementar SEO técnico e metadados**
  - Metadata dinâmica, canonical, sitemap, robots, OpenGraph e JSON-LD `Article`/`BreadcrumbList`/`HowTo`/`Product` somente quando aplicável.
  - Aceite: validação de HTML/schema, canonical correto, OG sem imagem quebrada e sitemap acessível.
  - Dependência: SITE-010, SITE-013, SITE-014.

- [ ] **SITE-016 — Executar QA e preparar release**
  - Typecheck, lint, testes, build, acessibilidade, responsividade, performance, segurança, links e smoke browser.
  - Aceite: relatório com comandos, resultados, severidade e evidências; zero bloqueador crítico/alto aberto.
  - Dependência: SITE-009 a SITE-015.

## Fase 4 — produção (Gate separado)

- [ ] **SITE-017 — Configurar monetização aprovada**
  - Somente após contas, IDs, catálogo, consentimento, disclosure e revisão jurídica.
  - Aceite: tags verificadas em staging; nenhuma credencial no repositório.
  - Dependência: SITE-013, SITE-016.
  - **Gate:** aprovação comercial e de privacidade.

- [ ] **SITE-018 — Aplicar migration e configurar runtime**
  - Aplicar Supabase/RLS e variáveis por referência no runtime autorizado.
  - Aceite: readback remoto de schema, RLS e healthcheck; rollback conhecido.
  - Dependência: SITE-006, SITE-016.
  - **Gate:** autorização explícita e credenciais disponíveis por referência.

- [ ] **SITE-019 — Deploy, DNS e verificação de domínio**
  - Publicar runtime, configurar domínio/TLS e executar smoke, sitemap, canonical, schema e readback.
  - Aceite: URL real responde, versão/commit registrados, rollback documentado e receipt de produção.
  - Dependência: SITE-016, SITE-017, SITE-018.
  - **Gate:** publicação e DNS exigem aprovação explícita de Sergio.

## Critério de conclusão do site

O site só é considerado concluído quando SITE-001 a SITE-016 têm evidência verificada, SITE-017 a SITE-019 têm Gates aprovados, o build/testes passam, o conteúdo público possui fontes/disclosures, o runtime responde em URL real e o readback de produção está registrado.

## Bloqueios conhecidos

- O código público do blog ainda não está implementado na raiz principal.
- A conexão/migration do banco do blog ainda não foi executada.
- Supabase remoto, monetização, domínio e deploy permanecem fechados por Gate.
- O worktree `.kilo/worktrees/habitual-attempt` não deve ser reutilizado como aplicação pública sem confirmação, pois o parecer o identifica como painel interno.
