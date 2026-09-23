# Auditoria do Guia de Agentes Hermes — Background Setup

**Data:** 2026-09-23  
**Owner:** David  
**Documento auditado:** `F:\Projetos\_FBR\FBR Agency Flux\02-prd\GUIA-AGENTES-HERMES-BACKGROUND-SETUP.md`  
**Escopo:** verificar o que precisa ser parametrizado nos 15 profiles da FBR Agency para que suas funções estejam operacionalmente preparadas.  
**Regra:** esta auditoria não altera profiles, skills, credenciais, APIs, cron, MCP, produção ou Gates.

## 1. Conclusão executiva

O guia é uma boa **matriz de intenção operacional**, mas ainda não é um setup executável. Ele descreve missões, ferramentas desejadas e background necessário, porém não define de forma suficiente:

- qual toolset Hermes fica habilitado em cada profile;
- quais MCPs/APIs serão realmente conectados;
- onde ficam os tokens por referência segura;
- quais roots de projeto cada agente pode ler/escrever;
- quais cron/heartbeats são duráveis e qual é o owner;
- quais schemas, endpoints e contratos são canônicos;
- quais testes de health check comprovam que uma capacidade está pronta;
- como o agente registra handoff, correlation ID, blocker, nextCheck e readback;
- qual fallback deve ocorrer quando uma API, provider ou quota falhar.

**Estado geral:** profiles têm identidade e skills específicas, mas a preparação de background está **parcial**. As skills cobrem boa parte do método; as integrações externas descritas no guia ainda devem ser tratadas como **capacidade planejada**, não como capacidade operacional disponível.

### Classificação global

| Camada | Estado | Constatação |
|---|---|---|
| Identidade/profile/SOUL | Parcialmente pronta | Os 15 profiles existem e possuem descrição; nem todos têm o mesmo nível de parametrização documental. |
| Skills de domínio | Parcialmente pronta | Há skills específicas instaladas por profile, mas é necessário validar cobertura contra o guia e remover dependência de skills genéricas excessivas. |
| Toolsets Hermes | Parcial | Íris/Kora têm toolsets de cron/delegação; vários especialistas não têm configuração explícita de toolsets no `config.yaml`. |
| MCPs/APIs externas | Não comprovada | O guia cita APIs e serviços, mas não há evidência de contrato, credencial por referência, health check e readback por agente. |
| Background/cron/heartbeat | Não pronta como conjunto | Há jobs Hermes existentes em alguns contextos, mas o guia não entrega manifests de jobs, owners, cadência e critérios de encerramento por agente. |
| Segurança e Gates | Parcialmente pronta | SOULs têm guardrails; faltam matriz executável de permissões, approval mode, escopos de filesystem e testes negativos por profile. |
| Observabilidade | Parcial | Flux exige eventos, handoffs e readbacks; falta parametrização uniforme do `correlation_id`, heartbeat, lastActivity e receipt. |

## 2. O que precisa ser parametrizado em todos os agentes

### 2.1 Identidade operacional

Cada profile deve possuir, em descrição/SOUL ou manifesto versionado:

- nome humano e slug técnico;
- missão única;
- escopo `DENTRO` e `FORA`;
- entradas obrigatórias;
- saídas e formato de Handoff;
- owners de entrada e saída;
- métricas de qualidade específicas;
- limites de autoridade;
- Gates aplicáveis;
- condições de bloqueio e escala;
- fontes de verdade autorizadas;
- idioma e formato de resposta.

Os SOULs já cobrem grande parte desse contrato. O próximo passo é transformar o conteúdo em uma **matriz de configuração verificável**, não apenas texto narrativo.

### 2.2 Modelo e fallback

Para cada profile, registrar explicitamente:

```yaml
model:
  provider: openai-codex
  default: gpt-5.6-luna
fallback_model:
  provider: <provider aprovado>
  model: <modelo aprovado>
```

