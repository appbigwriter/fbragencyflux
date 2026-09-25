# Talk to Your Crowd — Checklist de Estrutura Mínima do Blog/CMS

**Projeto:** Talk to Your Crowd / Marcus Cole  
**Fase:** Persona e autoridade editorial  
**Versão:** v1  
**Domínio de referência:** `talktoyourcrowd.fbr.news`  
**Status desta entrega:** checklist de planejamento; não autoriza deploy, publicação ou criação de secrets.  
**Owner editorial:** Marcus Cole  
**QA/compliance:** Gabe  
**Gate de publicação/mutação:** Sergio  

## 1. Escopo e regras da fase

- [ ] Manter a estrutura independente de produtos, ASINs, preços, ratings, disponibilidade, links afiliados e monetização.
- [ ] Usar o blog como infraestrutura de autoridade editorial sobre storefronts, sinalização, varejo local e experiência no ponto de venda.
- [ ] Não publicar, apontar DNS, fazer deploy, criar credenciais/secrets ou conectar serviços externos como parte deste checklist.
- [ ] Tratar `talktoyourcrowd.fbr.news` como domínio documentado de referência, não como autorização de publicação.
- [ ] Registrar decisões pendentes como bloqueio ou decisão; não preencher lacunas com claims inventados.
- [ ] Manter a experiência pública planejada em EN-US, com labels de CMS e documentação operacional claros para a equipe.

## 2. Arquitetura mínima de páginas

### 2.1 Páginas obrigatórias

- [ ] **Home (`/`)**: proposta editorial em uma frase, foco temático, artigos/pilares recentes e caminho para o autor.
- [ ] **Articles/Journal (`/articles/`)**: índice paginado ou carregável de artigos publicados, com título, resumo, data, categoria e autor.
- [ ] **Category index (`/topics/`)**: lista das categorias ativas, cada uma com descrição curta e link para seu arquivo.
- [ ] **Category archive (`/topics/{slug}/`)**: descrição da categoria, artigos publicados e paginação; não criar arquivos vazios indexáveis.
- [ ] **Author page (`/author/marcus-cole/`)**: biografia editorial, foto/identidade aprovada, áreas de autoridade, links para artigos e data de atualização da bio.
- [ ] **About/editorial point of view (`/about/`)**: missão, escopo, limites editoriais e o que o site não promete.
- [ ] **Contact ou editorial feedback (`/contact/`)**: canal definido ou placeholder não publicado; não expor endereço pessoal ou secret.
- [ ] **Privacy (`/privacy/`)** e **Terms (`/terms/`)**, quando houver coleta, analytics, comentários, formulários ou requisitos legais aplicáveis; devem passar por revisão antes de publicação.
- [ ] **Disclosure (`/disclosure/`)**, se houver relação comercial, conteúdo patrocinado, links afiliados ou outro incentivo material; não ativar texto comercial nesta fase sem fato que o sustente.
- [ ] **404**: informa que a página não foi encontrada e oferece caminhos para Home, Articles e Topics.

### 2.2 Regras de navegação e URL

- [ ] Navegação primária contém, no mínimo, Articles, Topics, About e Author.
- [ ] Toda página indexável tem um único propósito e um caminho de retorno para a arquitetura principal.
- [ ] Slugs são estáveis, minúsculos, sem acentos, sem espaços e sem parâmetros desnecessários.
- [ ] Artigo usa um padrão consistente, preferencialmente `/articles/{slug}/`; mudanças futuras devem preservar redirect documentado.
- [ ] Categorias usam um único padrão, preferencialmente `/topics/{slug}/`; não duplicar a mesma categoria com URLs alternativas.
- [ ] Breadcrumbs mostram Home → seção/categoria → artigo quando aplicável.
- [ ] Links internos não dependem de produto para criar contexto ou navegação.
- [ ] Links para rascunhos, revisões, páginas privadas e URLs de preview ficam bloqueados para crawlers e não entram no sitemap.

## 3. Taxonomia editorial mínima

### 3.1 Categorias iniciais

Usar poucas categorias, mutuamente compreensíveis e ligadas à autoridade do projeto:

