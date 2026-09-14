# Separação entre estado inicial e histórico

`data/after-forty-intake.fixture.json` é a fonte explícita do novo E2E After Forty. Ele contém 2 projetos, 1 card (`AF-001`), 4 jobs iniciais, 2 Handoffs `received`, 4 Gates pendentes, 3 blockers estruturados (4 blockers abertos quando o blocker aninhado de Handoff é projetado no dashboard), 1 evento e nenhum artefato histórico.

`data/flux-state.json` é o snapshot operacional histórico preservado: 2 projetos, 1 card, 55 Handoffs, 62 jobs, 4 Gates, 3 blockers, 1 evento e 14 artefatos. Esses números não devem ser somados aos do E2E.

## Regras

- `load` não percorre o filesystem histórico e não grava seus registros no snapshot.
- `syncHandoffs` e `syncAgentRuns` são operações de ingestão explícita; `npm run ingest:flux-history` salva o resultado no backend configurado.
- `FLUX_IMPORT_HISTORY=1` habilita a mesma ingestão para uma execução deliberada; não é default de produção nem dos testes.
- Cada teste define `FLUX_DATA_FILE`/passa um arquivo temporário baseado no fixture. O fixture versionado não é mutado.
- Supabase continua sem fallback: quando selecionado, leitura e escrita permanecem no `flux_state` configurado; seed/reset usam comandos e fontes explícitas.

O histórico nunca é apagado por essa separação.