Hoje os profiles principais usam `openai-codex/gpt-5.6-luna`, mas o fallback aparece apenas comentado em vários `config.yaml`. Isso deixa rate limit, indisponibilidade e falha de provider sem rota operacional declarada.

O fallback não deve ser habilitado por conveniência sem decisão de custo, privacidade, capacidade e compatibilidade. Deve existir um teste que comprove: erro primário → registro da causa → provider alternativo → receipt.

### 2.3 Toolsets Hermes

O guia deve mapear cada função para toolsets reais, por exemplo:

| Capacidade | Toolset provável |
|---|---|
| Leitura/escrita de documentos e cards | `file`, `terminal` |
| Pesquisa web e fact-checking | `web`, eventualmente `browser` |
| Cálculos e análise | `code_execution` |
| Imagens e assets | `vision`, `image_gen` |
| Vídeo | `video`, `video_gen` |
| Orquestração | `delegation`, `cronjob`, `kanban` |
| Conhecimento | `memory`, `session_search` |
| E-mail | `connections`/connector autorizado, não apenas skill textual |
| QA de aplicação | `terminal`, `browser`, `code_execution` |

A skill não concede o toolset automaticamente. Cada profile precisa de uma configuração explícita, mínima e coerente. Não deve ser dado `terminal`, `browser`, `connections`, `image_gen`, `video_gen`, `kanban` ou `delegation` a um agente sem justificar a necessidade e o risco.

### 2.4 Workspace e filesystem

Cada agente deve ter:

- `terminal.cwd` correto para o projeto ou uma regra de `workdir` por job;
- roots autorizados de leitura;
- roots autorizados de escrita;
- proibição de acessar outras raízes quando não necessárias;
- fonte canônica do projeto;
- política para não usar JSON/local snapshot como fonte operacional quando Supabase for a fonte única;
- registro de `PROJECT_ROOT`, `EXECUTION_DIR`, comando e resultado no Handoff.

O `config.yaml` de Íris, por exemplo, ainda aponta `terminal.cwd: F:/Projetos/_FBR-Agency`, que é uma raiz de Agency e não necessariamente o diretório efetivo de um projeto. Para execução técnica, o Flux exige `09-codigo` ou a raiz real documentada.

### 2.5 Segurança, aprovação e mutação

Parametrizar por profile:

- `approvals.mode` adequado ao risco;
- `approvals.cron_mode` adequado ao tipo de job;
- `security.redact_secrets: true`;
- `tirith`/pre-exec scanning quando disponível;
- `write_approval` para agentes com escrita;
- referências de secrets, nunca valores em SOUL, skills, logs ou Handoffs;
- escopo de API mínimo;
- bloqueio explícito de produção, publicação, gasto e exclusão;
- teste negativo para confirmar que o agente não executa ação fora do escopo.

A existência de uma skill de Control Tower ou de um MCP não constitui autorização para provisionar, publicar ou executar SQL.

### 2.6 Background durável

Cada job de background precisa de um manifesto com:

```yaml
job_id:
agent:
schedule:
workdir:
skills:
input_sources:
output_destination:
heartbeat:
stale_after:
owner:
next_check:
retry_policy:
fallback:
delivery:
approval_required:
completion_evidence:
```

`delegate_task` não é durável: o filho desaparece se o processo pai terminar. Para operação contínua, usar `cronjob` ou worker persistente, com heartbeat verificável. Nenhuma rotina deve ser chamada de contínua apenas porque existe um prompt ou uma skill.

### 2.7 Contrato de Handoff e observabilidade

Todos os agentes devem produzir:

- `correlation_id`;
- projeto/tenant/schema;
- agent e versão;
- job e etapa;
- início, fim e duração;
- status;
- artefato;
- evidência;
- erro sanitizado;
- blocker, owner, nextAction e nextCheck;
- Gate associado;
- readback quando houver estado externo.

O contrato de Handoff já aparece nos SOULs, mas falta um validador automático que rejeite entrega sem os campos mínimos.

