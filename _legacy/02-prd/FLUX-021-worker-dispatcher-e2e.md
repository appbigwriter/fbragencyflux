# FLUX-021 — Worker contínuo, dispatcher e E2E operacional

## Status
ready

## Projeto
FBR Agency Flux — `F:/Projetos/_FBR/FBR Agency Flux`

## Objetivo
Fechar tecnicamente o plano para transformar o worker `--once` em operação periódica observável e validar o E2E do Flux sem alegar dispatcher outbound ou monitoramento contínuo antes de haver evidência.

## Escopo
- Auditar `scripts/iris-worker.mjs`, endpoints, heartbeat, eventos, Handoffs e receipts.
- Definir configuração de scheduler/worker periódico e comportamento de retry/idempotência.
- Criar ou ampliar testes locais/fakes para intake → triagem → job → handoff → blocker → readback.
- Documentar contrato mínimo do dispatcher outbound Hermes e os pontos que permanecem bloqueados.

## Fora do escopo
- Não enviar mensagens reais.
- Não alterar produção, cron ou secrets.
- Não publicar o caso After Forty.

## Ownership de paths
- Preferir relatório em `08-historico/` e testes dedicados.
- Alterações no worker devem ser pequenas, testadas e listadas no handoff.

## Entregáveis
- `08-historico/FLUX-021-worker-dispatcher-e2e.md`
- Testes/roteiro E2E executados.
- Contrato outbound proposto, com blockers e Gate aplicável.
- Handoff padrão.

## Aceite
- [ ] Estados e transições do worker têm evidência.
- [ ] Toda espera tem owner, ação e next check.
- [ ] Idempotência e retry estão testados localmente.
- [ ] Dispatcher outbound não é declarado pronto sem receipt/readback real.
