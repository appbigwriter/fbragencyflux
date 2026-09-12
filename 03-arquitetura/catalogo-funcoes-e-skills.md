# Catálogo de funções e skills — FBR Agency Flux

Skills autorizadas são somente as instaladas no profile correspondente ou no catálogo global autorizado. Não há secrets neste documento.

## Camada especialista e RAG — estado atual

Os oito especialistas-chave têm SOULs permanentes em `C:/Users/OEM/AppData/Local/hermes/profiles/` e um knowledge pack curado em `F:/Projetos/_FBR/FBR Agency Flux/knowledge/`. O SOUL define identidade, escopo, ownership, gates e lista de skills; a lógica operacional detalhada permanece nas `SKILL.md` reais e o conteúdo factual permanece no RAG.

| agente | profile | knowledge pack | responsabilidade | skills autorizadas verificadas |
|---|---|---|---|---|
| Íris | `iris` | `knowledge/iris/` | intake, decomposição, JTBD/StoryBrand/Category Design, funil/AARRR e roteamento | `intake-e-decomposicao`, `roteamento-e-dependencias`, `definir-criterios-de-aceite`, `validacao-de-gates`, `consolidacao-e-entrega` |
| Rafa | `rafa` | `knowledge/rafa/` | Meta Ads, tracking de sinal, testes/escala e Amazon PPC | `amazon-ppc`, `estruturar-meta-ads`, `google-e-youtube-ads`, `configurar-publicos-e-tracking`, `plano-de-teste-ab`, `analise-de-metricas`, `qualidade-de-lead` |
| Caio | `caio` | `knowledge/caio/` | copy, VoC, prova, frameworks de resposta direta e compliance | `copy-de-vendas`, `definir-angulo-e-prova`, `mensagem-comercial`, `post-instagram`, `roteiro-de-anuncio`, `roteiro-de-video`, `sequencia-de-email` |
| Lia | `lia` | `knowledge/lia/` | direção visual, motion, performance e acessibilidade | `sistema-visual-de-marca`, `criativo-a-partir-da-copy`, `wireframe-landing`, `layout-instagram`, `checagem-mobile-e-acessibilidade` |
| Rick | `rick---associates-amazon` | `knowledge/rick/` | Amazon Associates, Radar de Afiliados, produtos, intenção e disclosure | `radar-afiliados`, `pesquisa-produto-afiliado`, `avaliar-intencao-de-busca`, `conteudo-comparativo`, `disclosures-e-conformidade`, `seo-e-links`, `analise-de-conversao` |
| Amazon Research | `amazonresearch` | `knowledge/amazonresearch/` | demanda, keywords, ASIN, concorrência, preço/reviews e fontes datadas | `pesquisa-de-demanda`, `pesquisa-keywords-e-asins`, `analise-de-concorrencia`, `analise-preco-e-reviews`, `mapa-de-oportunidade` |
| Amazon Listing | `amazonlisting` | `knowledge/amazonlisting/` | título, bullets, descrição, atributos, backend keywords e oferta Amazon US | `criar-titulo`, `criar-bullets-e-descricao`, `atributos-e-backend-keywords`, `estrutura-de-oferta`, `checagem-conformidade-listing` |
| Amazon QA | `amazonqa` | `knowledge/amazonqa/` | auditoria fail-closed de listing, oferta, PPC, criativos, tracking, disclosure e prontidão | `auditoria-de-listing`, `auditoria-de-oferta-e-economia`, `auditoria-de-ppc`, `auditoria-de-criativo-e-tracking`, `checklist-prontidao-publicacao` |

Para os quatro perfis Amazon, `conformidade-amazon-us` é padrão obrigatório referenciado no knowledge pack, mesmo quando não é uma skill invocável local do profile. Políticas, preços e benchmarks são dados voláteis: exigem fonte atual, data/validade e não podem ser preenchidos por memória. O contrato de Handoff compartilhado é o padrão de passagem entre agentes.

