---
title: "AF-001 Gate G3 — Gabe compliance review"
version: "1.0"
status: "G3_BLOCKED_PENDING_REMEDIATION_AND_SERGIO_GATE"
agent: "Gabe"
card: "AF-001"
reviewed_at: "2026-09-12"
scope: "Editorial matrix of 12 After Forty pautas; claims, sources, product associations, disclosure, disclaimer and fictional persona"
---

# AF-001 Gate G3 — Gabe compliance review

## Veredito executivo

**G3: BLOCKED.** A matriz contém 12 pautas identificáveis, quatro por categoria, separa Protein de Creatine e mantém seis pautas sem produto. As fontes acadêmicas/governamentais principais são rastreáveis e sustentam alguns ângulos educacionais condicionais. Porém, as seis associações Amazon são apenas snapshots/listings e não validam ingrediente, eficácia, segurança, adequação individual ou produto final. Retinol, dor/conforto, recovery, creatina e qualquer claim sensível não podem avançar sem as correções abaixo. Não houve autorização de produção final, publicação, gasto, candidatura, HopLink ou mutação de infraestrutura.

### Regras aplicadas

- Evidência de ingrediente não prova produto final, blend, SKU, dose, lote, qualidade ou resultado individual
- Claim do seller/listing não é evidência independente
- Estudo in vitro/animal, se houver, não será apresentado como evidência em humanos
- Pautas `SEM PRODUTO` permanecem sem produto; não inserir Amazon ou ClickBank por inferência
- Heidi Braun é persona editorial fictícia: sem first-person testimonial, credenciais inventadas, before/after ou resultado pessoal
- Todo artigo futuro deve conter exatamente o disclaimer oficial e seção `Sources`
- Todo artigo com link afiliado deve conter disclosure claro e próximo do link
- Claims de cura, tratamento, prevenção garantida, dor, cognição, redução de rugas, segurança universal, superioridade e resultado garantido ficam proibidos sem evidência compatível; na dúvida, bloquear

## Controles transversais

| Controle | Evidência auditada | Resultado | Severidade | Owner | Correção |
|---|---|---|---|---|---|
| Contagem da matriz | `editorial-product-plan.md`, IDs SB-01–04, RW-01–04, HF-01–04 | 12 IDs únicos; 4 por categoria | baixa | Gestor Editorial | Manter IDs estáveis nos drafts |
| Proteína versus creatina | HF-01/HF-03 são Protein; HF-02/HF-04 são Creatine | Separação editorial presente; não misturar mecanismos ou doses | alta | Gestor Editorial + Caio | Preservar separação e escrever somente claims condicionais com população/protocolo |
| Ingredient versus produto | Bia S1–S3/S9; Rick listings; plano editorial | Regra está documentada, mas associações Amazon ainda dependem de rechecagem de rótulo/variante | alta | Rick/Amazon Research + Gestor Editorial | Criar camada distinta: evidência do ingrediente, fatos do listing, limites do SKU |
| Pautas sem produto | SB-02, SB-04, RW-02, RW-04, HF-01, HF-03 | Mantidas `SEM PRODUTO`; não há base para inserir oferta | alta | Gestor Editorial + Caio | Não inserir afiliado, ASIN ou ClickBank nessas pautas sem nova decisão formal e nova auditoria |
| Disclaimer oficial | Contexto, linha 59; plano editorial, linha 32 | Texto exato definido | alta | Caio | Reproduzir sem alteração em cada draft; não substituir publisher ou persona |
| Sources | Plano editorial, linhas 28–30; fontes Bia S1–S9 | Requisito definido; ainda não existe draft com links por claim | alta | Caio + Gestor Editorial | Cada afirmação factual deve apontar para URL específica e data de acesso |
| Affiliate disclosure | Plano, linha 34; Rick, linhas 51–58 | Texto definido, mas não aplicado a artigo publicado | crítica | Caio + Gestor Editorial | Inserir antes/próximo de todo link afiliado; confirmar também em qualquer asset visual |
| Amazon | Rick, linhas 21–30 e 51–58 | URLs públicas e sinais datados; preço, estoque, variante, taxa e claims são voláteis | alta | Rick/Amazon Research | Revalidar listing e política no painel; não copiar claims do vendedor; não gerar HopLink nesta etapa |
| ClickBank | Rick, linhas 36–49 | Há opções exploratórias, mas nenhuma foi associada à matriz de 12 pautas | alta | Rick + Gestor Editorial + Gabe | Manter fora das pautas atuais; qualquer futura associação exige Marketplace atual, landing page, termos, disclosure e nova revisão |
| Persona fictícia | Contexto, linhas 52–54; matriz e handoffs | Persona e limites estão declarados | alta | Caio + Lia | Não usar depoimento, credencial, before/after ou visual que implique resultado pessoal |