- [ ] **Storefronts & Visibility** — fachada, legibilidade, primeira impressão e presença na rua.
- [ ] **Signage & Wayfinding** — sinalização, orientação, hierarquia visual e clareza no ponto de venda.
- [ ] **Local Retail Experience** — experiência de compra, fricções e contexto do varejo local.
- [ ] **In-Store Communication** — mensagens, informação e comunicação dentro da loja.
- [ ] **Field Notes** — observações, padrões e aprendizados de campo claramente identificados como observação.
- [ ] **Point of View** — ensaios e posições autorais de Marcus Cole, sem apresentar opinião como dado factual.

### 3.2 Regras da taxonomia

- [ ] Cada artigo tem **uma categoria primária**; categorias secundárias só quando agregarem navegação real.
- [ ] Tags são opcionais e controladas; não criar uma tag para cada artigo, marca ou produto.
- [ ] Cada categoria tem slug, nome EN-US, descrição, owner editorial e critério de inclusão.
- [ ] Categoria nova exige justificativa editorial e revisão de sobreposição com categorias existentes.
- [ ] Não usar categorias comerciais, de afiliado ou de produto nesta fase.
- [ ] Termos sensíveis ou claims de mercado precisam de fonte no brief/editorial record, não apenas no título.

## 4. Template mínimo de artigo

### 4.1 Metadados do CMS

- [ ] `title`: título claro, específico e não sensacionalista.
- [ ] `slug`: derivado do título, estável e revisado antes de aprovação.
- [ ] `excerpt/dek`: resumo editorial de uma ou duas frases, sem claim não sustentado.
- [ ] `primary_category`: exatamente uma categoria publicada.
- [ ] `secondary_categories/tags`: somente quando justificadas.
- [ ] `author`: referência ao author page canônico de Marcus Cole ou autor aprovado.
- [ ] `status`: `draft`, `review` ou `approved` (ver seção 8).
- [ ] `created_at`, `updated_at` e `published_at`: armazenados separadamente; `published_at` só existe após aprovação e publicação autorizada.
- [ ] `featured_image` e `image_alt`: opcionais, mas alt text obrigatório quando houver imagem.
- [ ] `canonical_url`: definido ou gerado de forma consistente, sem apontar para preview.
- [ ] `seo_title` e `meta_description`: campos revisáveis, sem keyword stuffing.
- [ ] `disclosure_required` e `disclosure_text`: campos condicionais, conforme seção 7.
- [ ] `sources/notes`: registro interno de fontes, observações e limitações quando houver fatos verificáveis.

### 4.2 Corpo e apresentação

- [ ] Lead responde rapidamente qual problema editorial o texto examina.
- [ ] H1 é único e coincide com o título apresentado ao leitor.
- [ ] Subtítulos seguem hierarquia H2/H3 sem saltos arbitrários.
- [ ] Corpo contém ponto de vista, evidência/observação identificada e implicação prática para a audiência.
- [ ] Fatos, hipóteses, opiniões e limitações são distinguíveis.
- [ ] Citações e referências têm atribuição; não copiar texto ou imagem sem permissão/licença aplicável.
- [ ] Links externos relevantes abrem com contexto; links quebrados são corrigidos antes de aprovação.
- [ ] Artigo termina com próximo passo editorial: artigo relacionado, categoria, author page ou feedback; não exige CTA de produto.
- [ ] Rodapé mostra autor, data de atualização e disclosure somente quando aplicável.
- [ ] Layout é legível em mobile, teclado e leitor de tela; não depende apenas de cor para comunicar estado.

### 4.3 Critérios mínimos de aprovação editorial

- [ ] A pauta serve à autoridade de Marcus Cole e cabe no escopo temático.
- [ ] O texto não depende de produto, ASIN ou monetização.
- [ ] Claims verificáveis têm fonte ou estão explicitamente qualificados como opinião/observação.
- [ ] Título, categoria, autor, slug, links e metadados estão completos.
- [ ] Imagens, citações e dados têm origem/licença/atribuição registrada quando aplicável.
- [ ] O texto passou por revisão editorial e QA antes de entrar em `approved`.

## 5. Author page

