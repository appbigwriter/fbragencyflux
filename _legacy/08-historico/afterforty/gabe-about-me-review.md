---
title: "AF-ABOUT-001 — Gabe G3 compliance review of About Me"
version: "1.0"
status: "BLOCKED_CLAIM_CONDITIONAL_NO_PUBLICATION_AUTHORIZATION"
agent: "Gabe"
card: "AF-ABOUT-001"
reviewed_at: "2026-09-13"
scope: "Local About Me draft and consumer copy; no publication, commit, push, deploy, or external mutation"
---

# AF-ABOUT-001 — Revisão G3 de compliance da copy About Me

## Veredito

`BLOCKED_CLAIM_CONDITIONAL_NO_PUBLICATION_AUTHORIZATION`

A copy pode avançar como draft local depois de corrigir dois pontos objetivos. O artigo inteiro não está bloqueado: a persona fictícia está declarada, não há credencial, depoimento, before/after ou resultado pessoal inventado, e não há claim clínico afirmado como fato. A ausência de estudo científico específico não é bloqueador porque a página é institucional/educacional e não faz claim clínico de produto.

A publicação continua bloqueada por gate separado, explícito e datado de Sergio

## Escopo e evidência factual

Arquivos lidos:

- `F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/about-me-copy-draft.md`
- `F:/Projetos/_FBR/FBR Blogs/After Forty/content/copy/about-me.md`
- `F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/gabe-final-g3-review.md`
- `F:/Projetos/_FBR/FBR Agency Flux/knowledge/vito/projetos/after-forty-context.md`
- `F:/Projetos/_FBR/FBR Agency Flux/03-arquitetura/politica-flexivel-de-evidencias.md`
- `F:/Projetos/_FBR/FBR Blogs/After Forty/README.md`
- `F:/Projetos/_FBR/FBR Blogs/After Forty/delivery-checklist.md`
- `F:/Projetos/_FBR/FBR Agency Flux/06-design/DesignSystemBlogs/after-forty/design-brief.md`

FATOS observados no texto e no contexto:

- Heidi Braun é identificada duas vezes como persona editorial fictícia de FBR News e como não sendo pessoa real, clínica, coach ou testadora de produto
- A copy rejeita explicitamente biografia, histórias pessoais, credenciais, testimonials e imagery comparativa fabricadas
- Cenas em formato de diário são qualificadas como dispositivo ilustrativo, não como vida de Heidi
- Recovery & Wellness e Home Fitness são enquadrados como informação geral, sem instrução individual, dose universal ou resultado garantido
- Protein/creatine é mencionado como tema de perguntas para 40+, não como prescrição ou promessa
- Não foram encontrados cure, treatment, miracle, guaranteed results, before/after fabricado, first-person result, escassez falsa ou superlativo não sustentado usados como afirmação
- Não há produto, SKU, affiliate URL, HopLink ou CTA de compra no About Me
- O CTA é editorial: começar pela pergunta, ler a explicação e seguir as fontes
- O disclaimer oficial aparece como o último texto do draft e da cópia consumidora, exatamente como no contexto oficial

HIPÓTESE controlada: a frase sobre revisão jornalística só pode permanecer se o Gestor Editorial comprovar esse processo como fato operacional. O contexto fornecido não comprova a afirmação

## Matriz G3

| Controle | Resultado | Evidência | Ação |
|---|---|---|---|
| Persona fictícia e disclosure | PASS | Linhas 18 e 66 declaram a natureza fictícia e a visibilidade do disclosure | Manter; preservar destaque e posição visível |
| Credenciais, biografia e experiência | PASS | Linhas 18–20 negam pessoa real, credenciais, teste e histórias fabricadas | Não adicionar primeira pessoa factual, credencial ou experiência de uso |
| Depoimentos, before/after e imagens | PASS | Linha 20 e notas visuais 76–79 separam ilustração de evidência | Manter; não usar retrato como prova de resultado |
| Saúde/wellness | PASS_CONDITIONAL | Linhas 48, 52 e 62 usam educação geral, limites e não aconselhamento médico | Manter linguagem geral; não acrescentar prevenção, tratamento, cura, segurança universal ou resultado |
| Promessas e superlativos | PASS | Não há promessa individual ou superlativo de eficácia no texto | Não inserir copy comercial na adaptação |
| Afirmações editoriais | BLOCKED_CLAIM | Linha 32 afirma revisão editorial e “pre-publication brand approval”; a última parte contradiz o design brief, que registra ausência de aprovação pré-publicação | Corrigir o trecho antes de aprovação |
| Disclosure comercial | PASS_CONDITIONAL | Não há link afiliado; o disclaimer apenas informa possibilidade futura | Inserir disclosure próximo ao link somente se link autorizado for adicionado |
| Disclaimer final | PASS | Texto final conferido byte a byte contra o disclaimer oficial | Não editar, traduzir, reordenar ou acrescentar texto depois dele |
| Sources e links | BLOCKED_SECTION | Sources contém caminhos locais e domínio esperado em texto monoespaçado, não links públicos inspecionáveis; “Sources linked below” fica impreciso | Rotular como registro interno no draft ou substituir por links reais e acessíveis antes de publicar |
| CTA | PASS | Linha 70 convida à leitura e às fontes, sem compra ou pressão | Manter como CTA editorial |
| Fato versus hipótese | PASS_CONDITIONAL | Limites e incertezas são explicitados; duas afirmações institucionais excedem a evidência registrada | Aplicar as duas correções objetivas abaixo |

