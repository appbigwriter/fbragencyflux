# SharpEye — Questionário objetivo de decisões pendentes do site v2

**Revisado com base em:** `analise-alinhamento-e-maestria.md` (28/09/2026).  
**Objetivo:** não repetir decisões já fechadas no planejamento; coletar apenas decisões que ainda alteram a execução do código.

## Decisões já consideradas fechadas

Estas definições não precisam ser respondidas novamente:

- Projeto: **SharpEye by Nadia Volkova**.
- Mercado/idioma: **EN-US — EUA/Global**.
- Posicionamento: inteligência espacial para transformar estandes, lojas e pontos físicos em ferramentas de vendas mensuráveis.
- Formatos editoriais: **The Teardown**, **Five-Second Test** e **Signage Autopsy**.
- Rigor editorial: separar fatos, observações empíricas e hipóteses testáveis.
- Direção visual: **Design Studio Notebook**, com Ink/Paper/Graphite/Signal/Cobalt.
- Tipografia proposta: **Space Grotesk**, **Inter** e **IBM Plex Mono**.
- Stack: **Next.js + TypeScript**.
- Rotas-base: `/`, `/the-teardown`, `/guides/[slug]`, `/comparisons/[slug]`, `/about`, `/privacy`, `/terms`, `/disclaimer`.
- Conteúdo-base: três artigos-pilar já redigidos.
- Estado atual: pré-construção; código público ainda não implementado.

## Como responder

Copie a seção `Respostas` no final e preencha somente os códigos. `OUTRO` exige texto. Se uma decisão puder ser tomada autonomamente, marque `AUTONOMIA`.

## A. Gate e início do desenvolvimento

**Q01 — Gate para iniciar a implementação local**
- [ ] A. Autorizado agora: criar o app Next.js na raiz `04-site`
- [ ] B. Autorizado somente protótipo local sem persistência
- [ ] C. Não autorizado ainda

**Q02 — Tratamento de qualquer conteúdo/código existente em `04-site`**
- [ ] A. Preservar tudo e implementar ao redor
- [ ] B. Isolar o que não pertence ao blog e criar estrutura pública limpa
- [ ] C. Fazer inventário primeiro e decidir depois

**Q03 — Estilo de implementação**
- [ ] A. Tailwind CSS
- [ ] B. CSS Modules + tokens CSS
- [ ] C. CSS global + componentes próprios
- [ ] D. AUTONOMIA: escolher a opção mais estável para o projeto

## B. Experiência e conteúdo

**Q04 — CTA principal da home**
- [ ] A. Read the latest Teardown
- [ ] B. Run the Five-Second Test
- [ ] C. Explore spatial guides
- [ ] D. Outro: `__________`
- [ ] E. AUTONOMIA

**Q05 — Busca no primeiro release**
- [ ] A. Adiar; navegação por categorias é suficiente
- [ ] B. Busca simples por título, slug e intenção
- [ ] C. Busca com filtros e paginação
- [ ] D. AUTONOMIA

**Q06 — Formato de renderização dos artigos**
- [ ] A. MDX local para o primeiro release
- [ ] B. Conteúdo no Supabase desde o início
- [ ] C. Híbrido: MDX para artigos + Supabase para fontes/reviews
- [ ] D. AUTONOMIA

**Q07 — Recursos visuais de visual merchandising**
- [ ] A. Apenas imagens, diagramas e caixas de auditoria no v1
- [ ] B. Incluir planta baixa/layout estático no v1
- [ ] C. Incluir hotspots clicáveis e régua de distância no v1
- [ ] D. B agora; C em fase posterior
- [ ] E. AUTONOMIA

**Q08 — Estado de publicação dos três artigos-pilar**
- [ ] A. Draft privado
- [ ] B. Preview em staging
- [ ] C. Publicar após revisão editorial e legal
- [ ] D. AUTONOMIA: manter em draft até Gate

## C. Dados, compliance e monetização

**Q09 — Momento da migration Supabase/RLS**
- [ ] A. Preparar apenas arquivos locais de migration/RLS
- [ ] B. Aplicar em ambiente de desenvolvimento autorizado
- [ ] C. Aplicar no runtime remoto autorizado
- [ ] D. Não iniciar migration ainda

**Q10 — Formulário “Send a space for review”**
- [ ] A. Não criar no v1
- [ ] B. Criar desativado, sem persistência
- [ ] C. Criar e ativar somente após aprovação legal
- [ ] D. AUTONOMIA: criar desativado

**Q11 — Integração FBRSigns/monetização no v1**
- [ ] A. Nenhum módulo de produto
- [ ] B. Links contextuais sem monetização
- [ ] C. Produtos do catálogo aprovado com links
- [ ] D. Afiliados/AdSense somente em fase posterior
- [ ] E. AUTONOMIA: sem monetização até haver catálogo e Gate

**Q12 — Revisão legal**
- [ ] A. Antes de qualquer publicação
- [ ] B. Antes de formulário, analytics ou monetização; conteúdo editorial pode ir para staging
- [ ] C. Não disponível: manter tudo em staging/draft
- [ ] D. Outro: `__________`

## D. Identidade e release

**Q13 — Conceito de logo a prototipar primeiro**
- [ ] A. Sightline mark
- [ ] B. S as plan
- [ ] C. Sharp corner
- [ ] D. Prototipar os três em paralelo
- [ ] E. AUTONOMIA: prototipar os três, sem aprovar marca final

**Q14 — Ambiente do primeiro readback**
- [ ] A. Localhost
- [ ] B. Staging privado
- [ ] C. Staging público sem indexação
- [ ] D. Produção após Gate explícito
- [ ] E. AUTONOMIA: localhost primeiro, staging depois

**Q15 — Critério de “v1 pronto para revisão”**
- [ ] A. Home + navegação + um artigo renderizado + páginas legais em localhost
- [ ] B. A + três artigos + The Teardown + fontes + QA local
- [ ] C. B + Supabase/RLS verificado
- [ ] D. C + staging navegável e revisão humana
- [ ] E. Outro: `__________`

**Q16 — Ordem de execução**
- [ ] A. Fundação → design system → home → artigo → fontes/legal → QA
- [ ] B. Fundação → dados/Supabase → componentes → conteúdo → QA
- [ ] C. Vertical slice: home → um artigo → fontes → legal → QA; depois ampliar
- [ ] D. AUTONOMIA: executar a opção C

---

## Respostas

```text
Q01:
Q02:
Q03:
Q04:
Q05:
Q06:
Q07:
Q08:
Q09:
Q10:
Q11:
Q12:
Q13:
Q14:
Q15:
Q16:
```

## Regra após as respostas

- Respostas `A/B/C/D` fecham a decisão correspondente.
- Respostas `AUTONOMIA` autorizam a execução da alternativa indicada no próprio item.
- O que permanecer sem resposta continua pendente e não será inventado.
- Nenhuma migration remota, monetização, publicação, DNS ou deploy será executado sem Gate explícito.
