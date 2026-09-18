# FLUX-022 — Corrigir persistência relacional e isolamento das APIs

## Status
ready

## Objetivo
Corrigir os gaps locais identificados na persistência relacional do Agency Flux e recuperar typecheck/build sem executar migration remota.

## Escopo
- Alinhar/remover o teste legado `SupabaseFluxRepository` conforme contrato atual.
- Aplicar `readScopeFromRequest` nas APIs GET de Jobs e Handoffs.
- Escolher e documentar uma migration 004 canônica, sem aplicação remota.
- Atualizar smoke script para as RPCs relacionais atuais.
- Criar testes de isolamento e readback local.

## Fora do escopo
Secrets, migration remota, deploy e produção.

## Ownership de paths
`09-codigo/src/app/api/flux/jobs`, `09-codigo/src/app/api/flux/handoffs`, testes relacionados, scripts de smoke e documentação da migration 004.

## Aceite
- [ ] `npm run typecheck` passa.
- [ ] `npm run lint` passa sem novo warning relevante.
- [ ] APIs Jobs/Handoffs respeitam escopo/autenticação.
- [ ] Existe uma fonte canônica documentada para migration 004.
- [ ] Testes direcionados passam e não alegam readback remoto.