## Correções objetivas obrigatórias

### C1 — aprovação de marca e processo editorial

**Trecho bloqueado, linha 32:**

> commercial arrangements do not replace editorial review or pre-publication brand approval

**Problema:** “pre-publication brand approval” contradiz o design brief, que registra apoio por publicidade/afiliados sem aprovação pré-publicação da marca. A frase também apresenta um processo institucional não comprovado no contexto

**Correção recomendada:**

> commercial arrangements do not determine the publication’s editorial conclusions

Se o fluxo real não comprovar revisão editorial formal, substituir também “created and reviewed as journalism-informed service content” na linha 20 por uma descrição factual do processo aprovado pelo Gestor Editorial. Não usar “journalism” como credencial implícita

**Owner:** Gestor Editorial + Caio  
**Severidade:** alta  
**Tipo:** BLOCKED_CLAIM, trecho isolado

### C2 — Sources e promessa de links

**Trechos bloqueados, linhas 56–58 e seção Sources:**

> Sources appear with the article so readers can inspect the trail

> `F:/Projetos/...` e `https://afterforty.fbr.news` — entradas atualmente registradas no arquivo

**Problema:** caminhos de filesystem e domínio esperado documentam rastreabilidade interna, mas não são links públicos que leitores possam inspecionar. O domínio também está explicitamente marcado no contexto como não verificado

**Correção recomendada para draft local:**

> Internal source records are listed below for review. Public source links and access status must be verified before publication.

Na seção `Sources`, manter caminhos como evidência interna, marcar o domínio como `expected domain — not publicly verified`, e não descrevê-los como links para leitores

**Correção recomendada para versão publicável:** substituir cada fonte por URL pública real, acessível e datada, somente após readback; remover qualquer caminho local e não afirmar disponibilidade do domínio sem verificação

**Owner:** Caio + Lia + Gestor Editorial; Kora registra evidência; Sergio decide publicação  
**Severidade:** alta  
**Tipo:** BLOCKED_SECTION, trecho/implementação isolado

## Controles preservados

- Não bloquear por falta de estudo clínico do SKU: não há SKU nem claim clínico no About Me
- Não inserir estudo científico apenas para cumprir aparência de evidência
- Não converter “evidence-aware”, “journalism-informed” ou “evidence-based” em credencial clínica ou garantia
- Não adicionar disclaimer comercial separado enquanto não existir link afiliado
- Não transformar a persona visual “German-American woman in her fifties” em biografia factual de uma pessoa real
- Não publicar, gerar link comercial, comprar, gastar, fazer commit, push ou deploy

## Disclaimer oficial exato — deve permanecer no final

```text
After Forty is written by Heidi Braun, an editorial persona of FBR News. Diary scenarios are illustrative and evidence-based; results vary. Not medical advice. Sources linked below. Posts may contain affiliate links.
```

## Testes e contagem

- `about-me-copy-draft.md`: 132 linhas; o disclaimer é o último texto
- `content/copy/about-me.md`: 89 linhas; o disclaimer é o último texto
- As duas cópias têm a mesma copy publicável até a seção Sources/disclaimer; o draft contém Handoff YAML adicional antes do disclaimer
- Headings auditados: 11 seções principais, incluindo `Sources`; 0 headings de produto ou CTA de compra
- URLs literais: 1, o domínio esperado `https://afterforty.fbr.news`; não é affiliate URL e não foi tratado como publicamente disponível
- Affiliate URLs/HopLinks: 0 encontrados
- Claims clínicos afirmativos, garantias, depoimentos ou credenciais inventadas: 0 encontrados
- Disclaimer oficial exato no final: 2/2 cópias
- Handoff YAML: 6 destinatários obrigatórios, todos incluídos no arquivo separado

## Handoff

Arquivo: `F:/Projetos/_FBR/FBR Agency Flux/08-historico/afterforty/gabe-about-me-review-handoff.yaml`

Status do Gate: revisão G3 local concluída condicionalmente; publicação bloqueada até C1/C2, readback dos links e gate de Sergio

## Veredito final

`CONDITIONAL_REVIEW — BLOCK C1/C2 ONLY`

A copy é aproveitável como base editorial transparente. Caio deve corrigir os dois trechos, Lia deve conferir inglês e precisão do disclosure, Gestor Editorial deve confirmar o processo institucional, Kora deve registrar o readback, Íris deve encaminhar o estado, e Sergio deve emitir eventual autorização separada. Nenhuma autorização está concedida por este review
