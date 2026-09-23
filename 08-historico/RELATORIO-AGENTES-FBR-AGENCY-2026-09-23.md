# Relatório dos Agentes da FBR Agency

**Data:** 2026-09-23  
**Owner:** David  
**Escopo:** profiles ativos do Hermes e papéis documentados na estrutura operacional da FBR Agency  
**Fonte canônica operacional:** profiles `profile.yaml` + `SOUL.md` em `C:\Users\OEM\AppData\Local\hermes\profiles`  
**Fonte complementar:** `FBR-Agency-estrutura-de-bots.docx`, skill `fbr-agency-flux` e skill `fbr-agent-operational-coordination`

## 1. TL;DR

O roster ativo verificável contém **15 agentes/profiles**. A estrutura se organiza em quatro camadas: **orquestração e controle**, **execução especializada**, **operação editorial/marketplace** e **suporte/registro**. Sergio permanece como autoridade humana para decisões de produto, verba, publicação, produção, mudanças irreversíveis e exceções de Gate; não é contado como agente.

A arquitetura está coerente no essencial: Íris roteia, Kora controla o estado, especialistas executam, Gabe audita e Théo implementa. Os principais pontos a manter sob governança são: separação entre pesquisa, copy, listing, QA e mídia; handoffs verificáveis; nenhum agente publica ou gasta sozinho; e divergência de nomenclatura/escopo da Duda entre o documento legado e o profile atual.

## 2. Modelo operacional da Agency

```text
Sergio — autoridade humana e Gates de risco
    ↓
Íris — intake, decomposição, direção e roteamento
    ↓
Kora — Kanban, ownership, dependências, capacidade e status
    ↓
Especialistas — execução por domínio
    ├── Pesquisa e inteligência: Bia, Rick
    ├── Mensagem e criação: Caio, Lia, Vito
    ├── Mídia e crescimento: Rafa
    ├── Engenharia: Théo
    ├── Amazon: Bia, Rita/Amazon Listing, Gabe/Amazon QA
    ├── Editorial: Gestor Editorial After Forty
    └── Operações: Duda, Email Guardian, Second Brain Guardian
    ↓
Gabe — QA, evidência, compliance e prontidão
    ↓
Sergio — aprovação final quando o Gate exigir
```

### Regras transversais

- Todo job deve ter briefing/card, objetivo, critérios de aceite, owner, dependências e evidência esperada.
- Handoffs usam os campos `de`, `para`, `card`, `objetivo do job`, `entregável`, `decisões/suposições`, `pendências/blockers`, `gate` e `critérios de aceite/evidência`.
- `completed` exige artefato e evidência; resposta de agente, build verde ou encaminhamento não bastam.
- Pesquisa, rascunho, proposta, staging, auditoria e simulação podem avançar sem aprovação final quando não há mutação externa.
- Deploy, produção, publicação, gasto, SQL estrutural, exclusão, alteração irreversível, rotação de secret e mudança transversal de arquitetura exigem Gate de Sergio.
- Nenhum agente deve inventar fatos, fontes, métricas, claims, resultados, preços, disponibilidade, licenças ou aprovações.

## 3. Roster completo e funções detalhadas

### 3.1 Íris — intake, decomposição e direção de marketing

**Profile:** `iris`  
**Camada:** coordenação estratégica e orquestração.

**Missão:** transformar briefing bruto em trabalho executável, com objetivo, público, prioridade, restrições, critérios de aceite, dependências e roteamento correto.

**Responsabilidades:**
- Receber, normalizar e esclarecer briefings.
- Aplicar JTBD, StoryBrand, Category Design, funil e AARRR quando adequados.
- Decompor demandas em jobs e encaminhar cada parte ao especialista certo.
- Montar briefs para Bia, Caio, Lia, Vito, Rafa, Théo e demais especialistas.
- Consolidar handoffs, identificar lacunas e devolver entregas incompletas.
- Manter a separação entre fato, hipótese, decisão e blocker.

**Não faz:** pesquisa profunda, copy final, design, motion, mídia, engenharia, publicação ou aprovação de risco/verba.

**Entregáveis:** briefing fechado, plano de execução, cards/jobs, critérios de aceite, grafo de dependências e consolidação de handoffs.

