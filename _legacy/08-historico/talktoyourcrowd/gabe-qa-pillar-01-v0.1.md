# Gabe — QA independente do artigo-pilar 01

**Projeto:** Talk to Your Crowd by Marcus Cole / FBR News  
**Artigo auditado:** `knowledge/talktoyourcrowd/conteudo/marcus-pillar-01-storefront-mistakes-v0.1.md`  
**Fontes confrontadas:**
- `02-prd/PRD-PROJETO-TALK-TO-YOUR-CROWD-EN.md`
- `knowledge/talktoyourcrowd/projetos/talk-to-your-crowd-context.md`
- `knowledge/talktoyourcrowd/pesquisa/bia-amazon-products-v0.1.md`
- `knowledge/talktoyourcrowd/pesquisa/rick-affiliate-link-table-v0.1.md`

**Auditor:** Gabe  
**Data/hora da auditoria:** 2026-09-23 16:42:57 -0300  
**Escopo:** revisão independente do arquivo local; o artigo não foi editado, publicado ou convertido em link afiliado.

## Decisão

**DEVOLVIDO PARA CORREÇÃO.** Não está aprovado para avançar como entrega editorial final nem para publicação. Há dois bloqueadores objetivos: os quatro blocos de produto ainda são placeholders sem URL Amazon.com verificável, e o CTA do lead magnet não reproduz o título definido no PRD. A linguagem de claims está em geral controlada, mas deve permanecer sob revisão editorial.

## Matriz de QA

| Critério | Resultado | Severidade | Evidência | Correção recomendada |
|---|---|---:|---|---|
| **EN-US** | **PASS** | baixa | Artigo integralmente em inglês; título, meta description e corpo nas linhas 1–199. O PRD exige English/EN-US nas linhas 8–10. | Manter. Fazer apenas revisão editorial nativa de estilo, sem trocar o idioma ou introduzir PT-BR. |
| **Título** | **PASS** | baixa | Linha 1 reproduz exatamente o título do PRD, linha 49: “7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget)”. | Manter o título. |
| **Estrutura exigida** | **PASS** | baixa | Linhas 14–20 introdução; linhas 22–149 sete seções numeradas com budget fixes; linhas 151–166 auditoria; linhas 168–172 CTA; linhas 174–190 FAQ; linhas 192–199 fontes/limitações; linhas 201–228 handoff YAML. | Manter a estrutura; validar a nomenclatura exata do CTA conforme critério de coerência com PRD abaixo. |
| **Disclaimer: texto exato** | **PASS** | média | Linha 8 contém, após “Required disclosure:”, o texto oficial exato do PRD/contexto: “Talk to Your Crowd is written by Marcus Cole, an editorial persona of FBR News. Case scenarios are illustrative, evidence-based, and results vary by business location and industry. Posts may contain Amazon Associates affiliate links earning commissions at no extra cost to you.” Confrontado com PRD linhas 75–79 e contexto linhas 34–38. | Não reescrever nem abreviar o texto oficial. |
| **Disclaimer: localização** | **FAIL** | média | Linha 8 está antes do corpo e antes de qualquer placeholder de produto, portanto satisfaz “antes do primeiro link”. Porém os blocos de produto ficam nas linhas 43, 97, 118, 148–149, sem disclosure repetido ou próximo a cada bloco. Rick exige disclosure antes do primeiro link **e** próximo ao bloco/link (linhas 69–76). | No layout/publicação, manter o disclaimer antes do primeiro link e repetir ou posicionar a divulgação de forma claramente próxima aos blocos de produto, confirmando no preview renderizado. Não publicar apenas com validação do Markdown. |
| **Persona pública** | **PASS** | baixa | Linha 3 identifica Marcus Cole como “Retail Growth & Storefront Strategist”; linha 8 o identifica como persona editorial de FBR News. O contexto confirma status fictício, publicamente declarado, linhas 9–18. | Manter. Não apresentar Marcus como cliente, especialista independente ou testemunha real. |
| **ASINs** | **PASS com ressalva** | média | Unique ASINs no artigo: `B08K1RZWCF`, `B00IGZCEIM`, `B08HYJ14RD`, `B01HDDD0RQ` (linhas 43, 95–97, 116–118, 146–149). Todos aparecem na pesquisa da Bia: B08K1RZWCF linha 24; B01HDDD0RQ linha 25; B08HYJ14RD linha 26; B00IGZCEIM linha 43. | Confirmar cada ASIN no listing vivo e a variante antes de publicação. Registrar a correspondência ASIN/URL/data no fluxo de publicação. Observação: B00IGZCEIM está na matriz da pauta 3 de Bia, embora o artigo o use como exemplo de display de balcão; registrar essa decisão de escopo ou substituir se a curadoria editorial exigir apenas produtos da pauta 1. |
| **URLs Amazon.com** | **FAIL / bloqueador** | alta | A varredura do arquivo encontrou **zero URLs `http(s)`**. As linhas 43, 97, 118 e 148–149 são placeholders `[PRODUCT LINK — ASIN ...]`, explicitamente condicionados a verificação. Rick ainda mantém TTC-P1 como `[PENDING_BIA]` e `BLOCKED` (linha 25). | Não inventar URL nem tag. Rick/owner de publicação deve confirmar URL canônica Amazon.com, variante e disponibilidade para cada ASIN; somente depois substituir os placeholders no workflow seguro e repetir QA. |
| **Placeholders** | **PASS como higiene de draft; FAIL para publicação** | alta | Placeholders são transparentes e não simulam links reais: linhas 43, 97, 118 e 148–149. O próprio artigo declara “not approved or published” na linha 6 e “placeholder” nos blocos. | Manter placeholders enquanto a verificação estiver pendente; bloquear qualquer publicação até todos serem resolvidos e rechecados. |
| **Claims quantitativos/comparativos** | **PASS com monitoramento editorial** | média | O número estrutural “seven” é sustentado pelas sete seções (linhas 22–149). Quantificadores operacionais (“three-part”, “three-second”, “ten minutes”) não prometem desempenho. Claims de resultado são negados ou qualificados: linhas 18, 39, 77, 95, 134, 144, 170, 178, 186 e 190. A FAQ menciona “100+ leads” e “300% more reviews” apenas como exemplos de promessas não verificadas e diz para não usá-las (linha 186). | Manter a linguagem hipotética/testável. Na revisão editorial, confirmar que nenhum título, excerpt, card ou metadata transforme esses exemplos em promessa. Não adicionar preço, rating, “tested”, “boost”, “guarantee” ou percentuais sem fonte independente. |
| **Ausência de testimonials falsos** | **PASS** | alta | Não há depoimentos atribuídos a clientes, citações de consumidores, reviews usados como prova de resultado ou histórias apresentadas como caso real. O texto usa cenários e testes genéricos (linhas 16–18, 39, 51, 75, 142). A palavra “testimonial” aparece somente no handoff negativo da linha 226. | Manter. Se exemplos reais forem adicionados depois, identificar fonte e autorização; não fabricar nomes, falas ou resultados. |
| **Separação de características e resultados** | **PASS** | média | Linha 41 diz que características do A-frame não provam resultado; linha 95 chama a descrição de “feature observation only”; linha 116 separa adequação do suporte de performance; linha 146 chama os dados de catálogo de “catalog characteristics”; linhas 188–190 repetem que features/marketplace observations não provam tráfego, leads, reviews, AOV ou vendas. | Manter a separação. Revalidar qualquer copy de produto inserida junto com as URLs. |
| **Coerência com o PRD** | **FAIL** | média | O assunto e título estão coerentes com o artigo 1 do PRD (linha 49), e a audiência/mercado são coerentes. Porém o PRD define o lead magnet como **“The 10-Minute Storefront & Counter Audit Checklist”** (linha 70); o CTA do artigo usa **“The 10-Minute Storefront & Counter Audit”** (linha 168), omitindo “Checklist”. A promessa do PRD (“15 quick adjustments...”) também não é reproduzida de forma explícita. | Alinhar o CTA ao nome canônico do PRD, ou registrar decisão editorial formal para o novo nome. Confirmar se o artigo deve apontar para a promessa de 15 ajustes ou usar uma promessa revisada aprovada. |
| **Secrets, tags privadas e credenciais** | **PASS** | crítica | Não há senha, token, chave, credencial, URL afiliada final ou tag privada no artigo. O arquivo apenas registra a ausência e o fluxo seguro nas linhas 197, 213, 218 e 226. A tabela de Rick também declara que não contém tags/URLs reais (linhas 21 e 50–55). | Manter o arquivo sem secrets. Inserir eventual tag somente no sistema seguro de publicação; nunca no Markdown público ou no relatório. |
| **Status de publicação** | **PASS: draft não publicado** | alta | Linha 6 diz “editorial draft for review, not approved or published”; linha 221 registra gate de execução e “not approved for publication”. Busca do repositório encontrou somente este arquivo para o título/ID, sem cópia publicada. Busca web por `site:talktoyourcrowd.fbr.news "7 Costly Storefront Mistakes"` não retornou resultado. Isto sustenta o status de não publicado, sem substituir a confirmação operacional do owner. | Não publicar. Após correções, repetir QA de links e disclosure no preview e obter o gate de Sergio. |

