# FBR Agency Flux — gates dashboard readiness

Status: LOCAL_READY — exatamente 4 Gates transversais persistidos — NO EXTERNAL EFFECT

After Forty é mantido como projeto/caso de exemplo no estado do Flux (`AF-001`); os Gates pertencem ao próprio FBR Agency Flux

## Gate map

| ID | Gate transversal | Owner | Blocker / evidência |
|---|---|---|---|
| FLUX-GATE-01 | Concepção e escopo do Flux | Íris | Concepção exige revisão e decisão explícita de Sergio; `resultado-esperado-do-flux.md`, `ACCEPTANCE-MATRIX.md` |
| FLUX-GATE-02 | Sincronização de agentes, jobs, skills e workflows | Kora | Eventos e Handoffs de agentes/jobs ainda precisam de sincronização contínua; controle em tempo real da concepção |
| FLUX-GATE-03 | Dependências, Handoffs e evidências | Gabe | Toda conclusão exige artefato/evidência verificável; Handoffs e artefatos locais |
| FLUX-GATE-04 | Status em tempo real e decisões de Sergio | Sergio | Auth remoto e integrações permanecem fora do gate local; API, eventos e readback |

Todos iniciam em `pending`, pertencem ao projeto `FBR Agency Flux`, possuem card/project, decisão necessária, impacto, custo, escopo, reversibilidade, rollback, evidências, owner e timestamps. `externalActionAuthorized` é separado e permanece `false`, inclusive após decisão `approved`

## Caso de exemplo

`After Forty` e `AF-001` continuam visíveis como projeto/card de exemplo para testar o Flux. Não são o domínio dos Gates e não recebem Gates específicos

## Contrato local e comandos reproduzíveis

```bash
cd "F:/Projetos/_FBR/FBR Agency Flux/09-codigo"
npm install
npm test
npm run typecheck
npm run lint
npm run build
npm run start -- -p 3010
curl -s http://localhost:3010/api/flux/gates
curl -s -X POST http://localhost:3010/api/flux/gates/FLUX-GATE-01/decision -H 'content-type: application/json' -d '{"decision":"approved","actor":"Sergio","scope":"local"}'
curl -s http://localhost:3010/api/flux/gates
```

O POST aceita apenas `approved`, `rejected` e `changes_requested`; exige actor `Sergio` e scope `local`; decisão duplicada falha fechado. O endpoint não chama adapter externo nem altera deploy, publicação, DNS, HopLink, oferta, gasto ou migration. O dashboard faz readback pelo snapshot após cada decisão e no reload

## Verificação

- Seed/persistência e contagem: `tests/gates.test.ts`
- Endpoint GET e POST, actor inválido e scope inválido: `tests/gates.test.ts`
- Decisão válida, decisão duplicada e readback: `tests/gates.test.ts`
- Ausência de efeito externo: `externalActionAuthorized === false` e evento `LOCAL DECISION / NO EXTERNAL EFFECT`
- Validação final: exatamente 4 Gates do `FBR Agency Flux`; `After Forty` aparece apenas como caso de exemplo
