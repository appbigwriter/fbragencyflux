# Tasklist de Finalização — After Forty by Heidi Braun v2

**Base:** `analise-alinhamento-e-maestria.md` + questionário respondido  
**Escopo aprovado:** blog completo + CMS/banco  
**Fonte de estado:** Supabase/Postgres remoto  
**Deploy:** VPS/Easypanel FBR em `afterforty.fbr.news`  
**Idioma:** EN-US global

## Decisões consolidadas

- Migrar os 12 artigos completos para Supabase/Postgres antes do deploy.
- Publicar os 12 artigos na primeira versão.
- Heidi pode publicar conteúdo aprovado pelo checklist editorial; Sergio aprova conteúdo comercial/sensível.
- Busca fica para a segunda versão.
- Usar categorias fixas e tags por artigo.
- Artigos devem exibir data de publicação, data de atualização, tempo de leitura, Heidi Braun como autora/persona, fontes e tags.
- Compartilhamento social e artigos relacionados entram agora.
- Newsletter permanece desativada até escolha de provedor e revisão jurídica.
- Não instalar analytics na primeira versão.
- Afiliados somente com produtos e links validados.
- FBR Ads fica para a segunda versão.
- Privacy, Affiliate Disclosure e Contact devem ser revisados antes do deploy.
- Produção separada do preview; secrets somente no gerenciador do VPS/Easypanel.

## Fase 1 — Contrato de dados e migração editorial

- [ ] Definir schema Supabase para `articles`, `categories`, `tags`, `article_tags` e `article_sources`.
- [ ] Definir estados editoriais: `draft`, `review`, `approved`, `published`, `archived`.
- [ ] Definir campos obrigatórios: slug, title, dek, body/MDX, category, tags, author, published_at, updated_at, reading_time, sources, status e SEO metadata.
- [ ] Criar migration idempotente no Supabase remoto.
- [ ] Validar conexão real com query inofensiva e ler de volta as tabelas criadas.
- [ ] Migrar os 12 artigos de `02-conteudo/` sem perda de conteúdo.
- [ ] Comparar contagem, títulos, slugs e tamanho do conteúdo antes/depois.
- [ ] Registrar evidência de migração e discrepâncias.

**Aceite:** os 12 artigos completos existem no Supabase, com estado inicial definido, e a leitura pela aplicação retorna o conteúdo real.

## Fase 2 — Integração Next.js com Supabase

- [ ] Instalar/configurar cliente Supabase no `04-site` sem incluir secrets no repositório.
- [ ] Criar camada server-side de leitura de artigos.
- [ ] Substituir o mock de `lib/content.ts` por leitura da fonte persistida.
- [ ] Gerar páginas individuais a partir dos artigos publicados.
- [ ] Implementar categorias fixas e tags por artigo.
- [ ] Exibir data, atualização, tempo de leitura, persona, fontes e tags.
- [ ] Preservar fallback controlado apenas para preview/testes, nunca como fonte silenciosa de produção.

**Aceite:** nenhuma página de produção depende do array mockado; os 12 artigos são renderizados pela fonte persistida.

## Fase 3 — Experiência editorial e descoberta

- [ ] Corrigir cards da home para apontarem aos slugs reais.
- [ ] Corrigir listagem `/category/[slug]` para filtrar categoria de verdade.
- [ ] Adicionar tags clicáveis.
- [ ] Adicionar compartilhamento social (WhatsApp, LinkedIn e X) sem expor dados sensíveis.
- [ ] Adicionar seção “Related reading” baseada em categoria/tags.
- [ ] Adicionar TOC para artigos longos quando aplicável.
- [ ] Renderizar listas, subtítulos, tabelas, citações e caixas de evidência do conteúdo completo.
- [ ] Adicionar imagens/ilustrações somente com origem/licença registrada e alinhamento à Character Bible.

**Aceite:** navegação home → categoria → artigo funciona; categoria e tags filtram corretamente; artigos têm leitura rica e relacionados.

## Fase 4 — Compliance, legal e publicação

- [ ] Revisar Privacy, Contact e Affiliate Disclosure antes do deploy.
- [ ] Confirmar que newsletter permanece visualmente desativada e sem captura real.
- [ ] Confirmar que não há analytics instalado.
- [ ] Confirmar que nenhum afiliado sem produto/link validado aparece.
- [ ] Executar revisão editorial dos 12 artigos pelo checklist.
- [ ] Marcar artigos aprovados/publicáveis conforme fluxo Heidi/Sergio.

**Aceite:** conteúdo e páginas legais estão revisados, sem captura indevida, claims não sustentados ou links comerciais fictícios.

## Fase 5 — Deploy VPS/Easypanel

- [ ] Confirmar projeto/serviço e domínio no VPS/Easypanel.
- [ ] Configurar secrets por referência no gerenciador do provedor.
- [ ] Configurar build e start commands.
- [ ] Configurar domínio `afterforty.fbr.news`, DNS e SSL.
- [ ] Deployar em ambiente separado do preview.
- [ ] Executar smoke test autenticado/real das rotas públicas e leitura do Supabase.
- [ ] Validar robots, sitemap, canonical e headers de produção.
- [ ] Registrar rollback e procedimento de recuperação.
- [ ] Submeter o deploy ao gate do Sergio antes de qualquer publicação irreversível.

**Aceite:** produção responde no domínio oficial, lê o Supabase remoto, serve os 12 artigos completos e passa smoke test sem secrets expostos.

## Fase 6 — Segunda versão (fora do primeiro deploy)

- [ ] Busca de artigos.
- [ ] Newsletter com provedor escolhido e consentimento definido.
- [ ] Analytics privacy-first ou alternativa aprovada.
- [ ] FBR Ads.
- [ ] Painel editorial/CMS completo, se necessário além do Supabase.

## Bloqueios atuais verificáveis

- Não há credenciais/configuração de projeto Supabase ou VPS/Easypanel identificadas no diretório do projeto.
- Não há provedor de newsletter escolhido — corretamente mantido desativado.
- Não há confirmação de DNS/SSL ou serviço de produção nesta pasta.

Esses itens não impedem a preparação local do schema, adapters, migrações e testes, mas impedem declarar integração remota ou deploy realizado sem readback real.
