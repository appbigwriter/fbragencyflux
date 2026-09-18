# FLUX-023 — Corrigir worker, wrapper e validação E2E local

## Status
ready

## Objetivo
Tornar o worker executável pelo entrypoint oficial, corrigir os blockers locais e deixar o E2E local reproduzível, sem habilitar scheduler ou dispatcher real.

## Escopo
- Corrigir `scripts/iris-worker.mjs`/dependência de `vite-node`.
- Recuperar `npm run worker:iris -- --once --dry-run`.
- Corrigir falhas locais diretamente relacionadas ao worker e seus contratos.
- Testar retry/idempotência e intake→triagem→job→handoff→blocker→readback.
- Separar falhas fora do escopo em relatório com owner e next check.

## Fora do escopo
Scheduler produtivo, cron, dispatcher outbound real, secrets, mensagens, deploy e publicação.

## Ownership de paths
`scripts/iris-worker.mjs`, entrypoint do worker e testes diretamente relacionados ao worker/E2E.

## Aceite
- [ ] Wrapper oficial executa dry-run com exit 0.
- [ ] Testes direcionados do worker/E2E passam.
- [ ] Idempotência e retry local têm evidência.
- [ ] Falhas restantes são classificadas com owner.
- [ ] Não há afirmação de dispatcher real ou monitoramento contínuo.
