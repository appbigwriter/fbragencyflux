# QA editorial/técnico e readiness — TT-005 v1

**Projeto:** The Thirties by Maia Mendes  
**Card:** THI-008  
**Entrada:** `02-conteudo/tt-005-capsule-wardrobe.md` + `02-conteudo/qa-tt-005-v1.md`  
**Owner:** Maia Mendes / Gestor Editorial  
**Execução:** 2026-09-26, verificação local  
**Estado:** `verifying` local concluído — transcript, captions e notas de acessibilidade entregues e verificados; publicação e monetização continuam bloqueadas por Gate.

## Checklist verificável

- [x] Artigo e roteiro de vídeo estão no arquivo e em EN-US.
- [x] Disclosure aparece no artigo e no encerramento falado do vídeo.
- [x] Não há URL de produto no draft.
- [x] Checklist de produção existe e inclui preço/disponibilidade, disclosure, visuais, transcript/captions e QA final.
- [x] Transcript EN-US produzido e revisado localmente.
- [x] Captions EN-US produzidas e revisadas localmente.
- [x] Descrições acessíveis dos visuais/produtos definidas para a versão final.
- [ ] Catálogo/preço/disponibilidade validados — só é necessário se links/recomendações forem liberados.

## Evidência executada

- Script local: `C:/Users/OEM/AppData/Local/hermes/profiles/maia-mendes---the-tirties/cache/scratch/readiness_tt005.py`
- Resultado real: `READINESS_BASELINE=PASS` e `READINESS_HOLD=TRANSCRIPT_CAPTIONS_NOT_YET_PRODUCED`.
- Readback do draft: `has_article=True`, `has_video=True`, `has_disclosure=True`, `has_production_checklist=True`, `has_product_links=False`.
- O baseline acima registrou o estado anterior, antes da produção dos artefatos. A verificação posterior em `verify_thi008.py` confirmou os artefatos locais e promoveu o readiness local; a publicação continua bloqueada.

## Evidência da revisão local

- Transcript: `02-conteudo/tt-005-transcript-en-us.md` — disclosure preservado e todos os seis segmentos do roteiro cobertos.
- Captions: `02-conteudo/tt-005-captions-en-us.vtt` — 16 cues temporizados, incluindo disclosure final e descrições de demonstrações visuais.
- Acessibilidade: `02-conteudo/tt-005-accessibility-notes-en-us.md` — plano de descrição dos sete blocos visuais, enquadramento body-neutral e regras para não inventar claims de produto.
- Verificação independente: `C:/Users/OEM/AppData/Local/hermes/profiles/maia-mendes---the-tirties/cache/scratch/verify_thi008.py`; resultado real `THI008_ARTIFACTS=PASS`, `captions_cues=16`.

## Limite operacional remanescente

- **what:** revisão humana final de captions/descrições durante a produção e validação de qualquer catálogo caso links sejam adicionados.
- **why:** o VTT e as notas estão prontos localmente, mas a publicação exige conferência final e o catálogo só pode ser usado após validação.
- **who/from:** Gestor Editorial; Sergio para o Gate de publicação/monetização.
- **to/destinatário:** pacote final TT-005 em `02-conteudo/` e eventual superfície publicada.
- **objective:** preservar acessibilidade e conformidade antes de qualquer publicação, sem inferir aprovação.
- **deliverable:** revisão final registrada e, se aplicável, catálogo/preço/disponibilidade com fonte e data.
- **acceptanceCriteria:** revisão final assinada no receipt; disclosure visível; nenhum link/produto não validado; Gate de publicação registrado.
- **evidenceRequired:** readback do pacote, validação de catálogo somente se necessária e aprovação formal do Gate.
- **nextCheck:** antes de THI-009, após revisão humana e decisão de publicação.
- **fallback:** manter publicação fechada; pacote local permanece utilizável para QA sem links.
- **status:** HOLD de produção/Gate — THI-008 localmente verificável; THI-009 bloqueado.

## Fato, hipótese, bloqueio e decisão

- **FATO:** baseline editorial e estrutural passou na verificação local.
- **FATO:** não houve publicação, deploy, compra, ativação de campanha, links afiliados ou mutação externa.
- **FATO:** transcript, captions e notas de acessibilidade foram produzidos e passaram a verificação local independente.
- **BLOQUEIO:** revisão humana final de produção e Gate de publicação/monetização permanecem pendentes; owner é Gestor Editorial/Sergio conforme a etapa.
- **HIPÓTESE:** o pacote atende ao readiness local sem catálogo externo; confiança alta apenas para o escopo local verificado.
- **DECISÃO:** promover THI-008 como verificado localmente; manter THI-009 e qualquer link/produto bloqueados.