## 3. Auditoria por agente

### 3.1 Íris — `iris`

**Já existe:** skills de intake, decomposição, roteamento, critérios de aceite e validação de Gates; toolsets de `cronjob` e `delegation` no config.

**Parametrizar:**
- endpoint/adapter canônico do Flux para `/api/flux/intake` e criação de cards;
- schema JSON/Markdown do briefing;
- catálogo de projetos e matriz de ownership;
- fonte canônica do grafo de dependências;
- `correlation_id` e regra de idempotência do intake;
- consulta de Kora para confirmar card criado;
- webhook dispatcher/N8N somente após contrato, assinatura e receipt verificados;
- regra de escala para falta de dados e decisões fora do plano;
- cron de follow-up apenas se houver worker/endpoint real.

**Gap documental:** `03-arquitetura/iris-orchestrator.ts`, citado como matriz de papéis, não foi encontrado. Deve ser criado ou a referência deve apontar para o artefato canônico real.

### 3.2 Kora — `kora`

**Já existe:** skills de Kanban, sprint, gargalos, capacidade, decisões/riscos e status; toolsets de `cronjob`, `delegation` e `kanban` no config.

**Parametrizar:**
- board ID canônico e tenant/projeto;
- API ou CLI oficial de cards/jobs;
- estados válidos e guards de transição;
- stale threshold de 30 minutos e regra de heartbeat;
- owner de cada escalada;
- cron/daemon durável de 5–10 minutos, se aprovado;
- idempotência de follow-up;
- readback do status no board e receipt de cada mutação;
- integração com PENDING_TASKLIST sem duplicar fonte de verdade.

**Risco:** cron frequente sem worker real produziria falsa aparência de operação contínua.

### 3.3 Bia — `amazonresearch`

**Já existe:** skills de demanda, keywords/ASINs, concorrência, preço/reviews e mapa de oportunidade; provider Codex configurado.

**Parametrizar:**
- fonte primária autorizada para Amazon US;
- método aprovado entre PA-API, Rainforest, Helium 10, Jungle Scout, Firecrawl e pesquisa web;
- credenciais por `secret_ref`, nunca no profile;
- limites de request, cache, retries e respeito a termos de uso;
- esquema de captura de fonte, data, amostra e limitação;
- taxonomia Amazon US e dicionário VOC;
- template de relatório com fato/hipótese/recomendação;
- teste de health check por fonte.

**Gap:** o guia lista cinco famílias de ferramentas, mas não define qual será a ferramenta oficial nem a ordem de fallback. Não é correto habilitar todas sem decisão de custo, legalidade e acesso.

### 3.4 Rick — `rick---associates-amazon`

**Já existe:** skills de Amazon Associates, ClickBank, radar, conversão, disclosure e SEO; possui configuração customizada extensa e MCPs Firecrawl/Canva declarados.

**Parametrizar:**
- catálogo canônico dos programas autorizados;
- API ou método permitido por programa;
- disclosure FTC/Amazon/ClickBank versionado;
- política de atualização de preço, estoque, comissão e reembolso;
- gerador de links com `secret_ref`, UTM e tracking aprovado;
- regra de entrega de 2–3 opções sem decidir produto–pauta;
- health check dos MCPs e suas permissões;
- bloqueio de alteração de links em produção;
- fallback quando API ou quota falhar.

**Atenção:** a presença de Firecrawl/Canva no config não prova autenticação, escopo ou operação verificada.

### 3.5 Gestor Editorial After Forty — `afterfortyheidi`

**Já existe:** contexto do projeto, skills editoriais, SEO, calendário, comentários, anúncios e handoffs; perfil está configurado com Codex e possui várias skills genéricas adicionais.