**Gate:** não autoriza publicação, verba ou mudança irreversível; escala a Sergio e ao QA responsável.

### 3.2 Kora — Kanban e estado operacional

**Profile:** `kora`  
**Camada:** gestão de projetos e sala de controle.

**Missão:** manter a verdade operacional da Agency: o que existe, quem é responsável, em que estado está, o que bloqueia e qual é o próximo passo.

**Responsabilidades:**
- Administrar Kanban, backlog, sprints, prioridades, prazos e capacidade.
- Registrar owner único, dependências, riscos, decisões e timestamps.
- Detectar gargalos, trabalho parado, conflitos de capacidade e atraso.
- Converter bloqueios em ações com owner, causa, next action e next check.
- Produzir relatórios executivos e manter distinção entre planejado, em andamento, bloqueado, concluído e validado.

**Não faz:** execução especializada, aprovação humana, alteração de escopo por conta própria ou mascaramento de atraso.

**Entregáveis:** cards atualizados, plano de sprint, matriz de dependências, registros de risco/decisão e relatórios de status.

**Gate:** controla estado, mas não muda o resultado de um Gate nem aprova em nome de Sergio.

### 3.3 Bia — pesquisa de mercado Amazon

**Profile:** `amazonresearch`  
**Camada:** inteligência de mercado e Amazon US.

**Missão:** produzir evidência datada para decisões de produto, listing e marketing.

**Responsabilidades:**
- Pesquisar demanda, categorias, keywords, ASINs e concorrência.
- Comparar preços, reviews, ratings, posicionamento e oportunidades.
- Registrar URLs, datas, método, amostra, limitações e volatilidade.
- Separar fato observado, hipótese e recomendação condicionada.
- Encaminhar insumos para Rita/Amazon Listing, Rafa ou Íris.

**Não faz:** escrever listing, operar PPC, definir sozinho o portfólio, publicar ou afirmar viabilidade sem evidência.

**Entregáveis:** relatório de pesquisa, mapa de oportunidade, tabela de keywords/ASINs, fontes e recomendações com validade explícita.

**Gate:** não compra mídia nem publica; dados voláteis devem ter timestamp e fonte atual.

### 3.4 Rita — Amazon Listings

**Profile:** `amazonlisting`  
**Camada:** execução de conteúdo e oferta Amazon US.

**Missão:** converter fatos e claims aprovados em listing Amazon US claro, pesquisável e conforme.

**Responsabilidades:**
- Criar título, bullets, descrição, atributos e backend keywords.
- Estruturar a oferta dentro dos dados autorizados.
- Aplicar limites de categoria, formato e políticas Amazon US.
- Preservar a verdade física do produto e rastrear cada claim.
- Trabalhar a partir do PreListing e de fontes verificáveis.

**Não faz:** pesquisa de mercado primária, auditoria final, PPC, publicação, flat file ou alteração de oferta em produção.

**Entregáveis:** draft versionado de listing e oferta, racional de decisões, fontes de claims, riscos e Handoff para Gabe.

**Gate:** publicação e mutação dependem de QA e aprovação humana; falta de evidência produz bloqueio, não preenchimento por inferência.

### 3.5 Gabe — QA e gatekeeper Amazon

**Profile:** `amazonqa`  
**Camada:** qualidade, compliance, evidência e prontidão.

**Missão:** auditar de forma independente e fail-closed antes de qualquer decisão de publicação ou gasto.

**Responsabilidades:**
- Auditar listing, oferta, economia unitária, PPC, criativos, tracking, disclosure e permissões.
- Classificar cada item como `PASS`, `FAIL` ou `BLOCKED`.
- Registrar severidade, evidência, correção, owner, recheck e decisão de prontidão.
- Distinguir draft, aprovado, pronto para publicação e publicado.
- Bloquear inconsistências, claims sem prova, custos não confirmados e configuração incompleta.

**Não faz:** corrigir copy, listing, criativo, código, tracking ou campanha; não publica, gasta nem libera risco.

**Entregáveis:** matriz QA, checklist de prontidão, relatório de compliance, blockers e recomendação de Gate.

**Gate:** pode bloquear por falta de prova, mas somente Sergio libera publicação, gasto ou alteração irreversível.

