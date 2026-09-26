# Backlog — The Thirties by Maia Mendes

Atualizado em: 2026-09-26
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
- [ ] **THI-004** Sistema visual e design tokens — P1 — HOLD; depende de decisão final de marca; não há `tokens.css` verificado neste workspace
- [ ] **THI-005** Arquitetura Next.js/Supabase e contratos — P1 — `review`; proposta local criada em `04-site/architecture-contracts-v1.md`; implementação e readback remotos pendentes
- [ ] **THI-006** Primeira pauta You Asked e artigo EN-US — P1 — pronta para preparação editorial após seleção de pauta e fontes específicas; nenhum artigo verificado neste workspace
- [ ] **THI-007** QA editorial/técnico e readiness — P0 — dependente dos artefatos editoriais; nenhum pacote TT-005 verificável neste workspace
- [ ] **THI-008** Publicação/deploy — BLOQUEADO por Gate de Sergio; não executar

## Tracks e dependências

| Track | Estado | Owner | Depende de | Próxima ação |
|---|---|---|---|---|
| THI-003 | HOLD ativo | Maia / Gestor Editorial | export ou ferramenta SEO autorizada | obter dados quantitativos rastreáveis; próximo check após acesso |
| THI-004 | HOLD ativo | Sergio / Publisher | decisão de marca | revisar proposta de tokens quando existir; não bloquear arquitetura |
| THI-005 | review | Maia; Théo futuro | escopo técnico validado | revisar `architecture-contracts-v1.md`; depois story de implementação |
| THI-006 | ready condicional | Maia / Gestor Editorial | pauta escolhida + fontes específicas | selecionar pauta P0 e preparar briefing do artigo, sem publicação |
| THI-007 | blocked por artefatos ausentes | Maia / Gestor Editorial | artigo/vídeo verificáveis | abrir QA quando os artefatos existirem |
| THI-008 | awaiting_approval | Sergio | QA completo + Gates | não executar sem aprovação formal |

## Registro desta sessão

- 2026-09-26 20:12 -03:00: THI-005 avançou para `review` com proposta local de arquitetura e contratos; nenhum código executável, migration, deploy, publicação, gasto ou estado externo foi mutado.
- Gate de expectativa: a entrega cobre o briefing atual e cria a próxima entrada técnica, mas não é implementação nem autoriza produção. A revisão técnica/humana permanece necessária.