## `iris` — Íris
**Função:** intake/orquestração
**Objetivo:** Transforma demandas em jobs executáveis, roteia especialistas e consolida entregas no FBR Agency Flux.
**FORA / dono alternativo:** execução especializada e publicação; dono: agente especialista. Decisões irreversíveis; dono: Sergio.
**Skills autorizadas:**

### `intake-e-decomposicao`
- **Quando disparar:** quando o card exigir a capacidade `intake-e-decomposicao` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `intake-e-decomposicao`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `roteamento-e-dependencias`
- **Quando disparar:** quando o card exigir a capacidade `roteamento-e-dependencias` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `roteamento-e-dependencias`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `definir-criterios-de-aceite`
- **Quando disparar:** quando o card exigir a capacidade `definir-criterios-de-aceite` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `definir-criterios-de-aceite`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `validacao-de-gates`
- **Quando disparar:** quando o card exigir a capacidade `validacao-de-gates` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `validacao-de-gates`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `consolidacao-e-entrega`
- **Quando disparar:** quando o card exigir a capacidade `consolidacao-e-entrega` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `consolidacao-e-entrega`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `kora` — Kora
**Função:** Kanban/estado operacional
**Objetivo:** Mantém a verdade operacional: cards, estados, dependências, capacidade, riscos e decisões.
**FORA / dono alternativo:** execução do trabalho; dono: especialista. Aprovação em nome de Sergio; dono: Sergio.
**Skills autorizadas:**

### `administrar-kanban`
- **Quando disparar:** quando o card exigir a capacidade `administrar-kanban` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `administrar-kanban`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `deteccao-de-gargalo`
- **Quando disparar:** quando o card exigir a capacidade `deteccao-de-gargalo` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `deteccao-de-gargalo`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `planejar-sprint`
- **Quando disparar:** quando o card exigir a capacidade `planejar-sprint` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `planejar-sprint`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `priorizacao-e-capacidade`
- **Quando disparar:** quando o card exigir a capacidade `priorizacao-e-capacidade` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `priorizacao-e-capacidade`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `registro-de-decisoes-e-riscos`
- **Quando disparar:** quando o card exigir a capacidade `registro-de-decisoes-e-riscos` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `registro-de-decisoes-e-riscos`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `relatorio-de-status`
- **Quando disparar:** quando o card exigir a capacidade `relatorio-de-status` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `relatorio-de-status`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `theo` — Théo
**Função:** engenharia/provisionamento
**Objetivo:** Entrega soluções técnicas funcionais, testadas e reversíveis para o Flux, incluindo integrações, tracking, staging e provisionamento autorizado.
**FORA / dono alternativo:** decisão de produto, conteúdo, orçamento e publicação; donos: owner funcional e Sergio. Mudanças em BigFlux/GestaoDB; dono: equipe autorizada, fora deste job.
**Skills autorizadas:**

### `testes-e-staging`
- **Quando disparar:** quando o card exigir a capacidade `testes-e-staging` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `testes-e-staging`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `debug-sistematico`
- **Quando disparar:** quando o card exigir a capacidade `debug-sistematico` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `debug-sistematico`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `integracoes-e-automacoes`
- **Quando disparar:** quando o card exigir a capacidade `integracoes-e-automacoes` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `integracoes-e-automacoes`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `implementar-tracking`
- **Quando disparar:** quando o card exigir a capacidade `implementar-tracking` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `implementar-tracking`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `build-e-deploy-landing`
- **Quando disparar:** quando o card exigir a capacidade `build-e-deploy-landing` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `build-e-deploy-landing`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `documentar-rollback-e-variaveis`
- **Quando disparar:** quando o card exigir a capacidade `documentar-rollback-e-variaveis` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `documentar-rollback-e-variaveis`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `caio` — Caio
**Função:** copy/conteúdo comercial
**Objetivo:** Cria copy comercial clara, comprovável e adequada ao canal: mensagens, anúncios, emails e roteiros.
**FORA / dono alternativo:** produção visual, mídia e publicação; donos: Lia, Vito, Rafa e Sergio conforme gate.
**Skills autorizadas:**

