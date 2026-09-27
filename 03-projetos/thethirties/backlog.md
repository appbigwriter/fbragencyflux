# Backlog — The Thirties by Maia Mendes

Atualizado em: 2026-09-27
Fonte: briefing recebido do Publisher; nenhum item é considerado concluído sem artefato e evidência.

## Próxima entrega prioritária

### THI-001 — Fundação editorial, YMYL e compliance
- **Estado:** concluída e verificada
- **Prioridade:** P0
- **Owner:** Maia Mendes / Gestor Editorial
- **Objetivo:** converter o briefing em regras operacionais para pesquisa, copy e futura implementação.
- **Artefato:** `01-pesquisa/matriz-editorial-compliance-v1.md`
- **Aceite:** escopo e fora de escopo explícitos; riscos YMYL classificados; claims proibidos/rebaixados documentados; fontes pendentes separadas de fatos; gates de publicação/monetização registrados.
- **Dependências:** nenhuma para a versão inicial; pesquisa externa será etapa seguinte.
- **Gate:** publicação pública e ativação de monetização exigem aprovação de Sergio.

## Sequência planejada

- [x] **THI-001** Fundação editorial/YMYL/compliance — P0 — concluída/verificada; `01-pesquisa/matriz-editorial-compliance-v1.md`
- [x] **THI-002** Pesquisa de mercado e concorrência com fontes rastreáveis — P0 — pesquisa inicial concluída/verificada; volume de keywords/SERP pendente; `01-pesquisa/analise-nicho.md`
- [ ] **THI-003** Mapa de palavras-chave e oportunidades — P1 — HOLD quantitativo; depende de export/ferramenta SEO autorizada para US/en-US
- [ ] **THI-004** Sistema visual e design tokens — P1 — HOLD; proposta local `03-design-ui/tokens.css` verificada; depende de decisão final de marca
- [x] **THI-005** Arquitetura Next.js/Supabase e contratos — P1 — proposta local concluída/verificada em `04-site/architecture-contracts-v1.md`; implementação e readback remotos permanecem como etapa posterior
- [ ] **THI-006** Primeira pauta You Asked e artigo EN-US — P1 — pacote combinado TT-005 (artigo + roteiro) recuperado e verificado localmente; revisão editorial/pauta final ainda pendentes
- [ ] **THI-007** QA editorial/técnico e readiness — P0 — QA, transcript, captions e acessibilidade verificados localmente; revisão humana/Gate ainda pendentes
- [ ] **THI-008** Publicação/deploy — BLOQUEADO por Gate de Sergio; não executar

## Tracks e dependências

| Track | Estado | Owner | Depende de | Próxima ação |
|---|---|---|---|---|
| THI-003 | HOLD ativo | Maia / Gestor Editorial | export ou ferramenta SEO autorizada | obter dados quantitativos rastreáveis; próximo check após acesso |
| THI-004 | HOLD ativo | Sergio / Publisher | decisão de marca | revisar `03-design-ui/tokens.css`; manter como proposta até decisão formal |
| THI-005 | review | Maia; Théo futuro | escopo técnico validado | revisar `architecture-contracts-v1.md`; depois story de implementação |
| THI-006 | ready condicional | Maia / Gestor Editorial | pauta escolhida + fontes específicas | revisar o pacote combinado TT-005 e fechar pauta/fontes, sem publicação |
| THI-007 | verifying local concluído | Maia / Gestor Editorial | revisão humana + produção final | registrar revisão humana e manter Gate fechado |
| THI-008 | awaiting_approval | Sergio | QA completo + Gates | não executar sem aprovação formal |

## Registro desta sessão