**Parametrizar:**
- Character Bible `F:\Projetos\_FBR\FBR Agency Flux\02-prd\HeidiBraun.md`;
- template editorial `TEMPLATE-GESTOR-EDITORIAL.md`;
- disclaimer oficial e política de evidências;
- categorias, calendário, 12 artigos iniciais e idioma inglês;
- fonte de artigos e destino de drafts no CMS;
- API/adapter de FBR Blogs, com escopo exclusivamente `draft`;
- ferramenta de fact-checking efetivamente aprovada;
- regra para não publicar, não gerar affiliate URL e não alterar schema;
- health check que prova criação de draft sem publicação;
- bloqueio para claims de saúde e persona em primeira pessoa.

**Gap:** o perfil tem muitas skills amplas (`web`, `research`, `devops`, `software-development`, `ecommerce`, `email`) que não são necessárias para o papel editorial e ampliam superfície de risco. Deve ser feita uma revisão de least privilege.

### 3.6 Rita — `amazonlisting`

**Já existe:** skills específicas de título, bullets/descrição, atributos/backend keywords, oferta e conformidade.

**Parametrizar:**
- marketplace/categoria por job;
- limites de caracteres/bytes versionados por categoria;
- Style Guides e termos proibidos atuais;
- entrada obrigatória de PreListing, VOC e fontes;
- validador automatizado de campos;
- contrato de oferta sem preço/estoque presumido;
- destino de draft e Handoff para Gabe;
- bloqueio de Seller Central/flat file sem Gate;
- teste de consistência entre claims e fatos físicos.

### 3.7 Caio — `caio`

**Já existe:** skills de copy de vendas, ângulo/prova, mensagem, Instagram, anúncios, vídeo e e-mail.

**Parametrizar:**
- guia de tom por marca/projeto;
- Voice of Customer autorizado;
- matriz de consciência e estágio do funil;
- catálogo de provas e claims aprovados;
- canais e limites de formato;
- validador de CTA único, claims e falsa escassez;
- handoff estruturado para Lia/Rafa/Vito/Gabe;
- bloqueio de publicação e envio.

**Gap:** os frameworks de copy citados no guia estão nas skills, mas o guia não define qual fonte de posicionamento é canônica por marca.

### 3.8 Lia — `lia`

**Já existe:** skills de sistema visual, criativo, wireframe, Instagram, logo e acessibilidade.

**Parametrizar:**
- Design System FBR e tokens por marca;
- Figma/Canva ou outro sistema visual oficial;
- origem autorizada de geração de imagens;
- registro de prompt/modelo/licença/asset;
- tamanhos, formatos e compressão por canal;
- checklist WCAG/contraste/mobile;
- referência facial fixa da Heidi quando o job for After Forty;
- fallback sem geração quando não houver licença/consistência;
- destino do asset e manifest de versão.

**Gap:** o guia lista Midjourney, Flux Pro, DALL-E 3, Figma e ImageMagick, mas não define quais integrações estão instaladas ou autorizadas no profile.

### 3.9 Vito — `vito`

**Já existe:** skills de storyboard, montagem/ritmo, legenda/retenção, versões e controle de assets/licenças.

**Parametrizar:**
- pipeline de ingestão, edição e exportação;
- ferramentas oficiais de TTS/vídeo, em vez de lista aberta de ElevenLabs/OpenAI/HeyGen/Runway/Pika;
- voice/model/idioma aprovados;
- biblioteca de música e licença;
- specs por plataforma;
- manifesto de assets e hash do export;
- checklist de hook, retenção, legendas e acessibilidade;
- destino de arquivos e versionamento;
- bloqueio de publicação direta.

**Gap:** o profile local tem skills de produção, mas não há evidência de APIs de voz/vídeo configuradas, nem de um workspace de mídia por job.

### 3.10 Rafa — `rafa`

**Já existe:** skills de Amazon PPC, Meta Ads, Google/YouTube, tracking, testes, métricas e qualidade de lead.