### `copy-de-vendas`
- **Quando disparar:** quando o card exigir a capacidade `copy-de-vendas` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `copy-de-vendas`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `definir-angulo-e-prova`
- **Quando disparar:** quando o card exigir a capacidade `definir-angulo-e-prova` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `definir-angulo-e-prova`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `mensagem-comercial`
- **Quando disparar:** quando o card exigir a capacidade `mensagem-comercial` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `mensagem-comercial`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `post-instagram`
- **Quando disparar:** quando o card exigir a capacidade `post-instagram` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `post-instagram`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `roteiro-de-anuncio`
- **Quando disparar:** quando o card exigir a capacidade `roteiro-de-anuncio` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `roteiro-de-anuncio`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `roteiro-de-video`
- **Quando disparar:** quando o card exigir a capacidade `roteiro-de-video` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `roteiro-de-video`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `sequencia-de-email`
- **Quando disparar:** quando o card exigir a capacidade `sequencia-de-email` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `sequencia-de-email`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `lia` — Lia
**Função:** estratégia visual/planejamento
**Objetivo:** Define direção visual orientada a performance e traduz copy aprovada em sistemas, wireframes e peças acessíveis.
**FORA / dono alternativo:** edição audiovisual e distribuição; dono: Vito/Rafa. Desenvolvimento; dono: Théo. Aprovação; donos: Gabe/Sergio.
**Skills autorizadas:**

### `sistema-visual-de-marca`
- **Quando disparar:** quando o card exigir a capacidade `sistema-visual-de-marca` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `sistema-visual-de-marca`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `criativo-a-partir-da-copy`
- **Quando disparar:** quando o card exigir a capacidade `criativo-a-partir-da-copy` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `criativo-a-partir-da-copy`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `wireframe-landing`
- **Quando disparar:** quando o card exigir a capacidade `wireframe-landing` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `wireframe-landing`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `layout-instagram`
- **Quando disparar:** quando o card exigir a capacidade `layout-instagram` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `layout-instagram`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `checagem-mobile-e-acessibilidade`
- **Quando disparar:** quando o card exigir a capacidade `checagem-mobile-e-acessibilidade` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `checagem-mobile-e-acessibilidade`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `vito` — Vito
**Função:** redes sociais/audiovisual
**Objetivo:** Planeja, produz e organiza conteúdo social e audiovisual autorizado, com foco em canal, retenção, acessibilidade, licenças e evidência.
**FORA / dono alternativo:** estratégia de mídia; dono: Rafa. Copy; dono: Caio. Identidade; dono: Lia. Aprovação editorial; dono: Gabe. Publicação/compromisso; dono: Sergio.
**Skills autorizadas:**

### `storyboard-e-decupagem`
- **Quando disparar:** quando o card exigir a capacidade `storyboard-e-decupagem` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `storyboard-e-decupagem`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `montagem-e-ritmo`
- **Quando disparar:** quando o card exigir a capacidade `montagem-e-ritmo` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `montagem-e-ritmo`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `legenda-e-retencao`
- **Quando disparar:** quando o card exigir a capacidade `legenda-e-retencao` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `legenda-e-retencao`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `versoes-por-plataforma`
- **Quando disparar:** quando o card exigir a capacidade `versoes-por-plataforma` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `versoes-por-plataforma`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `controle-de-assets-e-licencas`
- **Quando disparar:** quando o card exigir a capacidade `controle-de-assets-e-licencas` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `controle-de-assets-e-licencas`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `rick---associates-amazon` — Rick
**Função:** afiliados/Amazon
**Objetivo:** Pesquisa e estrutura oportunidades de Amazon Associates com conformidade, intenção de busca, comparativos, SEO e disclosures.
**FORA / dono alternativo:** listing; dono: Amazon Listing. Mídia; dono: Rafa. Decisão editorial; dono: Gabe. Aprovação irreversível; dono: Sergio.
**Skills autorizadas:**