- 2026-09-27 — execução recorrente operacional registrada: revalidar artefatos canônicos, checks locais e discrepâncias; não promover cards nem mutar publicação, links, monetização, migration, deploy ou Gates.
- 2026-09-26 20:12 -03:00: THI-005 avançou para `review` com proposta local de arquitetura e contratos; nenhum código executável, migration, deploy, publicação, gasto ou estado externo foi mutado.
- Gate de expectativa: a entrega cobre o briefing atual e cria a próxima entrada técnica, mas não é implementação nem autoriza produção. A revisão técnica/humana permanece necessária.
- **PROBLEMA TÉCNICO — 2026-09-26:** histórico anterior alegava checks e artefatos (THI-004, THI-006, THI-007/008, TT-005 e novos pacotes), mas esses arquivos não existem no workspace canônico após a execução recorrente. O backlog foi preservado somente com checks respaldados por artefato atualmente presente (THI-001 e THI-002). Executor atualizado para não sobrescrever/reconstruir o backlog e exigir readback; recuperação dos artefatos ausentes permanece pendente.
- **Atualização da discrepância — 2026-09-27 08:39:** a recuperação local v13 e a revalidação v14 confirmaram os sete artefatos recuperados no commit `bc2a8a2fd4a4cc36cf41a4411dbecde3016d1f78`; a discrepância histórica dos arquivos separados `article-tt-005.md` e `video-tt-005.md` permanece, pois o commit contém somente o pacote combinado canônico.
- 2026-09-26 20:47 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-26-v8.md` criado e lido de volta. `git diff --check -- .` exit 0; THI-001/002/005 permanecem respaldados por artefato; ausências de THI-004/006/007/008 e TT-005 continuam registradas. Nenhum card foi promovido, e nenhum estado externo foi mutado.
- 2026-09-26 21:20 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-26-v9.md` criado e verificado. `git diff --check -- .` exit 0; THI-001/002/005 permanecem respaldados; quatro artefatos históricos continuam ausentes e registrados como PROBLEMA TÉCNICO. Nenhum card foi promovido, e nenhum estado externo foi mutado.
- 2026-09-26 22:05 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-26-v10.md` criado e verificado. `git diff --check -- .` exit 0; presença dos artefatos foi revalidada; THI-001/002/005 permanecem respaldados; quatro artefatos históricos continuam ausentes e registrados como PROBLEMA TÉCNICO. Nenhum card foi promovido, e nenhum estado externo foi mutado.
- 2026-09-27 07:32 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-27-v11.md` criado. Revalidação confirmou THI-001/002/005 presentes, quatro artefatos históricos ausentes e `git diff --check -- .` exit 0. Nenhum card foi promovido; Gates e estados externos permanecem fechados.
- 2026-09-27 08:05 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-27-v12.md` criado e verificado. Revalidação confirmou os três artefatos respaldados presentes, quatro artefatos históricos ausentes, ausência de `package.json` e `git diff --check -- .` exit 0. Nenhum card foi promovido; Gates e estados externos permanecem fechados.
- 2026-09-27 08:39 -03:00: revalidação independente confirmou os sete artefatos recuperados no commit `bc2a8a2fd4a4cc36cf41a4411dbecde3016d1f78`, com byte-match e SHA-256 conferidos; checks de conteúdo do TT-005 e `git diff --check -- .` retornaram exit 0. Backlog reconciliado sem promover cards: THI-004 permanece HOLD de marca; THI-006/007 têm evidência local recuperada; THI-008 permanece bloqueado por Gate.
- 2026-09-27 09:15 -03:00: follow-up v15 executado após leitura do backlog e artefatos. Verificador independente confirmou os sete byte-matches/SHA-256, seções Article draft/Video script, dois disclosures, URLs de produto 0, padrões clínicos/framing proibidos 0 e `git diff --check -- .` exit 0. Receipt `qa-operational-followup-2026-09-27-v15.md`; nenhum card ou Gate promovido. A primeira probe do verificador falhou por regex inválida no próprio script, foi corrigida e a execução final passou; artefatos do projeto não foram alterados.
- 2026-09-27 09:47 -03:00: follow-up v17 executado após leitura do backlog e artefatos. `verify_thirties_cycle_2.py`, `qa_tt005.py`, `verify_thi008.py` e `git diff --check -- .` retornaram exit 0; sete byte-matches, checks TT-005 e readiness confirmados. `qa_th012.py` retornou exit 0, mas reportou os cinco arquivos THI-012 ausentes; como o script não falha para ausência, isso foi registrado como PROBLEMA TÉCNICO e não como conclusão. Nenhum card ou Gate foi promovido; publicação, links, monetização, migration e deploy permanecem fechados. Receipt `qa-operational-followup-2026-09-27-v17.md`.
- 2026-09-27 10:20 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-27-v18.md` criado e lido de volta. Filesystem/checksum confirmou os artefatos canônicos presentes; `git diff --check -- .` exit 0; busca textual local não encontrou URLs externas nem padrões clínicos/framing proibidos. `01-pesquisa/plano-validacao-keywords-v1.md` e o receipt esperado de THI-012 continuam ausentes; nenhuma ausência foi reconstruída ou promovida. Receipt `qa-operational-followup-2026-09-27-v18.md`; nenhum card ou Gate foi promovido.
- 2026-09-27 11:25 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-27-v20.md` criado e verificado. Dez artefatos canônicos presentes com SHA-256 conferidos; plano SEO, receipt THI-012 e `package.json` ausentes; não houve URL externa. A única ocorrência de `fear-based` está em um guardrail negativo de acessibilidade, não em claim. `git diff --check -- .` exit 0. Nenhum card ou Gate foi promovido; publicação, links, monetização, migration e deploy permanecem fechados.
- 2026-09-27 11:58 -03:00: follow-up operacional read-only concluído; receipt `qa-operational-followup-2026-09-27-v21.md` criado. Dez SHA-256 coincidem com v20; busca textual direcionada retornou zero ocorrências; ausências de plano SEO, receipt THI-012 e `package.json` permanecem registradas; `git diff --check -- .` exit 0. Nenhum card ou Gate foi promovido; publicação, links, monetização, migration e deploy permanecem fechados.