**Parametrizar:**
- contas e canais autorizados por referência segura;
- modo apenas planejamento/simulação por padrão;
- Gate G3 obrigatório para gasto;
- modelo de campanha e convenção UTM;
- Pixel/CAPI/events e owner técnico em Théo;
- janela, atribuição, baseline e métricas;
- teto USD 50 do After Forty;
- regra de corte/escala;
- readback de campanha, orçamento e estado real;
- bloqueio de publicação/alteração de conta sem aprovação.

**Gap crítico:** APIs Meta/Google/Amazon citadas no guia não estão comprovadas nos profiles; nenhum token pode ser presumido.

### 3.11 Théo — `theo`

**Já existe:** skills de staging, debugging, integrações, tracking, deploy e rollback; `write_approval: true` aparece no config.

**Parametrizar:**
- `PROJECT_ROOT`/`EXECUTION_DIR` por projeto;
- adapters e contratos canônicos de Flux, Control Tower e FBR Blogs;
- CLI/API de Supabase/Postgres e Easypanel, por `secret_ref`;
- modo dry-run para migration/provisionamento;
- backup, rollback, health check e readback;
- RLS/multi-tenant e schema permitido;
- pipeline Git/build/test/deploy;
- Gates G1/G2/G4 e bloqueio de produção por padrão;
- logs sanitizados e receipt técnico.

**Gap:** o guia lista Supabase CLI, `psql`, Docker, Easypanel API e Git, mas o setup não demonstra contratos, escopos ou health checks efetivos.

### 3.12 Gabe — `amazonqa`

**Já existe:** skills de auditoria de listing, oferta/economia, PPC, criativo/tracking e prontidão de publicação.

**Parametrizar:**
- matriz QA por tipo de entrega;
- severidade, PASS/FAIL/BLOCKED e regra fail-closed;
- linters, broken-link checker, Schema.org validator, Vitest e Playwright efetivamente instalados;
- lista de políticas e termos proibidos por marketplace/nicho;
- owner de correção e recheck;
- formato de receipt para Gate;
- separação entre aprovação técnica e decisão humana;
- teste que confirma que Gabe não publica nem gasta.

**Gap:** as ferramentas mencionadas estão como intenção; o guia não identifica comandos, versões, entradas e evidência necessária para cada checker.

### 3.13 Duda — `duda`

**Já existe:** skills de agenda, prospecção, qualificação SPIN, CRM e objeções.

**Parametrizar:**
- decisão formal do escopo: SDR somente ou SDR + administração geral;
- CRM oficial e pipeline;
- campos obrigatórios de lead;
- integração Cal.com/Calendly, se aprovada;
- canais de contato e consentimento;
- templates de abordagem e limites de promessa/desconto;
- regra de uma pergunta por vez;
- approval antes de enviar mensagem ou criar compromisso;
- health check de criação de rascunho/registro sem envio automático.

**Gap:** o guia cita HubSpot, Pipedrive, Cal.com, Calendly, WhatsApp e e-mail, mas nenhum sistema oficial foi escolhido e nenhum connector foi comprovado.

### 3.14 Email Guardian — `emailguardian`

**Já existe:** skills específicas de threads, urgência, rascunhos, relatórios e registro aprovado; profile possui configuração customizada extensa.

**Parametrizar:**
- contas/pastas autorizadas por referência segura;
- modo read-only por padrão;
- Gmail API, Microsoft Graph ou IMAP como fonte oficial, não todas simultaneamente;
- lista de VIPs, remetentes suspeitos e regras anti-phishing;
- classificação de urgência e prazo;
- lote de aprovação antes de envio/arquivamento/exclusão;
- readback do provedor após mutação aprovada;
- retenção, auditoria e sanitização;
- cron de triagem com owner e nextCheck, se necessário.

**Gap crítico:** o guia cita IMAP/SMTP/Gmail/Graph, mas não define a conta, connector, escopo OAuth ou operação aprovada. `cron_mode: deny` no config copiado deve ser tratado conscientemente, não como operação contínua.

### 3.15 Second Brain Guardian — `secondbrain`