- [ ] Existe uma página canônica por autor, com slug estável e `rel="author"`/dados equivalentes nos artigos.
- [ ] Bio curta explica experiência, ponto de vista e escopo; não inventa credenciais, clientes, resultados ou experiência de campo.
- [ ] Bio longa ou editorial statement pode registrar limites, método e temas acompanhados.
- [ ] Foto/avatar tem fonte, permissão e alt text; se não houver asset aprovado, usar placeholder não publicado.
- [ ] Lista de artigos é filtrável por status público apenas; drafts e reviews nunca aparecem.
- [ ] Data de revisão da bio fica registrada no CMS/documentação.
- [ ] Alteração de autor, bio ou URL exige revisão de consistência nos artigos e no schema.
- [ ] Se houver mais de um autor no futuro, cada autor recebe identidade, ownership e revisão próprios; não usar “ทีม/editorial” como autor genérico sem definição.

## 6. Sitemap e SEO técnico básico

### 6.1 Indexação e descoberta

- [ ] Gerar sitemap apenas para URLs públicas, canônicas e aprovadas.
- [ ] Incluir no sitemap: Home, Articles publicados, Categories com conteúdo e Author pages públicas.
- [ ] Excluir drafts, reviews, previews, páginas privadas, 404, duplicatas, filtros e URLs com parâmetros.
- [ ] `robots.txt` não bloqueia acidentalmente páginas públicas essenciais e não promete acesso a área privada.
- [ ] Definir canonical por página; canonical nunca aponta para preview, draft ou URL não autorizada.
- [ ] Aplicar `noindex` a estados não públicos e páginas de baixa utilidade que não devam ser descobertas.
- [ ] Registrar qualquer submissão futura a ferramenta de webmaster como ação separada, dependente de autorização de publicação; não executar neste job.

### 6.2 Metadados e semântica

- [ ] Cada página indexável tem title único, meta description útil e idioma `en-US` quando publicada em EN-US.
- [ ] Open Graph/Twitter cards usam título, descrição, URL canônica e imagem aprovada, sem conteúdo promocional não sustentado.
- [ ] Dados estruturados, se implementados, refletem apenas dados visíveis e verdadeiros: `Article`, `Person`, `BreadcrumbList` e `WebSite` conforme aplicável.
- [ ] `datePublished` só é preenchido após publicação autorizada; `dateModified` acompanha alterações reais.
- [ ] Imagens têm dimensões, compressão e alt text adequados; não inserir tracking ou pixel sem decisão documentada.
- [ ] Links internos formam caminhos entre pilares, categorias e autor sem páginas órfãs.
- [ ] Verificar status HTTP, canonical, title, headings, sitemap e robots em ambiente de revisão antes de eventual publicação.

### 6.3 Qualidade técnica

- [ ] Layout responsivo e acessível: foco visível, navegação por teclado, contraste e labels de formulário.
- [ ] Performance básica é observada sem transformar métricas em gate de produto: imagens otimizadas, CSS/JS mínimo e ausência de recursos desnecessários.
- [ ] Comentários, formulários e analytics são opt-in de arquitetura e entram em revisão de privacidade antes de ativação.
- [ ] Nenhum secret, token, chave, credencial ou dado pessoal é colocado no repositório, no CMS ou no documento.

## 7. Disclosure quando aplicável

### 7.1 Gatilhos

- [ ] Marcar `disclosure_required = true` quando houver relação material, patrocínio, compensação, link afiliado, produto recebido, parceria ou incentivo que possa influenciar o conteúdo.
- [ ] Marcar como não aplicável quando o artigo for editorial independente e não houver relação material conhecida; registrar a decisão no review.
- [ ] Não inserir disclosure genérico para simular conformidade nem declarar uma relação que não foi confirmada.
- [ ] Qualquer futura associação comercial é trilha separada e não pode bloquear a autoridade editorial desta fase.

### 7.2 Implementação

- [ ] Disclosure é claro, próximo do conteúdo relevante e escrito em linguagem compreensível para o leitor.
- [ ] O texto identifica a natureza da relação sem esconder a informação em uma página inacessível.
- [ ] Link para `/disclosure/` pode complementar, mas não substituir o aviso contextual quando necessário.
- [ ] Registrar no CMS quem revisou, quando revisou e qual fato acionou o disclosure.
- [ ] Gabe revisa disclosure e Sergio aprova qualquer ativação/publicação correspondente.

## 8. Estados editoriais e transições