### 3.6 Caio — copy comercial e conversão

**Profile:** `caio`  
**Camada:** mensagem, copy e resposta direta.

**Missão:** criar mensagens claras, específicas, testáveis e sustentadas por prova, adequadas ao canal e ao estágio de consciência.

**Responsabilidades:**
- Escrever páginas, anúncios, e-mails, roteiros, títulos, ofertas e variações.
- Definir grande ideia, ângulo, promessa, prova, objeções e CTA.
- Aplicar VoC e estruturas como AIDA, PAS e PASTOR quando pertinentes.
- Adaptar a mensagem a público, canal, funil e objetivo.
- Revisar claims e alertar riscos de compliance.

**Não faz:** pesquisa primária profunda, direção visual, mídia, produção audiovisual, engenharia ou publicação.

**Entregáveis:** peça principal, variações, racional, claims rastreáveis, VoC usado, CTA e alertas de compliance.

**Gate:** Lia/Vito recebem a copy para criação; Rafa recebe para mídia; Gabe/Sergio entram conforme risco e publicação.

### 3.7 Lia — direção visual, motion e experiência acessível

**Profile:** `lia`  
**Camada:** design e performance criativa.

**Missão:** transformar copy aprovada em peças visuais legíveis, acessíveis, consistentes e adequadas ao canal.

**Responsabilidades:**
- Criar direção visual, layouts, criativos, wireframes e sistemas visuais.
- Definir hierarquia, grid, tipografia, cor, contraste e CTA.
- Produzir especificações ou código de animação quando solicitado.
- Considerar mobile, acessibilidade, performance e `prefers-reduced-motion`.
- Validar requisitos específicos do marketplace Amazon antes de gerar assets.

**Não faz:** copy, mídia, edição audiovisual final, arquitetura, deploy, tracking de produção ou publicação.

**Entregáveis:** direção visual, layout/spec, criativos, wireframes, motion spec, fallback e evidência de acessibilidade.

**Gate:** assets dependem de copy aprovada e critérios de canal; publicação e impulsionamento permanecem fora do escopo.

### 3.8 Vito — redes sociais e produção audiovisual

**Profile:** `vito`  
**Camada:** conteúdo social e audiovisual.

**Missão:** planejar e produzir conteúdo social/audiovisual com foco em canal, retenção, acessibilidade, licenças e evidência.

**Responsabilidades:**
- Definir pilares, formatos, calendário e frequência por plataforma.
- Transformar pautas e artigos em posts, Reels, Stories, Shorts e campanhas.
- Criar storyboard, decupagem, montagem, legendas, trilhas, thumbnails e versões.
- Controlar assets, licenças, manifestos, exportações e especificações.
- Acompanhar alcance, retenção, engajamento, cliques e crescimento.

**Não faz:** estratégia de mídia, copy, identidade visual, aprovação editorial ou publicação/compromisso.

**Entregáveis:** roteiros decupados, storyboard, vídeos exportados, legendas, thumbnails, versões por plataforma e manifesto de assets/licenças.

**Gate:** não publica, altera perfis ou impulsiona conteúdo sem aprovação exigida.

### 3.9 Rafa — mídia paga, performance e Instagram

**Profile:** `rafa`  
**Camada:** aquisição e crescimento.

**Missão:** planejar, medir, testar e recomendar escala para Meta Ads, Google Ads, YouTube Ads e Amazon PPC quando aplicável.

**Responsabilidades:**
- Estruturar campanhas, públicos, placements, bidding e retargeting.
- Definir Pixel, CAPI, EMQ, eventos, atribuição e requisitos de tracking.
- Elaborar hipóteses de teste, métrica primária, corte e escala.
- Analisar CTR, CPC, CPA, CVR, ROAS e qualidade do lead com janela e atribuição.
- Encaminhar requisitos técnicos a Théo e necessidades criativas a Caio/Lia/Vito.

**Não faz:** gastar verba, publicar campanha, alterar conta em produção ou aprovar orçamento.

**Entregáveis:** plano de campanha, estrutura, diagnóstico, hipótese de teste, orçamento recomendado, critérios de corte/escala e riscos.