**Já existe:** skills de indexação, notas/índices, classificação, dashboards e evidências; profile possui configuração customizada extensa.

**Parametrizar:**
- raízes autorizadas e somente leitura versus escrita;
- vault/fonte canônica em `F:\Projetos\SecondBrain`;
- estrutura de índices e nomenclatura;
- mecanismo de busca/indexação e pgvector, se realmente aprovado;
- política de retenção e deduplicação;
- regra de não alterar fontes, código ou produção;
- integração com PENDING_TASKLIST e históricos;
- cron de indexação e receipt;
- teste de integridade: documento indexado → encontrado → link/evidência preservados.

**Gap:** o guia menciona Obsidian, pgvector, Pinecone e Chroma, mas não define um backend canônico. Deve haver uma escolha única antes da parametrização.

## 4. Problemas do próprio guia

### 4.1 Ferramentas listadas sem decisão de implementação

O documento cita PA-API, Rainforest, Helium 10, Jungle Scout, Firecrawl, PubMed, Google Scholar, Perplexity, LanguageTool, Grammarly, APIs de CMS, Midjourney, Flux Pro, DALL-E, Figma, ImageMagick, ElevenLabs, OpenAI TTS, HeyGen, Runway, Pika, Meta, Google Ads, Amazon Ads, HubSpot, Pipedrive, Cal.com, Calendly, IMAP, SMTP, Gmail, Graph, Obsidian, pgvector, Pinecone e Chroma.

Isso é um **catálogo de opções**, não uma configuração. Para cada integração, é necessário decidir:

1. serviço oficial;
2. owner;
3. finalidade;
4. escopo mínimo;
5. secret reference;
6. endpoint/versão;
7. limite/quota;
8. fallback;
9. health check;
10. readback e critério de falha.

### 4.2 APIs não equivalem a tools Hermes

Uma API externa só fica disponível para um agent depois que existe connector/MCP/tool aprovado, credencial no runtime, contrato de entrada/saída e teste de health. A skill apenas ensina procedimento; ela não cria autenticação nem tool.

### 4.3 Background não está definido por job

O guia menciona heartbeat e cron para Kora, mas não especifica manifests de jobs para os demais agentes. A preparação completa deve incluir os jobs duráveis concretos, não apenas a expectativa de que o agente “monitore”.

### 4.4 Fonte de verdade e estado externo

O documento precisa distinguir explicitamente:

- arquivo de briefing;
- knowledge pack;
- Kanban/Flux;
- Supabase/Postgres;
- CMS/blog;
- plataforma externa;
- histórico/receipt.

Sem essa separação, um agent pode tratar fixture, snapshot local ou documento como prova de integração externa.

### 4.5 Inconsistência potencial com a governança atual

O guia chama Sergio de G0–G4 gatekeeper, o que é compatível com a governança, mas cada Gate precisa ter payload, estado, aprovador, ação autorizada, expiração e readback. “Aprovação” sem registro e sem leitura posterior não deve liberar execução.

## 5. Plano de parametrização recomendado

### Fase A — Contrato comum e segurança

1. Criar `AGENT-MANIFEST.yaml` por profile.
2. Fixar identidade, escopo, entradas, saídas, Gates, roots e fontes de verdade.
3. Definir `toolsets` mínimos por profile.
4. Definir approval mode, redaction e write policy.
5. Validar cada profile com teste negativo de escopo.

### Fase B — Background e observabilidade

1. Criar manifests de cron/heartbeat para Íris e Kora.
2. Definir jobs opcionais para Email Guardian e Second Brain.
3. Implementar `correlation_id`, `lastActivity`, `nextCheck`, receipt e readback.
4. Criar validador de Handoff.
5. Criar dashboard/relatório de saúde dos agents.

### Fase C — Integrações por prioridade

