# Gabe — QA independente do artigo-pilar 01 v0.2

**Projeto:** Talk to Your Crowd by Marcus Cole / FBR News  
**Artigo auditado:** `F:/Projetos/_FBR/FBR Agency Flux/knowledge/talktoyourcrowd/conteudo/marcus-pillar-01-storefront-mistakes-v0.2.md`  
**Fontes confrontadas:**
- `F:/Projetos/_FBR/FBR Agency Flux/02-prd/PRD-PROJETO-TALK-TO-YOUR-CROWD-EN.md`
- `F:/Projetos/_FBR/FBR Agency Flux/knowledge/talktoyourcrowd/projetos/talk-to-your-crowd-context.md`
- `F:/Projetos/_FBR/FBR Agency Flux/08-historico/talktoyourcrowd/gabe-qa-pillar-01-v0.1.md`
- `F:/Projetos/_FBR/FBR Agency Flux/knowledge/talktoyourcrowd/pesquisa/rick-affiliate-link-table-v0.2.md`

**Auditor:** Gabe  
**Data/hora da auditoria:** 2026-09-23 16:52:11 -0300  
**Escopo:** QA independente do arquivo local. O artigo não foi editado, publicado ou convertido em link afiliado.

## Evidência de integridade

- SHA-256 do artigo auditado: `65df82ad9d0271204a1e5e550296fe70370fa7cd7e644ae684b952a8c985ef72`.
- O arquivo v0.2 possui 213 linhas no estado auditado.
- A varredura encontrou 0 ASINs, 0 placeholders, 0 URLs `http(s)` e 1 ocorrência exata do disclaimer obrigatório.
- Rick registrou `0/4 VERIFIED`, `4/4 BLOCKED`, nenhuma tag privada inserida e nenhum item publicado no follow-up v0.2.

## Decisão

**APROVADO PARA REVISÃO EDITORIAL.**

O v0.2 corrige os dois bloqueadores registrados no QA v0.1: remove referências de marketplace, ASINs e placeholders, e usa o CTA canônico do PRD. O artigo **não está aprovado para publicação**. A aprovação deste QA é somente para avançar à revisão editorial; qualquer publicação continua dependente dos Gates aplicáveis e de aprovação explícita de Sergio.

## Matriz de QA

