# The Thirties — Tasklist objetiva para finalizar o site

Projeto: The Thirties by Maia Mendes
Diretório: `F:\Projetos\_FBR\FBR Agency Flux\03-projetos\thethirties\04-site`
Stack: Next.js 16, React 19, TypeScript, Supabase/Postgres
Estado de partida: scaffold local compilável; conteúdo e arquitetura existem; banco, rotas editoriais, CMS e publicação ainda não estão implementados.

## Ordem de execução

As tarefas devem ser executadas nesta ordem, respeitando dependências. Cada item só pode ser marcado como concluído com artefato e evidência.

### Fase 0 — Decisões e contratos

- [ ] SITE-001 — Congelar escopo da V1
  - Definir páginas públicas, tipos de conteúdo, categorias, idioma, domínio canônico e fora de escopo.
  - Aceite: documento de escopo aprovado e consistente com `architecture-contracts-v1.md`.
  - Dependência: nenhuma.
  - Gate: decisão de produto do Sergio para qualquer mudança de escopo.

- [ ] SITE-002 — Confirmar dados operacionais
  - Registrar publisher, responsável, e-mail, avatar, domínio/canonical e contato de privacidade.
  - Aceite: nenhum placeholder obrigatório permanece nas páginas públicas.
  - Dependência: decisão do Sergio; não inventar dados.
  - Gate: dados reais fornecidos pelo Publisher.

### Fase 1 — Base técnica local

- [x] SITE-003 — Scaffold Next.js compilável
  - Base App Router, TypeScript, layout, homepage e tokens conectados.
  - Evidência atual: `npm run typecheck`, `npm run build`, `npm audit --omit=dev` passaram; 0 vulnerabilidades.
  - Dependência: nenhuma.

- [ ] SITE-004 — Configuração de qualidade e ambiente
  - Adicionar lint funcional, scripts de teste, `.env.example` sem secrets, política de headers e configuração de imagens.
  - Aceite: typecheck, lint, testes e build executam de forma reproduzível; nenhum secret no repositório.
  - Dependência: SITE-003.

- [ ] SITE-005 — Camada de conteúdo tipada
  - Definir tipos para Article, Video, Source, Claim, Disclosure, MediaAsset e ReviewGate.
  - Aceite: conteúdo inválido falha com erro determinístico; locale obrigatório `en-US`; status de revisão explícito.
  - Dependência: SITE-001.

### Fase 2 — Conteúdo e rotas públicas

- [ ] SITE-006 — Renderizador de conteúdo
  - Implementar Markdown/MDX ou adapter CMS escolhido, com headings, listas, links, fontes, disclosures e notas acessíveis.
  - Aceite: TT-005 renderiza sem perda de conteúdo e sem HTML inseguro.
  - Dependência: SITE-005.

- [ ] SITE-007 — Página inicial editorial
  - Substituir conteúdo hardcoded por listagem de artigos/vídeos, destaque, categorias e CTA de newsletter sem captura real até configuração.
  - Aceite: homepage funciona sem dados externos e exibe estado vazio seguro.
  - Dependência: SITE-006.

- [ ] SITE-008 — Rota dinâmica de artigos
  - Criar `/articles/[slug]`, metadata por artigo, tempo de leitura, fontes, disclosure e CTA relacionado.
  - Aceite: TT-005 abre por slug; slug inexistente retorna 404; conteúdo YMYL mostra fontes/disclaimer.
  - Dependência: SITE-006.

- [ ] SITE-009 — Rotas institucionais
  - Criar `/about`, `/disclaimer`, `/contact` e `/privacy`.
  - Aceite: todas as rotas respondem 200 no staging; dados pendentes permanecem marcados sem fingir informação real.
  - Dependência: SITE-002 e conteúdo institucional.

- [ ] SITE-010 — Categorias, tags e busca
  - Implementar `/topics/[slug]`, tags e busca textual local/server-side; paginação somente se houver volume real.
  - Aceite: filtros não misturam projetos, resultados vazios são tratados e cada página tem metadata.
  - Dependência: SITE-006.

### Fase 3 — SEO, acessibilidade e distribuição

- [ ] SITE-011 — SEO técnico
  - Metadata, canonical `thethirties.fbr.news`, Open Graph, Twitter/X cards, robots, sitemap, RSS e JSON-LD Article.
  - Aceite: validação local dos arquivos; canonical sem domínio placeholder; JSON-LD não contém claims inventados.
  - Dependência: SITE-008 e SITE-002.

- [ ] SITE-012 — Acessibilidade e responsividade
  - Navegação por teclado, foco visível, landmarks, contraste, captions/transcript e alt text.
  - Aceite: auditoria automatizada sem erros críticos; TT-005 mantém disclosure e transcript acessíveis.
  - Dependência: SITE-008.

- [ ] SITE-013 — Componentes de compliance editorial
  - Componentes reutilizáveis para disclosure de afiliado, Sources, limitation note, aviso YMYL e chamada profissional.
  - Aceite: componente não permite publicação de artigo YMYL sem Sources/disclosure exigidos.
  - Dependência: SITE-005 e SITE-006.