### `radar-afiliados`
- **Quando disparar:** quando o card exigir a capacidade `radar-afiliados` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `radar-afiliados`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `pesquisa-produto-afiliado`
- **Quando disparar:** quando o card exigir a capacidade `pesquisa-produto-afiliado` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `pesquisa-produto-afiliado`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `avaliar-intencao-de-busca`
- **Quando disparar:** quando o card exigir a capacidade `avaliar-intencao-de-busca` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `avaliar-intencao-de-busca`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `conteudo-comparativo`
- **Quando disparar:** quando o card exigir a capacidade `conteudo-comparativo` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `conteudo-comparativo`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `disclosures-e-conformidade`
- **Quando disparar:** quando o card exigir a capacidade `disclosures-e-conformidade` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `disclosures-e-conformidade`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `seo-e-links`
- **Quando disparar:** quando o card exigir a capacidade `seo-e-links` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `seo-e-links`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `analise-de-conversao`
- **Quando disparar:** quando o card exigir a capacidade `analise-de-conversao` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `analise-de-conversao`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `clickbank-research`
- **Quando disparar:** quando o card envolver uma oferta, produto ou pauta da ClickBank
- **O que faz:** pesquisa ofertas, evidência, claims, comissão, relevância e risco de compliance
- **Produz:** tabela de ofertas, matriz de claims, pautas contextualizadas e Handoff com fontes/data
- **Limites:** não substitui `radar-afiliados`, Gabe ou Sergio; não publica nem gasta verba sem Gate

## `rafa` — Rafa
**Função:** tráfego e mídia
**Objetivo:** Planeja, estrutura, mede e otimiza mídia paga, incluindo Amazon PPC quando aplicável, com hipóteses testáveis e controle de orçamento.
**FORA / dono alternativo:** aprovação de verba/publicação; dono: Sergio. Criativos; donos: Lia/Vito. Implementação; dono: Théo.
**Skills autorizadas:**

### `amazon-ppc`
- **Quando disparar:** quando o card exigir a capacidade `amazon-ppc` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `amazon-ppc`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `estruturar-meta-ads`
- **Quando disparar:** quando o card exigir a capacidade `estruturar-meta-ads` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `estruturar-meta-ads`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `google-e-youtube-ads`
- **Quando disparar:** quando o card exigir a capacidade `google-e-youtube-ads` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `google-e-youtube-ads`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `configurar-publicos-e-tracking`
- **Quando disparar:** quando o card exigir a capacidade `configurar-publicos-e-tracking` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `configurar-publicos-e-tracking`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `plano-de-teste-ab`
- **Quando disparar:** quando o card exigir a capacidade `plano-de-teste-ab` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `plano-de-teste-ab`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `analise-de-metricas`
- **Quando disparar:** quando o card exigir a capacidade `analise-de-metricas` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `analise-de-metricas`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `qualidade-de-lead`
- **Quando disparar:** quando o card exigir a capacidade `qualidade-de-lead` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `qualidade-de-lead`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `amazonresearch` — Amazon Research
**Função:** pesquisa Amazon
**Objetivo:** Valida demanda, concorrência, preço, reviews, keywords, ASINs e oportunidades para Amazon US com fontes datadas.
**FORA / dono alternativo:** copy/listing; donos: Caio/Amazon Listing. PPC; dono: Rafa. Portfólio; donos: Gabe/Sergio.
**Skills autorizadas:**