### Texto obrigatório

**Disclaimer oficial exato:**

> After Forty is written by Heidi Braun, an editorial persona of FBR News. Diary scenarios are illustrative and evidence-based; results vary. Not medical advice. Sources linked below. Posts may contain affiliate links.

**Disclosure de afiliado para conteúdo com links:**

> This post may contain affiliate links. If you purchase through a link, After Forty may earn a commission at no extra cost to you.

O disclaimer acima é obrigatório em todos os artigos; o disclosure é obrigatório quando houver link afiliado. Nenhum dos dois autoriza publicação.

## Veredito por pauta

`PASS` = brief pode avançar somente dentro dos limites indicados, sem autorização de publicação. `FAIL` = a condição atual não satisfaz um critério explícito e exige correção. `BLOCKED` = dependência/evidência insuficiente impede produção segura até readback verificável.

| ID | Veredito | Evidência e fonte rastreável | Severidade | Owner | Correção obrigatória |
|---|---|---|---|---|---|
| SB-01 | BLOCKED | O listing Amazon de Neutrogena B0725JP4TN está rastreado no Rick, linha 26, e o plano, linha 45. AAD S5 sustenta separar tendência de evidência, não eficácia/tolerabilidade de retinol. Não há fonte clínica específica de retinol nem rechecagem de formulação/variante/precauções. | alta | Gestor Editorial + Rick/Amazon Research + Gabe | Adicionar fonte dermatológica/medicinal apropriada para retinoides e cuidados; revalidar rótulo e variante; limitar a leitura de claims; remover qualquer promessa de rugas/manchas/anti-aging; reapresentar para Gabe |
| SB-02 | BLOCKED | AAD S5 (`https://www.aad.org/news/social-media-skin-care-trends`) apoia alfabetização de claims, mas não sustenta por si só uma rotina de barreira para pele sensível, hidratação ou critérios clínicos de interrupção. A pauta sem produto está corretamente preservada. | média | Gestor Editorial + Caio | Complementar fontes dermatológicas/patient education específicas; manter `SEM PRODUTO`; delimitar como educação geral, sem diagnóstico ou recomendação individual |
| SB-03 | BLOCKED | RoC B0744JV661 está rastreado no Rick, linha 27, e plano, linha 47. AAD S5 não prova comparação de eficácia entre marcas; claims de anti-wrinkle/post-acne são claims do listing. Falta evidência específica de retinol e verificação da variante/ingredientes. | alta | Gestor Editorial + Rick/Amazon Research + Gabe | Converter para comparação de campos verificáveis do rótulo apenas; obter fonte específica para qualquer afirmação de ingrediente; revalidar listing; proibir ranking, superioridade, tratamento de cicatriz ou resultado garantido |
| SB-04 | PASS | AAD S5 sustenta separar tendência, evidência e endosso. S8 é apenas sinal comercial e está explicitamente limitado no Bia; não deve ser usado como claim clínico ou número de audiência. A pauta permanece sem produto. | baixa | Caio + Gestor Editorial | Produzir apenas perguntas/checklist de evidência; citar S5; se usar S8, rotular como estimativa comercial e não como fato clínico; manter disclaimer e `Sources` |
| RW-01 | BLOCKED | Amazon Basics B00XM2MXK8 está rastreado no Rick, linha 28. O listing sustenta apenas atributos observados do objeto e descrição do seller; S4 trata associação entre atividade física e sono, não foam rolling, dor ou recuperação do produto. | alta | Gestor Editorial + Rick/Amazon Research + Gabe | Revalidar listing; adicionar fonte adequada para segurança/limites de foam rolling ou retirar orientação de saúde; usar somente tamanho/material/uso declarado como facts; não escrever alívio de dor, lesão ou recuperação acelerada |
| RW-02 | PASS | S4 (`https://pmc.ncbi.nlm.nih.gov/articles/PMC10503965/`) é revisão sistemática sobre atividade física e sono e explicita heterogeneidade. S7 é diretriz HHS para atividade aeróbica, força e equilíbrio em adultos mais velhos. A pauta permanece sem suplemento/produto. | média | Caio | Usar “association”/“may” e limites da população; não prometer sono ou recovery; incluir sinais de procurar profissional somente com fonte apropriada; manter `SEM PRODUTO` |
| RW-03 | FAIL | A associação TriggerPoint CORE está no Rick, linha 29, mas o plano, linha 51, reconhece que o URL não traz ASIN explícito no registro. O próprio título/listing contém “deep tissue”, “muscle recovery”, “mobility” e “circulation”; esses claims não são prova independente e há risco de converter “relieves muscle pain” em claim de saúde. | alta | Rick/Amazon Research + Gestor Editorial | Corrigir identificação com URL/ASIN/variante verificáveis ou remover associação; revalidar listing; não mencionar pain relief, circulação, tratamento ou recuperação como resultado; somente comparar atributos; retornar para nova revisão |
| RW-04 | PASS | S1 ODS sustenta limites de suplementos e necessidade de orientação; S4 sustenta relação atividade/sono com heterogeneidade; S7 sustenta atividade para adultos mais velhos. A pauta é não comercial e não promete dor, lesão ou recuperação acelerada. | média | Caio | Manter sem produto; usar educação geral e sinais de orientação profissional; não inserir ClickBank/Amazon por inferência; citar S1/S4/S7 em `Sources` |
| HF-01 | PASS | S2 (`https://pmc.ncbi.nlm.nih.gov/articles/PMC12348035/`) é revisão de proteína e envelhecimento; S3 (`https://pmc.ncbi.nlm.nih.gov/articles/PMC12400859/`) compara intervenções heterogêneas em adultos mais velhos. A evidência permite explicar população/protocolo e limites, não dose universal ou pó específico. Pauta sem produto correta. | alta | Caio + Gabe | Não prescrever g/kg para pessoa específica; contextualizar condições clínicas e variabilidade; manter `SEM PRODUTO`; separar proteína dietética de produto; citar S2/S3 com limitações |
| HF-02 | BLOCKED | THORNE B07978VPPH está no Rick, linha 23, e plano, linha 54. ODS S1 sustenta informação geral sobre creatina/ingredientes e limites de combinações; S3 e S9 tratam estudos em grupos/protocolos. Nenhuma fonte valida este SKU, seus claims ou segurança individual; o listing é evidência de listing. S9 foi localizado e é rastreável (`https://pmc.ncbi.nlm.nih.gov/articles/PMC12752335`); o abstract relata 8 RCTs/482 participantes e efeitos heterogêneos por desfecho/duração, mas isso não autoriza produto nem claim individual. | crítica | Gabe + Rick/Amazon Research + Gestor Editorial | Ler e registrar a síntese completa de S9; revalidar rótulo, dose, certificação e variante; usar linguagem condicional; incluir retenção de água/ganho de peso e orientação profissional apenas se fontear; não usar cognição, “sem risco”, “funciona para você” ou aprovação clínica |
| HF-03 | PASS | S2/S3 sustentam educação sobre proteína e limites de intervenções; Rick linha 40 documenta BUBS como opção ClickBank, mas a matriz corretamente não o associa. Não há produto. | alta | Caio + Gestor Editorial | Manter `SEM PRODUTO`; checklist de campos de rótulo sem recomendar SKU; não tratar colágeno como creatina, proteína completa, ganho muscular ou recovery; não inserir ClickBank por inferência |
| HF-04 | BLOCKED | Optimum Nutrition B002DYIZEE está no Rick, linha 24, e plano, linha 56. S1/S3/S9 sustentam ingrediente/protocolo, não este SKU; “5 g” e “banned substance tested” são fatos de snapshot/listing e precisam rechecagem. Comparação de listings sem fonte atual de produto final não é segura para avançar. | crítica | Gabe + Rick/Amazon Research + Gestor Editorial | Revalidar listing/variante/rótulo e status de teste no painel/listing atual; separar fatos do produto da evidência de creatina; não ranquear eficácia ou segurança; reapresentar claims e fontes a Gabe |

