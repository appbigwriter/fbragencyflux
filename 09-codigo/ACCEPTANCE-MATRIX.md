# Matriz de aceitação reproduzível

Executar em `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`.

| ID | Comando/ação | Resultado esperado |
|---|---|---|
| A1 | `npm test` | suíte Vitest verde |
| A2 | `npm run typecheck` | TypeScript sem erros |
| A3 | `npm run lint` | ESLint sem erros |
| A4 | `npm run build` | build Next concluído |
| A5 | `npm run start -- -p 3000` | servidor local inicia |
| A6 | `curl -s http://localhost:3000/api/flux/snapshot` | AF-001, After Forty e 12+ artefatos reais |
| A7 | `curl -s http://localhost:3000/api/flux/cards/AF-001` | detalhe com artifacts/handoffs/approvals/events |
| A8 | POST card com `{"status":"review","actor":"Íris","scope":"local"}` | 200 e readback em snapshot |
| A9 | POST card com `{"status":"completed","actor":"Íris","scope":"local"}` sem pré-condição | 400 `INVALID_TRANSITION` ou `MISSING_EVIDENCE`, sem gravação parcial |
| A10 | POST approval com actor Íris | 403 `SERGIO_REQUIRED` |
| A11 | POST approval com Sergio e scope local | 200; GET approval mostra decisão e timestamp |
| A12 | POST Handoff sem `nextStep` | 400 `INVALID_HANDOFF`; tamanho de JSON não aumenta |
| A13 | POST Handoff completo | 201; GET handoffs/readback após reload |
| A14 | abrir `/`, filtrar `AF-001`, clicar card, executar ação, recarregar | confirmação visual e estado persistido |

## Fase 2 remota não atendida

Control Tower/Easypanel/DNS/Supabase, auth, RLS validado, adapter real, backup, locking distribuído, observabilidade e readback público exigem contrato, credencial por referência e deploy autorizado. Os testes locais não substituem esses gates.