### `pesquisa-de-demanda`
- **Quando disparar:** quando o card exigir a capacidade `pesquisa-de-demanda` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `pesquisa-de-demanda`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `pesquisa-keywords-e-asins`
- **Quando disparar:** quando o card exigir a capacidade `pesquisa-keywords-e-asins` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `pesquisa-keywords-e-asins`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `analise-de-concorrencia`
- **Quando disparar:** quando o card exigir a capacidade `analise-de-concorrencia` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `analise-de-concorrencia`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `analise-preco-e-reviews`
- **Quando disparar:** quando o card exigir a capacidade `analise-preco-e-reviews` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `analise-preco-e-reviews`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `mapa-de-oportunidade`
- **Quando disparar:** quando o card exigir a capacidade `mapa-de-oportunidade` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `mapa-de-oportunidade`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `amazonlisting` — Amazon Listing
**Função:** listagens Amazon
**Objetivo:** Transforma fatos e claims aprovados em título, bullets, descrição, atributos, backend keywords e oferta Amazon US.
**FORA / dono alternativo:** pesquisa; dono: Amazon Research. QA/aprovação; donos: Amazon QA/Sergio. Publicação/flat file; dono: Sergio.
**Skills autorizadas:**

### `criar-titulo`
- **Quando disparar:** quando o card exigir a capacidade `criar-titulo` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `criar-titulo`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `criar-bullets-e-descricao`
- **Quando disparar:** quando o card exigir a capacidade `criar-bullets-e-descricao` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `criar-bullets-e-descricao`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `atributos-e-backend-keywords`
- **Quando disparar:** quando o card exigir a capacidade `atributos-e-backend-keywords` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `atributos-e-backend-keywords`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `estrutura-de-oferta`
- **Quando disparar:** quando o card exigir a capacidade `estrutura-de-oferta` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `estrutura-de-oferta`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `checagem-conformidade-listing`
- **Quando disparar:** quando o card exigir a capacidade `checagem-conformidade-listing` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `checagem-conformidade-listing`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `amazonqa` — Amazon QA
**Função:** QA Amazon
**Objetivo:** Audita listing, oferta, economia, PPC, criativos, tracking e prontidão como gatekeeper fail-closed.
**FORA / dono alternativo:** correção de copy, código, criativo ou campanha; donos: especialistas. Aprovação; dono: Sergio.
**Skills autorizadas:**

### `auditoria-de-listing`
- **Quando disparar:** quando o card exigir a capacidade `auditoria-de-listing` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `auditoria-de-listing`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `auditoria-de-oferta-e-economia`
- **Quando disparar:** quando o card exigir a capacidade `auditoria-de-oferta-e-economia` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `auditoria-de-oferta-e-economia`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `auditoria-de-ppc`
- **Quando disparar:** quando o card exigir a capacidade `auditoria-de-ppc` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `auditoria-de-ppc`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `auditoria-de-criativo-e-tracking`
- **Quando disparar:** quando o card exigir a capacidade `auditoria-de-criativo-e-tracking` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `auditoria-de-criativo-e-tracking`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `checklist-prontidao-publicacao`
- **Quando disparar:** quando o card exigir a capacidade `checklist-prontidao-publicacao` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `checklist-prontidao-publicacao`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `duda` — Duda
**Função:** administração/coordenação geral
**Objetivo:** Organiza agenda, relacionamento, registros administrativos e coordenação geral, sem promessas indevidas.
**FORA / dono alternativo:** decisão de escopo, contratação e compromisso comercial; donos: Gabe/Sergio. Execução especializada; dono: especialista.
**Skills autorizadas:**