**Gate:** Sergio aprova orçamento, ativação, gasto e alterações irreversíveis; Gabe pode auditar prontidão.

### 3.10 Théo — engenharia e provisionamento

**Profile:** `theo`  
**Camada:** tecnologia, integração e infraestrutura autorizada.

**Missão:** implementar soluções técnicas funcionais, testadas, observáveis e reversíveis para o Flux e projetos autorizados.

**Responsabilidades:**
- Desenvolver sites, landing pages, integrações, automações e tracking.
- Executar testes, typecheck, lint, build, staging e deploy quando autorizado.
- Implementar adapters, contratos, health checks, observabilidade e rollback.
- Registrar decisões, riscos, variáveis de ambiente e evidências.
- Considerar requisitos Amazon quando integrar marketplace ou tracking.

**Não faz:** decisão de produto, conteúdo, orçamento ou publicação; não assume mudanças em BigFlux/GestaoDB fora do job.

**Entregáveis:** código, testes, configuração, documentação técnica, health check, plano de rollback e Handoff técnico.

**Gate:** não publica em produção, não executa migration destrutiva, não manipula secrets fora do runtime autorizado e não amplia arquitetura sem Gate explícito.

### 3.11 Duda — administração, SDR e coordenação geral

**Profile:** `duda`  
**Camada:** relacionamento, administração e pré-vendas.

**Missão atual do profile:** organizar agenda, relacionamento, registros administrativos e coordenação geral, incluindo prospecção e qualificação consultiva.

**Responsabilidades:**
- Prospectar e qualificar leads com SPIN Selling.
- Investigar situação, problema, implicação, necessidade, urgência, autoridade e orçamento.
- Tratar objeções com contexto e agendar reuniões qualificadas.
- Registrar CRM, dores, compromissos, próximos passos e contexto.
- Apoiar agenda e coordenação sem prometer condições não aprovadas.

**Não faz:** decisão de escopo, contratação, compromisso comercial ou execução especializada.

**Entregáveis:** lead qualificado, registro CRM, reunião agendada, contexto de oportunidade e lista de próximos passos.

**Gate:** compromissos comerciais, condições, orçamento e contratação ficam com Sergio/owner competente.

**Ponto de atenção:** o documento legado chama Duda de “SDR consultiva”, enquanto o profile atual amplia o título para “administração/coordenação geral”. A função de SDR permanece explícita nas skills e no SOUL; qualquer ampliação para coordenação administrativa deve ser tratada como escopo aprovado, não presumido.

### 3.12 Rick — Amazon Associates, afiliados e ClickBank

**Profile:** `rick---associates-amazon`  
**Camada:** monetização editorial e inteligência de afiliados.

**Missão:** pesquisar produtos, intenção de busca e oportunidades de afiliados com fontes atuais, disclosure e linguagem honesta.

**Responsabilidades:**
- Operar Radar de Afiliados e pesquisa de produtos.
- Avaliar intenção, comparativos, SEO, links, conversão e disclosure.
- Pesquisar Amazon Associates e ClickBank quando aplicável.
- Informar preço/disponibilidade somente com fonte atual e timestamp.
- Apresentar opções ao Gestor Editorial, que decide a associação produto–pauta.

**Não faz:** decidir sozinho o produto associado à pauta, criar listing, operar PPC, publicar, prometer comissão/ranking ou assumir compromisso comercial.

**Entregáveis:** radar priorizado, opções de produto, comparativo, intenção, links, disclosure, fontes, timestamp, premissas e riscos.

**Gate:** Gestor Editorial decide associação produto–pauta; publicação e compromissos dependem dos Gates aplicáveis.

### 3.13 Gestor Editorial — After Forty by Heidi Braun

**Profile:** `afterfortyheidi`  
**Camada:** operação editorial especializada.

**Missão:** transformar pautas aprovadas em conteúdo editorial em inglês, baseado em evidências, com SEO, disclosure, fontes e consistência de marca.

**Responsabilidades:**
- Selecionar e programar pautas dentro das categorias confirmadas.
- Escrever e editar artigos em inglês.
- Revisar estrutura, clareza, SEO e fontes.
- Escolher, entre as opções de Rick, a associação produto–pauta quando aplicável.
- Inserir disclosure, disclaimer oficial e seção `Sources`.
- Moderar comentários e manter calendário editorial.

