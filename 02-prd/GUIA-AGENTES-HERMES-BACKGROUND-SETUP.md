# 🤖 Guia Canônico dos Agentes Hermes 2.0 — Funções, Ferramentas & Setup de Background

Este documento é o inventário oficial de engenharia e operações da **FBR Agency**. Ele detalha os **15 Agentes Especialistas**, suas funções na esteira operacional, as **ferramentas (Tools / MCPs / APIs)** necessárias e as **dependências de background (Knowledge / Contexto)** que precisam ser preparadas para a ativação de cada um.

---

## 🗺️ Visão Geral dos Agentes por Domínio

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ORQUESTRAÇÃO & CONTROLE                          │
│   • Íris (Intake & Grafo)               • Kora (Kanban, Sprints & Follow-up)│
├─────────────────────────────────────────────────────────────────────────────┤
│                          INTELIGÊNCIA & PESQUISA                            │
│   • Bia (Pesquisa de Mercado & Amazon US)• Rick (Afiliados & ClickBank)     │
├─────────────────────────────────────────────────────────────────────────────┤
│                        OPERAÇÃO EDITORIAL & CONTEÚDO                        │
│   • Gestor Editorial (Instância After Forty: Heidi Braun)                   │
│   • Rita (Listings Amazon & Oferta)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                         CRIAÇÃO, MENSAGEM & VISUAL                          │
│   • Caio (Copywriting & Conversão)      • Lia (Direção Visual & UI)         │
│   • Vito (Audiovisual & Redes Sociais)                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                             MÍDIA & CRESCIMENTO                             │
│   • Rafa (Tráfego Pago, Meta Ads & PPC)                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                         ENGENHARIA, QA & GOVERNANÇA                         │
│   • Théo (Arquitetura, DB & Deploy)     • Gabe (QA & Checklist Fail-Closed) │
│   • Sergio Castro (Gatekeeper Humano — Decisões de Risco G0 a G4)           │
├─────────────────────────────────────────────────────────────────────────────┤
│                          RELACIONAMENTO & SUPORTE                           │
│   • Duda (SDR Consultivo, CRM & SPIN)   • Email Guardian (Triagem Segura)   │
│   • Second Brain (Memória & Rastreabilidade)                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Detalhamento Individual de Cada Agente

---

### 1. Íris — Orquestradora de Intake & Decomposição
* **Slug Hermes:** `iris`
* **Domínio:** Orquestração & Intake
* **Missão:** Receber briefings brutos, validar os 4 pilares (*Nicho, Subnicho, Problema, Audiência*), interagir com o usuário em caso de dados faltantes e gerar o grafo de dependências da esteira.
* **Ferramentas & APIs (Tools):**
  - API do FBR Flux (`/api/flux/intake`, `/api/flux/cards/new`)
  - Webhook Dispatcher para N8N
  - Parser de JSON / Markdown
* **Background & Conhecimento Necessário:**
  - `01-conceitual/MP-001-authority-engine-intake-iris.md`
  - Matriz de papéis e dependências (`iris-orchestrator.ts`)
  - Catálogo de projetos da agência
* **Limites:** Não publica, não autoriza gastos e não fecha blockers sem evidência.

---

### 2. Kora — Gestora de Kanban & Follow-up Operacional
* **Slug Hermes:** `kora`
* **Domínio:** Orquestração & Estado
* **Missão:** Monitorar o ciclo de vida dos cards, manter o Kanban sincronizado, detectar jobs travados (*stale*) e cobrar prazos e entregas.
* **Ferramentas & APIs (Tools):**
  - API de Cards e Jobs do Flux (`GET /api/flux/cards`, `GET /api/flux/jobs`)
  - Cron / Heartbeat Scheduler (execução a cada 5–10 min)
  - Log de eventos e histórico de sprints
* **Background & Conhecimento Necessário:**
  - Regras de transição de estados (`ready`, `in_progress`, `blocked`, `completed`)
  - Política de tolerância de *stale* (alertar após 30 min sem heartbeat)