### `agendamento`
- **Quando disparar:** quando o card exigir a capacidade `agendamento` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `agendamento`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `registro-no-crm`
- **Quando disparar:** quando o card exigir a capacidade `registro-no-crm` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `registro-no-crm`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `prospeccao`
- **Quando disparar:** quando o card exigir a capacidade `prospeccao` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `prospeccao`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `qualificacao-spin`
- **Quando disparar:** quando o card exigir a capacidade `qualificacao-spin` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `qualificacao-spin`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `tratamento-de-objecoes`
- **Quando disparar:** quando o card exigir a capacidade `tratamento-de-objecoes` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `tratamento-de-objecoes`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `emailguardian` — Email Guardian
**Função:** operações de email/segurança
**Objetivo:** Converte caixas autorizadas em fila controlada de decisões, rascunhos, prazos e conhecimento aprovado.
**FORA / dono alternativo:** enviar, apagar, mover em massa e regras; dono: Sergio mediante aprovação. Memória; dono: Second Brain.
**Skills autorizadas:**

### `classificar-threads`
- **Quando disparar:** quando o card exigir a capacidade `classificar-threads` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `classificar-threads`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `identificar-urgencia-e-prazo`
- **Quando disparar:** quando o card exigir a capacidade `identificar-urgencia-e-prazo` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `identificar-urgencia-e-prazo`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `preparar-rascunho`
- **Quando disparar:** quando o card exigir a capacidade `preparar-rascunho` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `preparar-rascunho`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `relatorio-de-email`
- **Quando disparar:** quando o card exigir a capacidade `relatorio-de-email` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `relatorio-de-email`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `registrar-conhecimento-aprovado`
- **Quando disparar:** quando o card exigir a capacidade `registrar-conhecimento-aprovado` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `registrar-conhecimento-aprovado`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## `secondbrain` — Second Brain Guardian
**Função:** memória/registro operacional
**Objetivo:** Mantém o vault autorizado útil e auditável, separando concluído, pendente, bloqueio, roadmap, owner, dependência e evidência.
**FORA / dono alternativo:** decisão e execução do trabalho; dono: card owner. Apagar/mover fontes, produção e publicação; dono: Sergio. BigFlux/GestaoDB; fora deste escopo.
**Skills autorizadas:**

### `indexar-projeto`
- **Quando disparar:** quando o card exigir a capacidade `indexar-projeto` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `indexar-projeto`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `criar-nota-e-indice`
- **Quando disparar:** quando o card exigir a capacidade `criar-nota-e-indice` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `criar-nota-e-indice`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `classificar-status`
- **Quando disparar:** quando o card exigir a capacidade `classificar-status` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `classificar-status`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `dashboard-e-relatorio`
- **Quando disparar:** quando o card exigir a capacidade `dashboard-e-relatorio` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `dashboard-e-relatorio`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

### `manter-evidencias-e-proximos-passos`
- **Quando disparar:** quando o card exigir a capacidade `manter-evidencias-e-proximos-passos` e houver contexto, owner e gate
- **O que faz:** aplica o procedimento especializado instalado para `manter-evidencias-e-proximos-passos`
- **Produz:** artefato do procedimento, evidência, riscos, pendências e próximo owner
- **Limites:** respeita o escopo do agent, fontes e permissões; não publica, gasta verba, assume compromisso ou expõe secrets sem gate

## Contrato único de Handoff
```yaml
de: "agent de origem"
para: "agent responsável seguinte ou Íris"
card: "ID/link do card no Kanban"
objetivo do job: "resultado esperado"
entregável: "artefato, caminho/URL e versão"
decisões/suposições:
  - "decisão ou suposição; separar fato de hipótese"
pendências/blockers:
  - "item, severidade, owner e dependência"
gate: "entrada | execução | revisão | publicação/mutação"
critérios de aceite/evidência:
  - "critério verificável e evidência correspondente"
```

### Regras
- Todos os campos são obrigatórios e o card deve refletir o repasse
- Kora mantém o estado; Control Tower é usada somente no escopo autorizado; Íris resolve conflito de roteamento
- Gabe é owner de pauta/editorial quando aplicável; Sergio é owner de risco, verba e mutação irreversível
- Gestor Editorial não é profile listado e não recebe chave mestre/Service Role
- Nunca incluir secrets, credenciais, tokens ou dados de pagamento
