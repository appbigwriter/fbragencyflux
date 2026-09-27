# Receipt — Recuperação operacional The Thirties v13

- **Data da execução:** 2026-09-27 08:21:29 -03:00
- **Job:** THIRTIES-OPS-20260927-003
- **Projeto:** The Thirties by Maia Mendes
- **Escopo:** recuperação local; sem publicação, links, monetização, migration, deploy ou mutação externa.
- **Canonical workspace:** `F:\Projetos\_FBR\FBR Agency Flux\03-projetos\thethirties`

## Diagnóstico e proveniência

- **FATO:** a busca filesystem em `F:\Projetos\_FBR` e nas localizações Hermes relacionadas não encontrou os quatro nomes históricos `03-design-ui/tokens.css`, `02-conteudo/article-tt-005.md`, `02-conteudo/video-tt-005.md` e `02-conteudo/qa-readiness-tt-005-v1.md` como arquivos ativos.
- **FATO:** o histórico Git alcançou um commit recuperável, porém não referenciado, `bc2a8a2fd4a4cc36cf41a4411dbecde3016d1f78` (`update 2`, 2026-09-26 19:54:50 -03:00), contendo os artefatos exatos e um pacote canônico mais novo.
- **FATO:** o commit não contém os nomes separados `article-tt-005.md` e `video-tt-005.md`; contém `02-conteudo/tt-005-capsule-wardrobe.md`, explicitamente marcado como `article + video script`. Esse arquivo foi tratado como substituto canônico recuperável, não dividido nem renomeado.
- **FATO:** nenhuma redação foi reconstruída ou inferida; os bytes foram extraídos diretamente do commit acima.

## Artefatos restaurados

- `03-design-ui/tokens.css` — SHA-256 `5227ea5b63294b899be8d408b2bd91a552f3511ac47776d6105bd80412608142`
- `02-conteudo/tt-005-capsule-wardrobe.md` — substituto único do artigo + roteiro de vídeo; SHA-256 `13f3dd5b7d269100ceb28617fd6634c33d6cab6d162273dd8bc1924fe1f76730`
- `02-conteudo/qa-tt-005-v1.md` — SHA-256 `bd40dbb3d8d568312a1fc727cbb778f7f71b36f760cf2a8c1b150dc067cfd7ad`
- `02-conteudo/qa-readiness-tt-005-v1.md` — SHA-256 `31870ab20d10bcaf1e7f89ddd391ec13ec2b9f83579934d4caeb97617ce7e04c`
- `02-conteudo/tt-005-transcript-en-us.md` — SHA-256 `a7fb4f9892a5ced7b9e55c923f616c1107399e44666682f20b01f10deca4e41d`
- `02-conteudo/tt-005-captions-en-us.vtt` — SHA-256 `dd0418f59579b193e1aa538387390fda6c50a56560830736935257ad59e507cb`
- `02-conteudo/tt-005-accessibility-notes-en-us.md` — SHA-256 `a3c651cfbda791b2ec0a830201b4342728cf00b1d3bb1092121a04a05716ecce`

Os sete arquivos tiveram readback byte-a-byte confirmado contra `git show bc2a8a2fd4a4cc36cf41a4411dbecde3016d1f78:<path>`.

## Verificação

- `qa_tt005.py` — exit 0; `QA_ASSERTIONS=PASS`; artigo e vídeo presentes, disclosure 1, URLs de produto 0, claims proibidos 0, framing proibido 0, checklist 6 itens.
- `verify_thi008.py` — exit 0; `THI008_ARTIFACTS=PASS`; transcript 2339 caracteres, 16 cues, acessibilidade 2201 caracteres.
- `readiness_tt005.py` — exit 0; `READINESS_BASELINE=PASS`; o texto `READINESS_HOLD=TRANSCRIPT_CAPTIONS_NOT_YET_PRODUCED` é baseline histórico do script e não contradiz a verificação posterior acima.
- `git diff --check -- .` — exit 0.

## Limite e próximo movimento

- **FATO:** os nomes históricos separados `article-tt-005.md` e `video-tt-005.md` continuam inexistentes; o pacote recuperado é a substituição canônica mais nova encontrada.
- **FATO:** nenhum card foi promovido e nenhum Gate externo foi executado.
- **BLOQUEIO remanescente:** revisão humana final e Gate de marca/publicação/monetização continuam necessários; tokens permanecem proposta local.
- **Próxima ação:** Sergio/Publisher e Maia devem revisar o pacote recuperado e decidir os Gates; somente depois registrar eventual promoção, sem publicar ou adicionar links nesta execução.