## Auditoria de claims sensíveis

| Tema | O que as fontes permitem | O que fica bloqueado |
|---|---|---|
| Proteína | Explicar proteína dietética, envelhecimento, heterogeneidade, faixas discutidas em S2 e intervenções de S3 | Dose universal, prescrição individual, prova de powder, prevenção/tratamento de sarcopenia, resultado garantido |
| Creatina | Explicar creatina monohidratada, protocolos com resistência, resultados heterogêneos, retenção de água/ganho de peso quando fonteado | “Works for you”, cognição, sem risco, segurança universal, cura, prevenção garantida, validação de THORNE/Optimum por estudo de ingrediente |
| Retinol | Ensinar leitura crítica de claims e necessidade de orientação dermatológica a partir de fonte adequada | Redução garantida de rugas/manchas, tratamento de cicatrizes/acne, superioridade entre marcas, tolerabilidade sem fonte específica |
| Dor/recovery | Falar de conforto, rotina, carga/descanso e associação atividade-sono quando a fonte sustentar | Pain relief, trata lesão, circulação terapêutica, recuperação acelerada, substitui fisioterapia, prevenção de lesão |
| Amazon | Descrever objeto, variante, ingredientes e claims do listing como claims do vendedor, se rechecados | Copiar seller claim como fato científico; preço/estoque fixos; incentivo enganoso; superlativo sem fonte; link antes do Gate |
| ClickBank | Nenhum produto ClickBank está associado à matriz atual; Rick é apenas radar datado | Inserir BUBS, Back to Life, PrimeBiome, Kerassentials ou Cherry Goodness por inferência; usar payout/EPC como qualidade, segurança ou renda; qualquer claim da landing page sem auditoria |
| Persona | Narrativa ilustrativa explicitamente identificada como tal | Depoimento de Heidi, credenciais reais, before/after, resultado pessoal ou autoridade clínica implícita |

