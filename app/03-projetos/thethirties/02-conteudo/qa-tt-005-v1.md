# QA editorial — TT-005 v1

**Projeto:** The Thirties by Maia Mendes  
**Card:** THI-007  
**Artefato revisado:** `02-conteudo/tt-005-capsule-wardrobe.md`  
**Execução:** 2026-09-26, revisão local independente do draft  
**Owner:** Maia Mendes / Gestor Editorial  
**Estado:** `verifying` local concluído; pacote apto para THI-008, sem autorização de publicação ou monetização.

## Critérios de aceite

1. **Escopo:** dado o card TT-005, a entrega deve conter artigo e roteiro de vídeo em EN-US no mesmo artefato. **ATENDIDO** — headings `Article draft` e `Video script` presentes no arquivo revisado.
2. **Qualidade editorial:** dado o briefing, o texto deve entregar orientação prática, humor contextual e opção de não comprar. **ATENDIDO** — auditoria manual encontrou auditoria da semana, filtro de três perguntas, papéis de uso, alternativa de reparar/tailor/clean e “skip it/save your money”.
3. **Conformidade YMYL:** dado que o projeto possui guardrails de saúde e bem-estar, a peça não deve conter claim clínico, promessa de resultado, diagnóstico ou credencial inventada. **ATENDIDO** — busca automatizada no conteúdo do artigo/vídeo retornou `prohibited_clinical=0`; o tema é estilo e não faz alegações clínicas.
4. **Conformidade de marca:** dado o briefing, o humor não deve explorar corpo, idade, medo ou vergonha. **ATENDIDO** — busca automatizada no conteúdo antes do checklist retornou `prohibited_framing=0`; o checklist de produção ainda exige visuais body-neutral e sem age-shaming.
5. **Monetização:** dado que produtos ainda não foram validados, o draft não deve conter URL, ASIN ou link de afiliado, mas deve preservar disclosure quando recomendações forem futuras. **ATENDIDO** — `product_urls=0`; há um disclosure explícito no artigo e disclosure falado no encerramento do vídeo.
6. **Formato/produção:** dado o pacote artigo + vídeo, o arquivo deve conter checklist de produção e pendências explícitas. **ATENDIDO** — 6 itens de produção presentes, incluindo catálogo, preço/disponibilidade, disclosure, acessibilidade e QA final.

## Evidência executada

- Script local: `C:/Users/OEM/AppData/Local/hermes/profiles/maia-mendes---the-tirties/cache/scratch/qa_tt005.py`
- Resultado real: `QA_ASSERTIONS=PASS`
- Contagens verificadas: `article_heading=True`, `video_heading=True`, `disclosure_count=1`, `product_urls=0`, `prohibited_clinical=0`, `prohibited_framing=0`, `production_items=6`.
- O conteúdo foi lido de `02-conteudo/tt-005-capsule-wardrobe.md`; nenhum arquivo externo ou fonte inventada foi usado.

## Fato, hipótese, bloqueio e decisão

- **FATO:** o pacote artigo + vídeo existe no path indicado e passou os seis critérios locais acima.
- **FATO:** não há links/URLs de produto no pacote revisado.
- **FATO:** a execução foi local; não houve publicação, deploy, compra, ativação de campanha ou mutação externa.
- **HIPÓTESE:** a peça está pronta para revisão técnica/editorial de readiness; confiança alta apenas para o escopo local verificado.
- **BLOQUEIO:** validação de catálogo, preço, disponibilidade, acessibilidade final, fontes de produto e Gate de publicação/monetização ainda não foram executados. Owner do desbloqueio: Gestor Editorial + Sergio para o Gate aplicável. Next check: THI-008.
- **DECISÃO:** manter TT-005 sem links de produto e encaminhar o próximo card desbloqueado, THI-008, para QA editorial/técnico e readiness.

## Handoff

**De:** Maia Mendes / Gestor Editorial  
**Para:** owner de THI-008 (QA editorial/técnico e readiness)  
**Card:** THI-007 → THI-008  
**Entregável:** draft TT-005 + este receipt de QA  
**Precisa de Gate:** não para QA local; sim antes de publicação, deploy ou monetização.  
**Pendências:** validar catálogo/produtos somente se links forem aprovados; verificar captions/transcript e acessibilidade no pacote final; não transformar este receipt em autorização pública.
