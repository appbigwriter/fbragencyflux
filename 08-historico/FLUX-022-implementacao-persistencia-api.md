# FLUX-022 — Implementação persistência/API

Data/hora local: 2026-09-18 00:54:40 ESAST
Escopo: execução local em `09-codigo`; sem migration remota, deploy, rotação de secrets ou readback remoto.

## Implementado

- Corrigido teste legado que importava `SupabaseFluxRepository` para o contrato atual `SupabaseRestTransport` + RPCs relacionais:
  - `flux_relational_read`
  - `flux_relational_commit`
- Aplicado `readScopeFromRequest` nas APIs GET:
  - `src/app/api/flux/jobs/route.ts`
  - `src/app/api/flux/handoffs/route.ts`
- Jobs/Handoffs GET agora:
  - exigem escopo explícito `tenantId/projectId` ou `readScope`;
  - exigem sessão para leitura privada;
  - filtram via `getScopedSnapshot` antes de devolver dados.
- Escolhida/documentada a migration 004 canônica:
  - canônica: `04-database/004_flux_relational_rpcs.sql`
  - documentação: `04-database/004-CANONICA.md`
  - rascunho legado `004_flux_runtime_relational.sql` documentado como não-canônico.
- Smoke Supabase atualizado para RPCs relacionais atuais:
  - leitura: `/rest/v1/rpc/flux_relational_read`
  - escrita opcional `--write-test`: `/rest/v1/rpc/flux_relational_commit`
  - não usa mais REST `flux_state` legado.
- Testes locais adicionados/ajustados para isolamento e readback local:
  - Jobs/Handoffs não vazam outro tenant/projeto.
  - Jobs private sem sessão falha 401.
  - Cards public exige allowlist explícita com tenant.
  - Testes relacionais usam `004_flux_relational_rpcs.sql` canônica.

## Arquivos alterados/criados nesta entrega

- `09-codigo/src/app/api/flux/jobs/route.ts`
- `09-codigo/src/app/api/flux/handoffs/route.ts`
- `09-codigo/tests/external-adapters.test.ts`
- `09-codigo/tests/remaining-local-qa.test.ts`
- `09-codigo/tests/relational-persistence.test.ts`
- `09-codigo/tests/build-relational-migration.mjs`
- `09-codigo/scripts/supabase-persistence-smoke.mjs`
- `04-database/004-CANONICA.md`
- `08-historico/FLUX-022-implementacao-persistencia-api.md`

## Evidência executada

Diretório: `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`

| Comando | Resultado |
|---|---|
| `npm test -- tests/external-adapters.test.ts tests/remaining-local-qa.test.ts tests/relational-persistence.test.ts tests/relational-rpcs-004.test.ts tests/multi-project-read-scope.test.ts` | PASS — 5 arquivos, 40 testes passados |
| `npm run typecheck` | PASS — `tsc --noEmit` exit 0 |
| `npm run lint` | PASS — exit 0; 1 warning existente em `src/app/layout.tsx` sobre `<a>` vs `next/link` |
| `node scripts/supabase-persistence-smoke.mjs` sem secrets | FAIL CLOSED esperado — exit 2, pede `FLUX_SUPABASE_URL` e service role via Environment/Secrets |

## Blockers / limites

- **Sem readback remoto declarado.** O smoke não foi executado contra Supabase remoto porque secrets/execução remota estão fora do escopo de FLUX-022.
- **Migration 004 não aplicada remotamente.** Exige Gate/backup/readback remoto autorizado antes de qualquer aplicação.
- `npm run lint` ainda mostra warning pré-existente em `src/app/layout.tsx`; não bloqueia FLUX-022 porque o comando retorna 0 e o arquivo não pertence ao escopo desta entrega.
- Working tree já continha alterações de outro track/worker antes/durante esta execução (`scripts/iris-worker.mjs`, `src/lib/iris-worker.ts`, testes worker, package files, data). Não foram usadas como evidência desta entrega.