## Fontes auditadas e limites

- **S1 — NIH/ODS:** `https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-Consumer/` — acessível; atualizado em 2021-03-22; informação geral de ingredientes/suplementos, limita extrapolação para produto e ressalta que combinações não estudadas não podem ser presumidas seguras/eficazes
- **S2 — Harris, DePalma & Barkoukis, Nutrients 2025:** `https://pmc.ncbi.nlm.nih.gov/articles/PMC12348035/` — revisão acadêmica; discute proteína e envelhecimento; não prescrição individual nem validação de SKU
- **S3 — Ma et al., Frontiers in Nutrition 2025:** `https://pmc.ncbi.nlm.nih.gov/articles/PMC12400859/` — 19 RCTs em adultos mais velhos saudáveis com protocolos variados; não prova produto, dose universal ou resultado individual
- **S4 — Alnawwar et al., Cureus 2023:** `https://pmc.ncbi.nlm.nih.gov/articles/PMC10503965/` — revisão sistemática sobre atividade física e sono; heterogeneidade; não prova foam roller ou suplemento de recovery
- **S5 — American Academy of Dermatology:** `https://www.aad.org/news/social-media-skin-care-trends` — separa tendência de evidência e não endossa produtos; não é fonte específica de retinol/SKU
- **S7 — HHS/ODPHP:** URL registrada em Bia `https://health.gov/sites/default/files/2023-06/PAG_MidcourseReport_508c_final.pdf` — orientação de atividade para adultos mais velhos; não é claim de suplemento
- **S8 — Grand View Research:** `https://www.grandviewresearch.com/industry-analysis/us-skin-care-products-market-report` — somente sinal comercial não auditado; não usar como evidência clínica
- **S9 — Liu et al., Eur Rev Aging Phys Act 2025:** `https://pmc.ncbi.nlm.nih.gov/articles/PMC12752335` — revisão/meta-análise de creatina + treino em idosos; fonte existe e é rastreável, mas requer leitura integral para qualquer claim final; não valida produto
- **Rick options:** `F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/rick-affiliate-options.md` — coleta 2026-09-12; Amazon/ClickBank voláteis; sem login de painel, HopLink, compra ou ativação
- **Editorial matrix:** `F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/editorial-product-plan.md` — versão 1.0; 12 pautas, seis associações provisórias, seis `SEM PRODUTO`