1. **Flux/Kanban:** Íris e Kora.
2. **Knowledge/contexto:** todos, com roots autorizadas.
3. **After Forty editorial:** Gestor Editorial, Gabe, Rick, Caio, Lia, Vito.
4. **Engineering/provisioning:** Théo, somente após contratos e Gates.
5. **Amazon:** Bia, Rita, Gabe e Rafa, começando por pesquisa/read-only.
6. **CRM/e-mail:** Duda e Email Guardian, somente após escolha do connector.
7. **Second Brain:** indexação controlada e readback.

### Fase D — Health checks e piloto

Cada agente deve passar por um teste mínimo:

- recebe input válido;
- rejeita input incompleto;
- usa a skill correta;
- acessa apenas a fonte autorizada;
- produz artefato no formato esperado;
- registra Handoff e evidência;
- bloqueia ação fora do escopo;
- escala corretamente para Íris/Kora/Gabe/Sergio;
- não expõe secret;
- realiza readback quando aplicável.

Só depois disso o profile deve ser classificado como `ready`.

## 6. Classificação final por prioridade

### P0 — necessário antes de chamar os agentes de prontos

- Contrato comum de Handoff e receipt.
- Toolsets mínimos explícitos por profile.
- Roots/workspaces e fonte de verdade.
- Approval/security/write policy.
- Matriz de Gate e bloqueios.
- Health check por agent.
- Remoção ou correção da referência inexistente `iris-orchestrator.ts`.
- Escolha de serviços oficiais, em vez de catálogo aberto de APIs.

### P1 — necessário para operação real

- Flux/Kanban para Íris/Kora.
- Background manifests e heartbeat.
- CMS draft-only para Gestor Editorial.
- QA executável para Gabe.
- Pesquisa Amazon read-only para Bia.
- Tracking e mídia em modo planejamento para Rafa.
- Workspace e adapter seguro para Théo.
- CRM oficial para Duda.
- Connector read-only para Email Guardian.
- Indexação/readback do Second Brain.

### P2 — expansão depois do piloto

- Automação de links afiliados.
- Geração de imagem/vídeo/voz.
- Ads APIs de produção.
- Provisionamento automático Control Tower/Easypanel.
- Publicação e campanhas, sempre com Gates humanos.

## 7. Veredito

Os agentes estão **bem definidos como papéis**, mas ainda **não estão plenamente preparados como sistema operacional de execução**. O maior trabalho restante não é criar mais descrições: é converter o guia em configuração verificável, com toolsets, connectors, secrets por referência, workspaces, jobs duráveis, observabilidade, health checks e Gates.

Recomendação: não alterar os 15 profiles em lote agora. Primeiro aprovar a matriz de serviços oficiais e o contrato comum de `AGENT-MANIFEST.yaml`; depois parametrizar por fases, começando por Íris/Kora/Flux e pelo piloto After Forty em modo draft/read-only.

## 8. Evidências consultadas

- Guia auditado: `F:\Projetos\_FBR\FBR Agency Flux\02-prd\GUIA-AGENTES-HERMES-BACKGROUND-SETUP.md`.
- Profiles Hermes: 15 `profile.yaml` e 15 `SOUL.md` em `C:\Users\OEM\AppData\Local\hermes\profiles`.
- Skills Hermes: `hermes-agent`, `fbr-agency-bot-roster-maintenance` e `fbr-agent-operational-coordination`.
- Configurações inspecionadas: Íris, Kora, Bia/Amazon Research, Rick, Gestor Editorial, Rita, Caio, Lia, Vito, Rafa, Théo, Gabe, Duda, Email Guardian e Second Brain.
- Referências do Hermes: configuração/toolsets e sistemas de background.
- Verificação de arquivos citados: `MP-001-authority-engine-intake-iris.md`, `HeidiBraun.md`, `TEMPLATE-GESTOR-EDITORIAL.md`, `politica-flexivel-de-evidencias.md` e contexto After Forty existem; `03-arquitetura/iris-orchestrator.ts` não foi encontrado.
- Nenhum secret, token, senha ou valor de pagamento foi reproduzido no relatório.