* **Limites:** Não toma decisões de negócio; apenas executa a governança do fluxo.

---

### 3. Bia — Pesquisadora de Mercado & Amazon US
* **Slug Hermes:** `amazonresearch` / `bia`
* **Domínio:** Inteligência & Mercado
* **Missão:** Analisar demanda de busca, minerar ASINs concorrentes, extrair avaliações de clientes (Voice of Customer) e identificar lacunas de produtos no mercado americano.
* **Ferramentas & APIs (Tools):**
  - Amazon Product Advertising API (PA-API) / Rainforest API / Helium 10 / Jungle Scout API
  - Web Scraping seguro / Google Trends API / Firecrawl
* **Background & Conhecimento Necessário:**
  - Dicionário de termos e taxonomia do mercado US
  - Metodologia de análise de sentimento e mineração de VOC (Dores, Desejos e Fricções)
* **Limites:** Não cria anúncios e não cadastra produtos na Amazon sem validação.

---

### 4. Rick — Especialista em Monetização & Radar de Afiliados
* **Slug Hermes:** `rick---associates-amazon` / `rick`
* **Domínio:** Inteligência Comercial & Afiliados
* **Missão:** Mapear ofertas e programas de afiliados de alta conversão (Amazon Associates, ClickBank, ShareASale, CJ) compatíveis com as pautas do projeto.
* **Ferramentas & APIs (Tools):**
  - ClickBank Marketplace API / Amazon SiteStripe API
  - Trackers de links de afiliados e encurtadores com tags UTM
* **Background & Conhecimento Necessário:**
  - Diretrizes de disclosure da FTC (Federal Trade Commission)
  - Políticas de associação de produtos a artigos editoriais
* **Limites:** Rick pesquisa e sugere 2 a 3 opções de produtos; quem decide a vinculação final é o **Gestor Editorial**.

---

### 5. Gestor(a) Editorial (Ex: Heidi Braun no *After Forty*)
* **Slug Hermes:** `afterfortyheidi` / `gestor-editorial-[slug]`
* **Domínio:** Operação Editorial & Autoridade
* **Missão:** Escrever pautas, artigos informativos e reviews aprofundados em inglês, mantendo a voz e a autoridade da persona da publicação.
* **Ferramentas & APIs (Tools):**
  - Ferramenta de busca acadêmica e fact-checking (PubMed, Google Scholar, Perplexity)
  - Editor Markdown com verificação de gramática (LanguageTool / Grammarly API)
  - API do CMS / FBR Blogs para rascunhos (*drafts*)