## Blockers de saída do G3

1. **Bloqueio global:** 7 pautas não têm evidência suficiente ou identificação de produto suficientemente atual para produção segura: SB-01, SB-02, SB-03, RW-01, RW-03, HF-02 e HF-04
2. **Retinol:** falta fonte específica de ingrediente/precauções e rechecagem de formulação/variante para SB-01/SB-03
3. **Recovery/dor:** S4 não sustenta foam rolling, pain relief ou recuperação de produto; RW-01/RW-03 precisam fontes/escopo corrigidos
4. **Creatina/produto:** S1/S3/S9 não validam THORNE ou Optimum; S9 precisa leitura integral e os listings precisam revalidação
5. **RW-03:** ASIN/identidade explícita ausente no registro de Rick; critério de rastreabilidade falha até correção
6. **ClickBank:** nenhuma oferta ClickBank está pronta para associação; manter fora das 12 pautas até nova pesquisa e auditoria
7. **Produção/publicação:** mesmo as pautas PASS só podem virar drafts condicionais; publicação, gasto, alteração de oferta/preço, candidatura ou HopLink exigem Gates posteriores e aprovação explícita/datada de Sergio

## Handoff YAML — Gestor Editorial

```yaml
de: "Gabe"
para: "Gestor Editorial"
card: "AF-001"
objetivo do job: "Corrigir a matriz editorial conforme o parecer G3, preservando apenas ângulos e associações sustentados por evidência rastreável, sem autorizar publicação ou gasto"
entregável: "F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/gabe-compliance-review.md — versão 1.0 — G3_BLOCKED_PENDING_REMEDIATION_AND_SERGIO_GATES"
decisões/suposições:
  - "FATO: a matriz tem 12 IDs únicos, quatro por categoria"
  - "FATO: seis pautas permanecem SEM PRODUTO: SB-02, SB-04, RW-02, RW-04, HF-01 e HF-03"
  - "FATO: seis associações Amazon são provisórias e não equivalem a aprovação clínica, eficácia, segurança ou superioridade"
  - "DECISÃO DE COMPLIANCE: SB-04, RW-02, RW-04, HF-01 e HF-03 passam somente dentro dos limites descritos; as demais sete pautas permanecem bloqueadas ou falham o critério atual"
  - "FATO: nenhuma oferta ClickBank foi associada à matriz; não inserir por inferência"
  - "DECISÃO OPERACIONAL: este Handoff não autoriza draft final, publicação, gasto, HopLink, candidatura ou mutação"
pendências/blockers:
  - "Gestor Editorial — alta — corrigir SB-01/SB-03 com fonte específica de retinol, rechecagem de variante e escopo sem promessa"
  - "Gestor Editorial — alta — corrigir RW-01/RW-03 para eliminar pain relief/recovery claims e resolver identificação/ASIN do RW-03"
  - "Gestor Editorial — crítica — manter HF-02/HF-04 bloqueadas até leitura integral de S9, revalidação do listing e separação ingrediente/SKU"
  - "Gestor Editorial — alta — manter ClickBank fora das 12 pautas até nova auditoria de Marketplace, landing page, termos e disclosure"
  - "Sergio — alta — Gate explícito e datado permanece obrigatório para publicação, gasto, mudança de oferta/preço ou mutação"
gate: "revisão — G3 compliance; bloqueado para publicação/mutação"
critérios de aceite/evidência:
  - "Cada pauta tem veredito, evidência, fonte, severidade, owner e correção neste arquivo"
  - "Cada claim sensível aponta para fonte compatível com população/protocolo e não para claim de seller"
  - "Ingrediente, produto final, listing e hipótese editorial estão em camadas separadas"
  - "Pautas SEM PRODUTO não recebem afiliado por inferência"
  - "Draft futuro contém disclaimer oficial exato, Sources e disclosure próximo de link quando aplicável"
```