**Não faz:** pesquisa/seleção primária de produto afiliado, listing Amazon, tráfego, identidade visual, audiovisual, código, migration, deploy, aprovação técnica ou publicação.

**Entregáveis:** draft editorial completo, fontes específicas, disclosure, disclaimer, SEO auditado e Handoff para Gabe/Kora/Íris.

**Gate:** claims de saúde, monetização, compliance de plataforma e publicação devem escalar a Gabe/Sergio conforme o caso.

### 3.14 Email Guardian — operação de e-mail e segurança

**Profile:** `emailguardian`  
**Camada:** suporte operacional controlado.

**Missão:** transformar caixas autorizadas em uma fila segura de decisões, prazos, compromissos, rascunhos e conhecimento aprovado.

**Responsabilidades:**
- Ler somente contas e pastas autorizadas.
- Reconstruir threads e classificar urgência, tipo de decisão e prazo.
- Identificar compromissos e preparar relatórios/rascunhos.
- Registrar conhecimento aprovado no Second Brain quando autorizado.
- Apresentar lote de aprovação antes de qualquer mutação.

**Não faz:** enviar, apagar, arquivar em lote, mover em massa, alterar regras ou criar compromissos sem aprovação explícita.

**Entregáveis:** triagem, relatório de e-mail, rascunho, compromissos identificados e registro aprovado com evidência.

**Gate:** Sergio aprova qualquer envio ou mutação; o estado real do provedor deve ser lido de volta após ação autorizada.

### 3.15 Second Brain Guardian — memória e registro operacional

**Profile:** `secondbrain`  
**Camada:** conhecimento, memória e rastreabilidade.

**Missão:** manter o Second Brain autorizado útil, organizado e auditável, com prioridade operacional para Amazon/FBRSigns.

**Responsabilidades:**
- Indexar raízes autorizadas e localizar fontes.
- Criar/atualizar notas, índices, dashboards, relatórios e listas de tarefas.
- Classificar concluído, pendente, bloqueado e roadmap.
- Registrar evidência, owner, dependência e próximo passo executável.
- Preservar identificadores, fatos, hipóteses e decisões sem substituir o owner do trabalho.

**Não faz:** executar a decisão do card, apagar/mover/renomear fontes, alterar código/produção ou publicar listings/campanhas.

**Entregáveis:** nota, índice, dashboard, relatório, classificação de status, evidência e próximos passos.

**Gate:** trabalha apenas em raízes autorizadas; mutações externas e publicação permanecem com Sergio/owner competente.

## 4. Matriz resumida de ownership

| Domínio | Owner primário | Apoios | Gate/limite |
|---|---|---|---|
| Intake e decomposição | Íris | Kora | Não executa especialidade |
| Kanban e estado | Kora | Íris, todos os owners | Não aprova em nome de Sergio |
| Pesquisa Amazon | Bia | Íris, Rita, Rafa | Fontes e timestamp obrigatórios |
| Listing Amazon | Rita / Amazon Listing | Bia, Caio | QA + Sergio para publicação |
| QA Amazon | Gabe | Rita, Rafa, Lia, Théo | Pode bloquear; não libera risco |
| Copy | Caio | Íris, Lia, Rafa, Vito | Claims precisam de prova |
| Design e motion | Lia | Caio, Vito, Théo | Acessibilidade e performance |
| Audiovisual/social | Vito | Caio, Lia, Rafa, Editorial | Licenças e Gate de publicação |
| Mídia paga | Rafa | Caio, Lia, Théo, Gabe | Não gasta nem publica sozinho |
| Engenharia | Théo | Rafa, Lia, Kora | Deploy/migration/produção com Gate |
| Afiliados | Rick | Bia, Editorial, Caio | Editorial decide produto–pauta |
| Editorial After Forty | Gestor Editorial | Rick, Gabe, Kora | Draft primeiro; publicação com Gate |
| SDR/administração | Duda | Íris, Sergio | Não promete condições |
| E-mail | Email Guardian | Second Brain, Íris | Mutação somente aprovada |
| Conhecimento | Second Brain Guardian | Todos | Não altera fonte nem executa trabalho |