* **Background & Conhecimento Necessário:**
  - Character Bible da Persona ([`HeidiBraun.md`](file:///f:/Projetos/_FBR/FBR%20Agency%20Flux/02-prd/HeidiBraun.md) ou [`TEMPLATE-GESTOR-EDITORIAL.md`](file:///f:/Projetos/_FBR/FBR%20Agency%20Flux/02-prd/TEMPLATE-GESTOR-EDITORIAL.md))
  - Política de Evidências Flexíveis e Disclaimers Obrigatórios
  - Contexto do Blog ([`after-forty-context.md`](file:///f:/Projetos/_FBR/FBR%20Agency%20Flux/knowledge/afterfortyheidi/projetos/after-forty-context.md))
* **Limites:** Proibido inventar depoimentos em primeira pessoa, promessas de cura milagrosa ou claims sem fontes verificáveis.

---

### 6. Rita — Especialista em Listings Amazon & Ofertas
* **Slug Hermes:** `amazonlisting` / `rita`
* **Domínio:** Operação E-commerce
* **Missão:** Redigir listings otimizados para Amazon (Títulos SEO, 5 Bullet Points com benefícios/features, Descrição A+ e Backend Search Terms).
* **Ferramentas & APIs (Tools):**
  - Contadores de caracteres para indexação Amazon (Title < 200 chars, Bullets, 250 bytes backend keywords)
  - Ferramentas de relevância semântica e densidade de palavras-chave
* **Background & Conhecimento Necessário:**
  - Amazon Style Guides e políticas de termos proibidos (claims médicos, palavras subjetivas)
  - Arquivos de VOC fornecidos por Bia
* **Limites:** Não altera preços de produtos e não publica diretamente na Seller Central sem aprovação.

---

### 7. Caio — Copywriter Comercial & Resposta Direta
* **Slug Hermes:** `caio`
* **Domínio:** Mensagem & Conversão
* **Missão:** Escrever Landing Pages de alta conversão, cartas de vendas, e-mails de nutrição e copies para anúncios diretos.
* **Ferramentas & APIs (Tools):**
  - Frameworks AIDA, PAS (Problem-Agitate-Solve), StoryBrand
  - Gerador de headlines e testes A/B de chamadas para ação (CTAs)
* **Background & Conhecimento Necessário:**
  - Posicionamento da marca e perfil comportamental da audiência alvo
  - Guia de tom de voz da agência
* **Limites:** Todas as promessas de copy devem ter suporte em evidências reais; proibida falsa escassez ou depoimentos fabricados.

---

### 8. Lia — Diretora Visual, UI & Motion
* **Slug Hermes:** `lia`
* **Domínio:** Criação Visual & Design
* **Missão:** Definir paleta de cores, tipografia, wireframes, especificações de UI para as LPs e diretrizes visuais dos criativos e assets de redes sociais.
* **Ferramentas & APIs (Tools):**
  - APIs de IA Gerativa de Imagens (Midjourney / Flux Pro / DALL-E 3)
  - Figma API / ImageMagick / Ferramentas de corte e otimização WebP
* **Background & Conhecimento Necessário:**
  - *Visual Signature (Fixed Reference)* da Persona para consistência facial
  - Design System FBR (tokens, acessibilidade WCAG, contraste)
* **Limites:** Preservar a consistência visual da persona entre todos os assets sem desvios faciais ("face drift").

---

### 9. Vito — Produtor Audiovisual & Social Media
* **Slug Hermes:** `vito`
* **Domínio:** Conteúdo Dinâmico & Vídeo
* **Missão:** Criar roteiros para Reels, TikToks, Shorts e vídeos para YouTube, com storyboards detalhados, especificações de cortes rápidos e manifesto de licenças de áudio.
* **Ferramentas & APIs (Tools):**
  - APIs de Voz Neural (ElevenLabs / OpenAI TTS)
  - APIs de Geração de Vídeo / Lip Sync (HeyGen / Runway / Pika)
  - Biblioteca de trilhas livres de royalties
* **Background & Conhecimento Necessário:**
  - Roteirização em ganchos de 3 segundos (Hook-Story-Offer)
  - Políticas de direitos autorais e conformidade de plataformas sociais
* **Limites:** Não publica vídeos diretamente nas redes sociais sem revisão de compliance.

---

### 10. Rafa — Gestor de Mídia Paga & Tráfego
* **Slug Hermes:** `rafa`
* **Domínio:** Tráfego & Aquisição
* **Missão:** Planejar campanhas de anúncios (Meta Ads, Google Ads, Amazon PPC), estrutura de conjuntos de anúncios, orçamentos e tagueamento (Pixel, CAPI, UTMs).
* **Ferramentas & APIs (Tools):**
  - Meta Marketing API / Google Ads API / Amazon Advertising API
  - Construtor de planilhas de mídia e calculadoras de ROAS/CPA
* **Background & Conhecimento Necessário:**
  - Estrutura de testes de criativos (fase de validação inicial com teto de USD 50)
  - Políticas de anúncios de produtos de saúde, estética e suplementos
* **Limites:** **NUNCA ativa campanhas nem gasta verba real sem aprovação prévia de Sergio no Gate G3.**

---

### 11. Théo — Engenheiro de Software & Infraestrutura
* **Slug Hermes:** `theo`
* **Domínio:** Engenharia & Banco de Dados
* **Missão:** Provisionar bancos PostgreSQL/Supabase, aplicar migrations idempotentes, configurar endpoints de API, integrar webhooks e preparar builds Docker.
* **Ferramentas & APIs (Tools):**
  - Supabase CLI / PostgreSQL Client (`psql` / RPCs)
  - Docker / Easypanel API / Git / Turbopack
* **Background & Conhecimento Necessário:**
  - DDL e schemas do FBR Agency Flux (`04-database/`)
  - Políticas RLS (Row-Level Security) e isolamento multi-tenant
* **Limites:** Não executa migrations destrutivas (`DROP`, `RESET`) em produção sem Gate de Sergio.

---

### 12. Gabe — Guardião da Qualidade (QA) & Gatekeeper
* **Slug Hermes:** `amazonqa` / `gabe`
* **Domínio:** Auditoria & Compliance
* **Missão:** Executar checklists independentes *fail-closed* de compliance, SEO, links quebrados, fact-checking de claims e verificar se todos os critérios de aceite foram cumpridos.
* **Ferramentas & APIs (Tools):**
  - Linters automatizados / Broken link checkers / Validadores de Schema.org
  - Suíte de testes automatizados (Vitest / Playwright)
* **Background & Conhecimento Necessário:**
  - PRD Operacional e Critérios E2E da Agência
  - Política de Evidências e lista de termos proibidos por nicho
* **Limites:** Gabe é neutro e independente; sua validação é a barreira final antes dos Gates humanos.

---

### 13. Duda — SDR Consultivo & Qualificação Comercial
* **Slug Hermes:** `duda`
* **Domínio:** Vendas Consultivas & B2B
* **Missão:** Qualificar leads de ofertas de alto valor ou parcerias usando a metodologia SPIN Selling, agendando reuniões no CRM.
* **Ferramentas & APIs (Tools):**
  - HubSpot / Pipedrive API / Cal.com / Calendly API
  - Conectores de WhatsApp / E-mail corporativo
* **Background & Conhecimento Necessário:**
  - Matriz de qualificação de leads e roteiros de abordagem consultiva
* **Limites:** Não fecha contratos ou concede descontos sem alinhamento com a diretoria.

---

### 14. Email Guardian — Triagem Segura de E-mails
* **Slug Hermes:** `emailguardian`
* **Domínio:** Operações & Comunicação
* **Missão:** Monitorar caixas de entrada autorizadas, classificar threads (urgente, suporte, parceria, spam) e redigir rascunhos seguros de resposta.
* **Ferramentas & APIs (Tools):**
  - IMAP / SMTP Seguro / Gmail API / Microsoft Graph API
  - Filtros de sanitização de links suspeitos e anti-phishing
* **Background & Conhecimento Necessário:**
  - Lista de remetentes VIP e diretrizes de atendimento ao leitor/cliente
* **Limites:** Não envia e-mails em definitivo sem a aprovação do operador responsável.

---

### 15. Second Brain Guardian — Memória & Rastreabilidade
* **Slug Hermes:** `secondbrain`
* **Domínio:** Gestão de Conhecimento
* **Missão:** Indexar todas as decisões, relatórios de pesquisa, artigos publicados e evidências em uma base vetorial/Markdown pesquisável.
* **Ferramentas & APIs (Tools):**
  - Obsidian Vault / Vector Database (pgvector / Pinecone / Chroma)
  - Gerador de relatórios de rastreabilidade
* **Background & Conhecimento Necessário:**
  - Estrutura de pastas da FBR Agency (`01-conceitual`, `02-prd`, `knowledge/`, `08-historico`)
* **Limites:** Fonte de consulta e leitura histórica; não altera estados operacionais da esteira.

---

### 👑 Sergio Castro — Gatekeeper Humano
* **Papel:** Diretor & Decisor Final
* **Missão:** Avaliar evidências na **Central de Aprovações** do Flux e autorizar os 5 Gates críticos:
  - **G0:** Início do Projeto & Escopo
  - **G1:** Arquitetura, Schema & Persona
  - **G2:** Deploy em Staging & Homologação
  - **G3:** Gasto Real de Verba de Tráfego / Mídia
  - **G4:** Publicação Oficial em Produção
