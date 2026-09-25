# Migration 004 canônica — FLUX-022

Fonte canônica: `04-database/004_flux_relational_rpcs.sql`.

Status local: escolhida e documentada; **não aplicada em remoto** nesta entrega.

## Decisão

- `004_flux_relational_rpcs.sql` é a migration 004 canônica para fechar o contrato relacional atual.
- `004_flux_runtime_relational.sql` é rascunho legado e não deve ser usado como fonte de aplicação.
- Ordem esperada: `003_flux_relational_persistence.sql` → `004_flux_relational_rpcs.sql`.

## Motivo

A canônica contém as RPCs consumidas pelo runtime atual:

- `flux_relational_read()`
- `flux_relational_commit(expected_version, changes, waiting_reasons)`

Ela também documenta o contrato de que JSONB é apenas transporte de RPC/local variable, nunca coluna persistida.

## Guardrails

- Não aplicar sem Gate/backup/readback remoto autorizado.
- Não reexecutar `003` no remoto já migrado.
- Não declarar readback remoto a partir desta entrega local.
- Smoke atual deve chamar `/rest/v1/rpc/flux_relational_read` e, apenas com `--write-test`, `/rest/v1/rpc/flux_relational_commit`.
