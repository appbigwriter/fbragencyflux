# Readback — servidor local após “Server not found”

**Data:** 2026-09-17  
**Projeto:** FBR Agency Flux  
**Execução:** `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`  
**Comando:** `npm run dev -- --hostname 127.0.0.1 --port 3016`

## Resultado verificado

- Processo Next iniciado em background.
- Porta `127.0.0.1:3016` em estado `LISTENING`.
- `GET http://127.0.0.1:3016/` retornou `HTTP 200`.
- HTML retornado contém `Agency Flux`.
- `GET /api/flux/snapshot?scope=public&tenantId=public-tenant&projectId=after-forty` retornou `HTTP 403` com `PUBLIC_SCOPE_UNDEFINED`.

## Classificação

- **Resolvido:** ausência do servidor local; a aplicação está acessível em `http://127.0.0.1:3016/`.
- **Não resolvido e já conhecido:** leitura pública desse escopo/persistência. Isso permanece coberto por FLUX-012/FLUX-011 e não deve ser mascarado como falha de servidor.
- **Não executado:** deploy público, alteração Supabase, rotação de secret ou migration.