## Handoff YAML — Íris

```yaml
de: "Gabe"
para: "Íris"
card: "AF-001"
objetivo do job: "Registrar o parecer G3 e manter o fluxo bloqueado nos itens sem evidência suficiente, encaminhando owners e critérios de readback"
entregável: "F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/gabe-compliance-review.md — versão 1.0"
decisões/suposições:
  - "FATO: o parecer foi baseado em after-forty-context.md, bia-market-research.md, rick-affiliate-options.md e editorial-product-plan.md"
  - "FATO: fontes críticas S1–S5, S7 e S9 foram localizadas por URLs rastreáveis; suas limitações permanecem aplicáveis"
  - "DECISÃO: status de G3 é BLOCKED"
  - "DECISÃO: PASS não significa autorização de publicação; significa apenas que o brief pode avançar dentro dos limites"
  - "LIMITAÇÃO: não houve acesso a painéis Amazon/ClickBank, geração de HopLinks, compra, gasto ou mudança externa"
pendências/blockers:
  - "Kora — alta — registrar estado G3_BLOCKED e o arquivo no histórico local; sem inferir aceite"
  - "Gestor Editorial — alta — receber e aplicar correções por ID"
  - "Caio — alta — não iniciar drafts das pautas bloqueadas; aguardar matriz corrigida"
  - "Lia — alta — não criar criativos com claims para pautas bloqueadas; manter assets em rascunho"
  - "Sergio — alta — aprovação explícita/datada continua necessária para publicação, gasto e mutação"
gate: "revisão — G3 compliance concluído como bloqueado; retorno após remediação"
critérios de aceite/evidência:
  - "Readback registra 12 pautas e a distribuição PASS/FAIL/BLOCKED sem alterar o parecer"
  - "Cada blocker tem owner e dependência verificável"
  - "Nenhum status é tratado como publicação, compra, gasto ou aprovação de oferta"
  - "O disclaimer oficial é preservado literalmente"
```

## Handoff YAML — Kora

```yaml
de: "Gabe"
para: "Kora"
card: "AF-001"
objetivo do job: "Atualizar o estado local do AF-001 com o parecer G3, owners, blockers e dependências, sem criar card externo ou executar mutação"
entregável: "F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/gabe-compliance-review.md — versão 1.0; parecer e Handoffs completos"
decisões/suposições:
  - "FATO: não existe autorização neste arquivo para publicação, gasto, candidatura, HopLink, mudança de oferta/preço ou infraestrutura"
  - "FATO: PASS está limitado a brief editorial condicionado; não é Gate G4"
  - "DECISÃO: G3 global permanece BLOCKED até correção e readback"
  - "FATO: as seis pautas SEM PRODUTO devem continuar sem produto"
  - "FATO: ClickBank permanece radar não associado à matriz"
pendências/blockers:
  - "Kora — alta — registrar status e versão do arquivo no histórico local"
  - "Gestor Editorial — alta — corrigir sete pautas bloqueadas/falha e solicitar nova revisão"
  - "Rick/Amazon Research — alta — revalidar URLs, ASIN/variante, rótulos e dados voláteis sem gerar HopLink"
  - "Gabe — alta — revisar remediações de retinol, recovery/dor e creatina/produto"
  - "Sergio — crítica — Gate separado para qualquer publicação, gasto ou mutação"
gate: "revisão — G3; sem autorização de execução externa"
critérios de aceite/evidência:
  - "Arquivo existe no caminho declarado e mantém a matriz de vereditos"
  - "Readback confirma 12 IDs e status por ID"
  - "Blockers estão atribuídos a owner e não foram removidos por conveniência"
  - "Nenhum registro local é interpretado como aprovação de Sergio"
```

