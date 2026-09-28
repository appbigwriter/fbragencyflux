# Gamer Aesthetic — Questionário objetivo de decisões

**Versão:** v01  
**Data:** 2026-09-28  
**Como responder:** copie este documento e preencha somente os campos `Resposta:`. Use uma opção listada ou escreva `OUTRA: ...`. Não é necessário explicar, exceto quando solicitado.

## 1. Fonte de conteúdo do MVP

**1.1 Qual será a fonte principal dos artigos?**

- [ ] A — Markdown/MDX versionado no repositório (recomendado para o MVP)
- [x] B — Supabase/PostgreSQL com painel próprio
- [ ] C — Headless CMS (indicar qual)
- [ ] D — Outra: __________

**Resposta:**

**1.2 O MVP precisa de painel de edição online?**

- [x] A — Não
- [ ] B — Sim
- [ ] C — Decidir depois

**Resposta:**

**1.3 Quem poderá publicar ou editar conteúdo?**

- [ ] A — Apenas Sergio
- [x] B — Sergio e Tara
- [ ] C — Equipe editorial
- [ ] D — Outro: __________

**Resposta:**

## 2. Estrutura editorial

**2.1 Qual nome de rota deve ser usado para artigos?**

- [] A — `/guides/[slug]` (preservar a rota atual)
- [x] B — `/articles/[slug]`
- [ ] C — `/posts/[slug]`
- [ ] D — Outro: __________

**Resposta:**

**2.2 Quantos artigos devem estar publicados no lançamento inicial?**

- [ ] A — 3 artigos existentes
- [ ] B — 5 artigos
- [x] C — 10 artigos
- [ ] D — Outro número: __________

**Resposta:**

**2.3 Quais recursos entram no lançamento inicial?**

Marque cada item como `SIM` ou `NÃO`:

- Feed de artigos na homepage — **sim**
- Categorias — **sim**
- Tags — **sim**
- Filtros — **sim**
- Busca — **sim**
- Posts relacionados — **sim**
- Sumário automático do artigo — **sim**
- Comentários — **não**
- Newsletter — **não**

## 3. Marca, idioma e domínio

**3.1 Idioma editorial:**

- [ ] A — Inglês US (EN-US)
- [ ] B — Português BR (pt-BR)
- [x] C — Bilíngue
- [ ] D — Outro: __________

**Resposta:**

**3.2 Domínio canônico:**

- [x] A — `gameraesthetic.fbr.news`
- [ ] B — Outro domínio: __________
- [ ] C — Ainda não definido

**Resposta:**

**3.3 O domínio já está configurado no DNS?**

- [x] A — Sim
- [ ] B — Não
- [ ] C — Não sei

**Resposta:**

**3.4 O site deve manter o visual atual?**

- [x] A — Sim, apenas refinamentos
- [ ] B — Não, fazer novo design
- [ ] C — Fazer primeiro uma proposta visual para aprovação

**Resposta:**

## 4. Monetização e compliance

**4.1 Quais fontes de monetização entram no lançamento?**

- [ ] A — Amazon Associates
- [ ] B — Amazon Associates + afiliados especializados
- [x] C — Apenas conteúdo sem monetização inicialmente
- [ ] D — Outra: afiados especializados

**Resposta:**

**4.2 O site terá links afiliados reais no primeiro deploy?**

- [ ] A — Sim
- [x] B — Não; usar placeholders até aprovação das contas
- [ ] C — Não haverá links afiliados no MVP

**Resposta:**

**4.3 Quem aprova conteúdo e claims antes da publicação?**

- [ ] A — Sergio
- [x] B — Tara dentro do briefing aprovado
- [ ] C — Sergio apenas para claims sensíveis
- [ ] D — Outro: __________

**Resposta:**

## 5. Banco, autenticação e integrações

**5.1 O MVP terá banco de dados próprio?**

- [ ] A — Não
- [x] B — Sim, Supabase/PostgreSQL
- [ ] C — Sim, outro: __________

**Resposta:**