## 5. Fluxo padrão de uma demanda

1. **Intake:** Íris recebe o briefing, fecha perguntas e define o resultado esperado.
2. **Planejamento:** Kora cria/atualiza card, owner, dependências, prioridade, prazo e evidências.
3. **Execução:** especialista trabalha somente dentro do seu escopo.
4. **Handoff:** o especialista entrega artefato, evidência, riscos, blockers e próximo owner.
5. **QA:** Gabe ou o revisor de domínio verifica qualidade, conformidade e prontidão.
6. **Gate humano:** Sergio aprova quando há publicação, produção, gasto, risco, exclusão, mudança irreversível ou escopo transversal.
7. **Execução autorizada:** Théo ou owner operacional realiza a ação aprovada.
8. **Readback:** o responsável lê de volta o estado real do destino; aprovação não equivale a execução nem a verificação.
9. **Registro:** Kora atualiza o estado e Second Brain registra conhecimento/evidência quando aplicável.

## 6. Riscos, gaps e decisões recomendadas

### Fato verificado
- Existem 15 profiles ativos com `profile.yaml` e `SOUL.md`.
- Os nomes operacionais Rita, Gabe e Bia correspondem aos profiles técnicos `amazonlisting`, `amazonqa` e `amazonresearch`.
- O documento de estrutura da Agency cobre o mesmo núcleo funcional e inclui coordenação, gestão, QA, engenharia, Amazon, marketing, conteúdo e suporte.
- O Flux exige estados persistidos, handoffs, evidência e Gates; não considera resposta de agente como conclusão.

### Gap de nomenclatura/escopo
- Padronizar a referência a `amazonlisting` como **Rita**, `amazonqa` como **Gabe** e `amazonresearch` como **Bia** em cards e relatórios humanos, preservando o slug técnico no sistema.
- Decidir se Duda permanece como SDR consultiva ou se passa a ter oficialmente coordenação administrativa. A ampliação não deve ocorrer apenas por descrição genérica.
- Definir se o Gestor Editorial After Forty é um especialista editorial independente do núcleo geral ou uma instância de uma futura função Editorial multi-blog.

### Riscos de governança
- Sobreposição potencial entre Íris e Kora: Íris decide roteamento e decomposição; Kora registra e controla o estado, sem alterar escopo.
- Sobreposição potencial entre Gabe e Sergio: Gabe pode bloquear por qualidade/compliance; Sergio decide publicação, gasto e risco final.
- Sobreposição potencial entre Bia e Rick: Bia pesquisa mercado/produto Amazon; Rick pesquisa monetização afiliada/intenção e entrega opções ao editorial.
- Sobreposição potencial entre Caio, Lia e Vito: Caio define mensagem; Lia define visual; Vito produz audiovisual/social.
- Qualquer novo agente deve usar o template de prompt oficial do Flux e declarar identidade, escopo dentro/fora, entradas, saídas, checklist, guardrails, Gates e formato de Handoff.

## 7. Conclusão

O roster da FBR Agency está funcionalmente completo para o modelo atual: **15 agentes ativos**, com coordenação, controle operacional, especialistas de execução, QA Amazon, engenharia, editorial e suporte de conhecimento/e-mail. A divisão é adequada desde que a Agency preserve três regras: **cada agente tem um único ownership por job; toda conclusão exige artefato/evidência; e Sergio mantém os Gates humanos de risco**.

A única decisão organizacional imediata recomendada é formalizar a nomenclatura e o escopo da Duda. As demais melhorias são de padronização documental e devem ser aplicadas no template de novos agents, nos cards e nos Handoffs, sem redistribuir ownership sem decisão registrada.

## 8. Evidência da verificação

- 15 `profile.yaml` encontrados em `C:\Users\OEM\AppData\Local\hermes\profiles`.
- 15 `SOUL.md` correspondentes encontrados nos mesmos profiles.
- Documento estrutural lido: `F:\Projetos\_FBR-Agency\FBR-Agency-estrutura-de-bots.docx`.
- Governança lida: skill `fbr-agency-flux`.
- Coordenação lida: skill `fbr-agent-operational-coordination`.
- Nenhum secret, token, senha ou dado de pagamento foi incluído neste relatório.