| Critério | Resultado | Severidade se falhasse | Evidência | Decisão/ação |
|---|---|---:|---|---|
| **EN-US** | **PASS** | média | Título, meta description, corpo, FAQ e handoff editorial estão em inglês; não há trecho PT-BR no artigo. O PRD exige idioma English (EN-US), PRD linha 9; o contexto confirma EN-US, contexto linha 15. | Manter idioma; revisão editorial deve permanecer em EN-US. |
| **Título** | **PASS** | média | Linha 1 reproduz exatamente o título do artigo 1 no PRD linha 49: `7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget)`. | Manter. |
| **Estrutura** | **PASS** | média | O arquivo contém introdução (linha 14), sete seções numeradas `Mistake 1` a `Mistake 7` (linhas 22, 41, 59, 75, 91, 108 e 124), budget fixes, reset de 10 minutos, CTA (linha 151), FAQ (linha 157), Sources and limitations (linha 175) e Handoff YAML (linha 184). | Estrutura atende ao escopo editorial; revisar somente estilo e consistência na etapa editorial. |
| **Disclaimer exato** | **PASS** | alta | A string obrigatória do PRD linhas 77–79 e do contexto linhas 34–38 aparece uma vez, integralmente, na linha 8: `Talk to Your Crowd is written by Marcus Cole, an editorial persona of FBR News. Case scenarios are illustrative, evidence-based, and results vary by business location and industry. Posts may contain Amazon Associates affiliate links earning commissions at no extra cost to you.` | Não reescrever, abreviar ou substituir. |
| **Disclaimer — localização** | **PASS** | alta | O bloco `Required disclosure` está na linha 8, antes da meta description (linha 10), introdução (linha 14), corpo e qualquer CTA. Como o v0.2 não contém links de marketplace, não existe bloco de produto que exija proximidade adicional. | Manter no topo também no preview renderizado. |
| **Persona pública** | **PASS** | média | Linha 3 identifica Marcus Cole como `Retail Growth & Storefront Strategist`; linha 8 o identifica como `an editorial persona of FBR News`. O contexto define a persona como fictícia e publicamente declarada, contexto linha 18. | Manter a identificação; não apresentar Marcus como cliente, consumidor ou testemunha real. |
| **Sete mistakes** | **PASS** | média | Varredura estrutural encontrou exatamente os headings `Mistake 1` até `Mistake 7`; cada seção tem diagnóstico e uma subseção `Budget fix`. | Manter sete seções; não adicionar produto ou promessa para preencher a estrutura. |
| **CTA canônico** | **PASS** | média | Heading na linha 151: `Try The 10-Minute Storefront & Counter Audit Checklist`; o título exato canônico `The 10-Minute Storefront & Counter Audit Checklist` aparece no CTA e é repetido no corpo. Coincide com PRD linha 70. | Manter exatamente esse título, inclusive `Checklist`. |
| **ASINs** | **PASS** | alta | Varredura do artigo encontrou 0 tokens ASIN. Isso implementa a decisão do follow-up Rick: `0/4 VERIFIED`, todos os candidatos `BLOCKED` (Rick v0.2, linhas 32–37 e 59–61). | Não reintroduzir ASINs por inferência. |
| **Placeholders** | **PASS** | alta | Varredura encontrou 0 placeholders, inclusive nenhum `[PRODUCT LINK]`, `[ASIN]`, `[URL]` ou marcador equivalente. O QA v0.1 havia devolvido o artigo por blocos de placeholder; o v0.2 removeu-os. | Não inserir links ou placeholders sem novo escopo e QA independente. |
| **URLs de marketplace** | **PASS** | alta | Varredura encontrou 0 URLs `http(s)` no artigo. Nenhum endereço Amazon.com ou outro marketplace permanece. | Não inserir URLs marketplace; Rick confirmou que 0/4 candidatos são publicáveis. |
| **Claims quantitativos e promessas não comprovadas** | **PASS** | alta | Não há promessa de aumento garantido de tráfego, leads, reviews, ticket ou vendas. O texto qualifica resultados como hipóteses/testes/observações: linhas 18, 39, 73, 122, 149, 153, 161 e 169. A FAQ linha 169 rejeita explicitamente promessas não verificadas como `100+ leads` e `300% more reviews`. Os números estruturais/operacionais (sete mistakes, três partes, três segundos, dez minutos e dez perguntas) não são claims de desempenho. | Manter linguagem de teste e diagnóstico; não transformar os números operacionais em promessa no título, excerpt, card ou metadata. |
| **Testimonials falsos** | **PASS** | alta | Não há depoimento atribuído a cliente, consumidor, review ou caso real; não há nomes, citações ou resultados apresentados como prova social. A linha 173 esclarece que os exemplos não são endorsements. | Não adicionar testemunhos sem fonte, autorização e evidência verificável. |
| **Separação entre diagnóstico e causalidade** | **PASS** | alta | Linha 18 declara que storefront é apenas parte de um sistema e trata outcomes como hipóteses. Linha 39 diz que observações não provam causalidade; linha 73 chama a contagem de observação diagnóstica; linhas 149, 161 e 169 repetem a distinção entre observação e prova causal. A seção Sources and limitations, linhas 182–183, nega que o guia estabeleça aumento de tráfego, leads, reviews, ticket ou vendas. | Manter a distinção; qualquer revisão não pode converter correlação/diagnóstico em causalidade. |
| **Secrets e tags privadas** | **PASS** | crítica | Não há senha, token, credencial, tag privada, URL afiliada ou valor sensível. As palavras `affiliate tag` e `secret` aparecem somente em declarações negativas dentro do handoff (linhas 195–210), sem qualquer segredo ou tag efetiva. | Não inserir secrets/tags no Markdown, relatório ou copy pública; eventual tagging deve ocorrer somente no sistema seguro autorizado. |
| **Status de não publicação** | **PASS** | alta | Linha 6 declara `editorial draft for new QA, not approved or published`; linha 205 define `revisão — v0.2 ready for new QA; not approved for publication`; linha 202 registra que o draft está pronto para QA e não aprovado para publicação. Rick v0.2 linha 37 também registra que nada foi publicado. | Manter não publicado. Este QA aprova apenas revisão editorial, não publicação. |

## Conclusão e gates

- **Gate de QA Gabe:** **PASS** para avanço à revisão editorial.
- **Gate editorial:** ainda pendente; deve revisar estilo nativo EN-US, render do disclaimer e não alterar os critérios de compliance aprovados.
- **Gate de publicação:** **NÃO PASSADO**; o artigo permanece draft não publicado.
- **Gate de Sergio:** não evidenciado como aprovação de publicação neste artefato; não assumir aprovação.
- **Blockers:** nenhum blocker de QA encontrado no v0.2 dentro do escopo auditado.

**Arquivos modificados:** nenhum arquivo do artigo, PRD, contexto ou pesquisa.  
**Arquivo criado:** `F:/Projetos/_FBR/FBR Agency Flux/08-historico/talktoyourcrowd/gabe-qa-pillar-01-v0.2.md`.
