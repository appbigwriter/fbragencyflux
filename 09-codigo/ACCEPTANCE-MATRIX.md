# Matriz de aceitação reproduzível

Executar em `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`.

| ID | Comando/ação | Resultado esperado |
|---|---|---|
| A1 | `npm test` | suíte Vitest verde |
| A2 | `npm run typecheck` | TypeScript sem erros |
| A3 | `npm run lint` | ESLint sem erros |
| A4 | `npm run build` | build Next concluído |
| A5 | `npm run start -- -p 3000` | servidor local inicia |
| A6 | `FLUX_DATA_FILE=data/after-forty-intake.fixture.json npm run start -- -p 3000` + snapshot | novo E2E começa com AF-001, 4 jobs, 2 Handoffs e 0 artefatos históricos |
| A7 | `curl -s http://localhost:3000/api/flux/cards/AF-001` | detalhe com artifacts/handoffs/approvals/events |
| A8 | POST card com `{"status":"review","actor":"Íris","scope":"local"}` | 200 e readback em snapshot |
| A9 | POST card com `{"status":"completed","actor":"Íris","scope":"local"}` sem pré-condição | 400 `INVALID_TRANSITION` ou `MISSING_EVIDENCE`, sem gravação parcial |
| A10 | POST approval com actor Íris | 403 `SERGIO_REQUIRED` |
| A11 | POST approval com Sergio e scope local | 200; GET approval mostra decisão e timestamp |
| A12 | POST Handoff sem `nextStep` | 400 `INVALID_HANDOFF`; tamanho de JSON não aumenta |
| A13 | POST Handoff completo | 201; GET handoffs/readback após reload |
| A14 | abrir `/`, filtrar `AF-001`, clicar card, executar ação, recarregar | confirmação visual e estado persistido |
| A15 | POST `/api/flux/iris/triage` sem sessão | 401 |
| A16 | triage com correlationId repetido | mesmo evento/handoff, sem duplicação; blocker segue open |
| A17 | triage on intake/handoff/event | rotinas explícitas; sem alegar worker contínuo |
| A18 | cada blocker After Forty | passagem executável com owner, objetivo, entregável, aceite, evidência e próximo check |

## Inventário separado

| Fonte | Projetos | Cards | Handoffs | Jobs | Gates | Blockers declarados | Artefatos |
|---|---:|---:|---:|---:|---:|---:|---:|
| `data/after-forty-intake.fixture.json` (novo E2E) | 2 | 1 | 2 | 4 | 4 | 3 (4 projetados no dashboard) | 0 |
| `data/flux-state.json` (histórico preservado) | 2 | 1 | 55 | 62 | 4 | 3 | 14 |

Histórico só entra por `npm run ingest:flux-history` ou `FLUX_IMPORT_HISTORY=1`; não somar as linhas acima.

## Fase 2 remota não atendida

Control Tower/Easypanel/DNS/Supabase, auth, RLS validado, adapter real, backup, locking distribuído, observabilidade e readback público exigem contrato, credencial por referência e deploy autorizado. Os testes locais não substituem esses gates.