- [ ] SITE-023 — Produzir e integrar assets visuais
  - Criar IMG-001 a IMG-007 conforme `03-design-ui/image-asset-inventory-v1.md`, registrar origem/licença/prompt e conectar logo, favicon, OG, avatar e TT-005.
  - Aceite: arquivos válidos, alt text factual, `next/image` otimizado, sem logos/produtos não validados, build e verificação visual passam.
  - Dependência: SITE-001, SITE-004, decisão visual Q11/Q12 do questionário.
  - Gate: aprovação da direção visual antes da produção final/publicação.

### Fase 4 — Supabase/Postgres

- [ ] SITE-014 — Provisionar projeto Supabase autorizado
  - Criar referência de projeto e ambiente sem expor URL/chaves sensíveis no Git.
  - Aceite: conexão server-side configurada por referência de secret; health check sem revelar secrets.
  - Dependência: SITE-001/002.
  - Gate: autorização do Sergio para provisionamento/uso do projeto.

- [ ] SITE-015 — Criar migrations idempotentes
  - Implementar entidades da arquitetura: projects, content_items, sources, claims, disclosures, review_gates, media_assets e audit_events.
  - Aceite: migration aplica em ambiente vazio, pode ser repetida sem duplicação e tem rollback/documentação.
  - Dependência: SITE-014.
  - Gate: revisão técnica antes de aplicar em ambiente remoto.

- [ ] SITE-016 — RLS, auth e isolamento
  - Implementar RLS, papéis editoriais, sessão server-side e testes positivos/negativos de isolamento.
  - Aceite: usuário sem sessão recebe 401; fora do projeto recebe 403; dados de outro projeto não aparecem.
  - Dependência: SITE-015.
  - Gate: revisão de segurança antes de produção.

- [ ] SITE-017 — Adapter de conteúdo Supabase
  - Trocar fixture local por leitura tipada do Supabase, com timeout, erro sanitizado, cache/revalidação e estado vazio.
  - Aceite: homepage e artigo carregam conteúdo publicado; falha do banco não expõe secrets nem quebra a página de erro.
  - Dependência: SITE-016 e SITE-006.

### Fase 5 — Área editorial e gates

- [ ] SITE-018 — Preview protegido e revisão editorial
  - Criar preview por status/versionamento; impedir publicação implícita ao salvar rascunho.
  - Aceite: draft não aparece em rota pública; preview exige sessão autorizada; versão stale é rejeitada.
  - Dependência: SITE-016/017.

- [ ] SITE-019 — Registro de Gates e auditoria
  - Persistir decisões de revisão/publicação/monetização com ator, data, versão, motivo e correlation ID.
  - Aceite: cada mudança relevante gera audit event sanitizado e readback do estado.
  - Dependência: SITE-015/016.

### Fase 6 — QA, staging e publicação

- [ ] SITE-020 — Testes automatizados
  - Unitários de schemas/adapters; integração de rotas; testes de segurança/RLS; testes de renderização TT-005.
  - Aceite: suíte reproduzível e verde no diretório `04-site`.
  - Dependência: SITE-004, SITE-006, SITE-017.

- [ ] SITE-021 — Staging e verificação externa
  - Criar staging, executar smoke tests, verificar rotas, SEO, acessibilidade, logs e readback externo.
  - Aceite: URL de staging verificável, sem conteúdo público acidental, relatório de smoke tests anexado.
  - Dependência: SITE-020.
  - Gate: autorização para staging remoto.

- [ ] SITE-022 — Produção, domínio e monitoramento
  - Configurar domínio, canonical, analytics consentido, alertas e rollback.
  - Aceite: health check, SSL, DNS, sitemap, RSS e logs confirmados após deploy.
  - Dependência: SITE-021 e dados de SITE-002.
  - Gate: aprovação formal do Sergio para deploy/publicação/monetização.

## Definição de pronto do site

O site só pode ser declarado finalizado quando:

1. todas as tarefas SITE-001 a SITE-023 aplicáveis estiverem concluídas ou tiverem exceção formal;
2. `typecheck`, `lint`, testes e `build` passarem;
3. artigos e vídeos renderizarem com Sources, disclosure e acessibilidade;
4. Supabase/RLS/auth forem verificados com testes de isolamento;
5. SEO técnico, sitemap, RSS e canonical forem conferidos;
6. staging tiver smoke test e readback;
7. Sergio aprovar formalmente produção, domínio e monetização;
8. deploy e estado externo forem verificados depois da execução.

## Bloqueios atuais

- Dados reais do Publisher, contato e domínio/canonical final.
- Decisão de identidade visual final para transformar tokens em marca aprovada.
- Projeto Supabase autorizado e referências de secrets.
- Aprovação formal de staging/produção/deploy.

Nenhum bloqueio autoriza inventar dados, secrets, endpoints ou aprovação.