## Handoff YAML — Caio

```yaml
de: "Gabe"
para: "Caio"
card: "AF-001"
objetivo do job: "Preparar copy/drafts somente para pautas aceitas no escopo PASS ou após desbloqueio formal, em inglês, sem claims não sustentados, mantendo disclaimer, Sources e disclosure"
entregável: "F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/gabe-compliance-review.md — versão 1.0; matriz de limites e vereditos"
decisões/suposições:
  - "FATO: Heidi Braun é persona editorial fictícia e não pode testemunhar resultado pessoal"
  - "DECISÃO: SB-02, SB-01, SB-03, RW-01, RW-03, HF-02 e HF-04 não estão liberadas para draft final"
  - "FATO: SB-04, RW-02, RW-04, HF-01 e HF-03 só podem ser rascunhadas como educação condicionada, sem produto ou link afiliado"
  - "DECISÃO: Protein e Creatine permanecem em pautas separadas"
  - "FATO: o disclaimer oficial e o disclosure definidos neste arquivo devem ser copiados literalmente quando aplicáveis"
pendências/blockers:
  - "Caio — alta — aguardar fonte/escopo corrigidos antes de escrever retinol, foam rolling, pain/recovery ou creatine SKU claims"
  - "Gestor Editorial — alta — fornecer matriz corrigida e fontes por claim"
  - "Gabe — alta — reauditar qualquer correção antes de avançar"
  - "Sergio — alta — publicação permanece não autorizada"
gate: "execução — drafts condicionais após remediação G3; nenhum draft equivale a publicação"
critérios de aceite/evidência:
  - "Cada frase factual tem fonte específica e datada em Sources"
  - "Claims de ingrediente não são apresentados como efeito de produto final"
  - "Pautas SEM PRODUTO permanecem sem afiliado"
  - "Disclaimer exato aparece em todos os artigos"
  - "Disclosure exato aparece próximo a qualquer link afiliado"
  - "Não há cure, treatment, guaranteed results, miracle, fabricated before/after ou first-person result"
```

## Handoff YAML — Lia

```yaml
de: "Gabe"
para: "Lia"
card: "AF-001"
objetivo do job: "Manter direção visual e eventuais assets em rascunho, sem fabricar testemunho, before/after, resultado médico ou associação comercial para pauta bloqueada"
entregável: "F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/gabe-compliance-review.md — versão 1.0; limites de persona e status G3"
decisões/suposições:
  - "FATO: Heidi Braun é persona editorial fictícia; manter identidade visual definida no contexto sem sugerir pessoa real ou credencial clínica"
  - "DECISÃO: nenhum asset está liberado para uso externo/publicação"
  - "DECISÃO: não representar produto Amazon/ClickBank como recomendado, aprovado, seguro ou eficaz"
  - "FATO: qualquer disclosure/disclaimer visual deve usar copy aprovada e texto oficial sem alteração"
  - "LIMITAÇÃO: não há claim visual autorizado para as sete pautas bloqueadas"
pendências/blockers:
  - "Lia — alta — não criar before/after, testimonial, transformação, cura, treatment ou resultado garantido"
  - "Caio — média — fornecer copy somente após remediação e escopo G3"
  - "Gabe — alta — revisar claims/disclosure visual antes de qualquer uso externo"
  - "Sergio — crítica — Gate explícito antes de publicação, ativação ou gasto"
gate: "revisão — G3; assets apenas draft local e versionado"
critérios de aceite/evidência:
  - "Cada asset tem ID de pauta, finalidade e versão"
  - "Identidade segue a character bible sem transformar Heidi em testemunha real"
  - "Nenhum visual de produto implica aprovação clínica ou superioridade"
  - "Pautas SEM PRODUTO não recebem produto em imagem por inferência"
  - "Estado permanece draft até Gates de Gabe e Sergio"
```

## Limite de decisão

Este documento é parecer de compliance no Gate G3. Ele **não** é autorização de publicação, compra, gasto, campanha, candidatura, geração de HopLink, alteração de oferta/preço, mudança de infraestrutura ou aprovação clínica/comercial de qualquer produto.