## Achados prioritários

1. **Alta — links incompletos:** há quatro ASINs rastreáveis, mas nenhuma URL Amazon.com no artigo; os cinco blocos de link são placeholders (linhas 43, 97, 118, 148–149). Isso impede publicação e impede validar ASIN/URL/variante.
2. **Alta — disclosure em render:** o disclaimer está no topo e exato, mas o Markdown não demonstra proximidade aos blocos de link. A posição final precisa ser confirmada no preview conforme a regra de Rick.
3. **Média — CTA divergente do PRD:** “The 10-Minute Storefront & Counter Audit” (linha 168) não coincide com “The 10-Minute Storefront & Counter Audit Checklist” (PRD, linha 70).
4. **Média — escopo de produto:** B00IGZCEIM é candidato da pauta 3 na pesquisa da Bia, mas aparece como exemplo na pauta 1. Não é um ASIN inventado, porém a decisão de inclusão deve ser explicitada ou o item deve ser removido/substituído.

## Gates e decisão final

- **Gate de QA Gabe:** **FAIL / devolvido para correção** pelos bloqueadores de URL/placeholders e desalinhamento do CTA.
- **Gate de publicação:** **não passado**; o artigo permanece draft e não deve ser publicado.
- **Gate de Sergio:** não evidenciado neste artefato; não assumir aprovação.

**Arquivos modificados:** nenhum arquivo do artigo ou das pesquisas.  
**Arquivo criado:** `F:/Projetos/_FBR/FBR Agency Flux/08-historico/talktoyourcrowd/gabe-qa-pillar-01-v0.1.md`.