**5.2 O MVP terá autenticação de usuários?**

- [ ] A — Não
- [ ] B — Sim, apenas painel editorial
- [x] C — Sim, usuários leitores
- [ ] D — Outro: __________

**Resposta:**

**5.3 O MVP terá newsletter/captura de e-mail?**

- [ ] A — Não
- [ ] B — Sim; provedor: __________
- [x] C — Preparar componente, ativar depois

**Resposta:**

## 6. Infraestrutura e deploy

**6.1 Qual target de deploy será usado?**

- [x] A — Easypanel/VPS da FBR (recomendado se o runtime já estiver disponível)
- [ ] B — Vercel
- [ ] C — Staging privado
- [ ] D — Outro: __________

**Resposta:**

**6.2 Qual ambiente deve ser publicado primeiro?**

- [ ] A — Staging para validação
- [x] B — Produção diretamente
- [ ] C — Staging e depois produção

**Resposta:**

**6.3 Quem fornece ou confirma o contrato de infraestrutura?**

- [x] A — Sergio
- [ ] B — Théo/infraestrutura
- [ ] C — Tara deve levantar as opções
- [ ] D — Outro: __________

**Resposta:**

**6.4 O deploy pode criar custo recorrente?**

- [ ] A — Sim, dentro de limite mensal de US$ ______
- [x] B — Não; usar somente recursos existentes/gratuitos
- [ ] C — Precisa de aprovação antes de qualquer custo

**Resposta:**

**6.5 O que será obrigatório no readback de deploy?**

Marque `SIM` ou `NÃO`:

- HTTPS — **Resposta:sim**
- Domínio canônico funcionando — **Resposta:sim**
- `/` HTTP 200 — **Resposta:sim**
- `/guides` HTTP 200 — **Resposta:sim**
- Pelo menos um artigo HTTP 200 — **Resposta:sim**
- `/sitemap.xml` HTTP 200 — **Resposta:sim**
- `/robots.txt` HTTP 200 — **Resposta:sim**
- Rollback documentado — **Resposta:sim**

## 7. Escopo e prazo

**7.1 O que deve ser entregue primeiro?**

- [x] A — MVP editorial funcional
- [ ] B — Design completo antes do código
- [ ] C — Deploy/staging primeiro
- [ ] D — Outro: __________

**Resposta:**

**7.2 Qual prioridade de prazo?**

- [x] A — Menor prazo possível
- [ ] B — Qualidade máxima sem prazo fixo
- [ ] C — Data fixa: ____/____/________
- [ ] D — Outro: __________

**Resposta:**

**7.3 O que fica explicitamente fora do MVP?**

- [ ] A — Banco/CMS
- [ ] B — Autenticação
- [x] C — Newsletter
- [x] D — Comentários
- [ ] E — Busca
- [ ] F — Outro: __________

**Resposta:**

## 8. Aprovação final

**8.1 Você aprova a execução autônoma das tarefas não bloqueadas após responder este questionário?**

- [ ] A — Sim
- [x] B — Sim, mas parar antes do deploy externo
- [ ] C — Não; apresentar plano detalhado antes de executar

**Resposta:**

**8.2 Decisões que exigem nova aprovação antes da execução:**

- [x] Deploy externo
- [ ] Criação de banco/migrations
- [x] Ativação de custos recorrentes
- [x] Configuração de domínio/DNS
- [x] Publicação com links afiliados reais
- [ ] Nenhuma além das regras já registradas

**Resposta:**

## Resumo para preenchimento rápido

Copie e responda nesta ordem:

```text
1.1:
1.2:
1.3:
2.1:
2.2:
2.3 feed/categorias/tags/filtros/busca/relacionados/sumário/comentários/newsletter:
3.1:
3.2:
3.3:
3.4:
4.1:
4.2:
4.3:
5.1:
5.2:
5.3:
6.1:
6.2:
6.3:
6.4:
6.5 HTTPS/domínio/home/guides/artigo/sitemap/robots/rollback:
7.1:
7.2:
7.3:
8.1:
8.2:
```
