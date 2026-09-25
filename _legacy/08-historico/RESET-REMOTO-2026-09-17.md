# Reset remoto do Agency Flux — receipt

**Data:** 2026-09-17  
**Alvo autorizado:** somente o estado operacional `state_key=fbr-agency-flux` no Supabase remoto.  
**Preservado:** schema, migrations, código, PRDs, histórico do projeto e demais projetos.  
**Método:** comando remoto documentado no runtime Easypanel:

```text
node scripts/seed-flux-state.mjs --confirm-seed --force-replace
```

## Readback remoto

Endpoint público de snapshot lido após a operação, com escopo explícito `fbr-news/after-forty`:

- `version`: 2
- projetos: 1 (`after-forty` / After Forty)
- cards: 2
- Jobs: 2, ambos planejados
- Handoffs: 0
- blockers: 0
- eventos: 0
- gates: 0
- approvals pendentes: 0
- artifacts: 0
- required actions: 0
- Sprints: 0
- Stories: 0

## Resultado

**Reset remoto confirmado por readback do snapshot.** O estado operacional voltou ao baseline inicial do projeto After Forty. A operação não alterou schema, migration, código, histórico ou outros projetos.

## Limitações

- O endpoint público de snapshot refletiu o reset confirmado.
- A Home pública ainda exibiu a versão visual anterior durante a checagem, indicando divergência de deploy/cache; isso é separado do estado remoto e continua pendente.
- Não foram expostos URL completa, headers, service role ou qualquer secret neste receipt.