| Estado | Significado | Pode ser público? | Requisitos para entrar | Próxima ação |
|---|---|---:|---|---|
| `draft` | Ideia ou texto em produção; pode estar incompleto. | Não | Brief mínimo, owner e escopo definidos. | Autor completa estrutura e fontes. |
| `review` | Texto pronto para revisão editorial/QA. | Não | Metadados completos, categoria/autor definidos, links e fontes revisados, disclosure avaliado. | Marcus revisa conteúdo; Gabe revisa coerência, claims e disclosure. |
| `approved` | Conteúdo aprovado para eventual publicação, sem significar que foi publicado. | Não por padrão | Review editorial e QA registrados; slug, SEO, acessibilidade, imagens e disclosure aprovados. | Aguardar gate explícito de Sergio para publicar/deploy. |
| `published` *(fora do escopo operacional deste job)* | Conteúdo público em URL canônica. | Sim | Autorização explícita de publicação, deploy verificado e sitemap/robots coerentes. | Monitorar alterações e manter histórico. |

Regras de transição:

- [ ] Proibir `draft → approved` sem passar por `review`.
- [ ] Proibir qualquer estado não público de aparecer em índice, feed, busca interna pública, sitemap ou dados estruturados públicos.
- [ ] Toda transição registra owner, data, decisão, pendências e evidência mínima no card/histórico.
- [ ] Reprovação retorna a `draft` com motivo objetivo; não apagar histórico.
- [ ] Alteração material em título, claim, autor, disclosure, URL ou corpo após aprovação retorna a `review`.
- [ ] `approved` não equivale a autorização de publicação; publicação depende do gate de Sergio.

## 9. Registro mínimo de QA e evidência

Para cada template, página estrutural ou artigo em revisão, registrar:

- **O que:** URL/slug, template ou item auditado.
- **Quando:** data e hora da verificação.
- **Achado:** resultado factual, incluindo falhas.
- **Severidade:** crítica, alta, média ou baixa.
- **Ação:** correção, decisão ou dependência.
- **Antes/depois:** quando houver correção.
- **Owner:** pessoa/agente responsável pela próxima ação.

## 10. Critérios de aceite desta checklist

- [ ] A entrega cobre arquitetura de páginas, categorias, template de artigo, author page, disclosure condicional, sitemap/SEO técnico básico e estados `draft/review/approved`.
- [ ] Cada seção possui itens verificáveis e não depende de produto, ASIN, monetização ou publicação externa.
- [ ] O domínio documentado aparece apenas como referência; não há instrução de deploy, DNS, secret ou publicação.
- [ ] O fluxo diferencia aprovação editorial de publicação e exige gate de Sergio para a última.
- [ ] A estrutura distingue fatos, opiniões/hipóteses, bloqueios e decisões e prevê registro de evidência.
- [ ] Não existem credenciais, tokens, secrets ou dados pessoais no documento.

## 11. Bloqueios e decisões pendentes

- **Bloqueio:** nenhuma publicação externa está autorizada nesta fase; o checklist permanece como especificação de estrutura e QA.
- **Decisão pendente:** definir a implementação concreta do CMS/stack em job separado, sem amarrar esta especificação a um produto.
- **Decisão pendente:** aprovar a bio, foto/avatar e credenciais editoriais reais de Marcus Cole antes de qualquer author page pública.
- **Decisão pendente:** confirmar requisitos legais de Privacy, Terms e Disclosure antes de ativar coleta, comentários, analytics, patrocínio ou afiliados.
- **Regra:** ausência desses itens não bloqueia o desenvolvimento da persona nem a preparação de drafts, mas bloqueia publicação pública quando forem necessários.

## Proveniência e limites

- **Fatos de contexto:** fase de persona/autoridade, escopo sem produto e gate de publicação dependente de Sergio — `MODO-OPERACAO-SIMPLIFICADO-PERSONA-v1.md` e `DECISAO-PRIORIDADE-PERSONA-v1.md`.
- **Decisões desta checklist:** taxonomia, campos, estados e critérios acima são especificação operacional proposta para revisão; não representam publicação realizada.
- **Limitação:** não foi feita validação em CMS, crawler, domínio, sitemap real ou ambiente de deploy; este arquivo não afirma que essas estruturas já existem.
