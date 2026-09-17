# Diagnóstico — Agency Flux indisponível no runtime local

**Data:** 2026-09-17  
**Projeto:** FBR Agency Flux  
**Execução:** `F:/Projetos/_FBR/FBR Agency Flux/09-codigo`  
**Tarefa:** FLUX-015

## Resultado

A aplicação está ativa em `http://127.0.0.1:3016/`, mas a leitura persistida falha porque o endpoint remoto Supabase rejeita a credencial configurada.

- `FLUX_PERSISTENCE`: `supabase`
- `FLUX_STATE_KEY`: `fbr-agency-flux`
- Host remoto configurado: `supabase-control-tower-api.fbr.news`
- Endpoint testado: `/rest/v1/flux_state?state_key=eq.fbr-agency-flux&select=state,version`
- Resultado direto, sem registrar a credencial: **HTTP 401 Unauthorized**
- Corpo do erro não foi armazenado nem exposto.

## Classificação

- **Servidor local:** disponível; Home responde HTTP 200.
- **Conectividade/DNS/rota:** alcançados; o gateway respondeu.
- **Schema:** não é possível validá-lo enquanto a autenticação falhar.
- **Autorização/autenticação:** bloqueador confirmado; a service role local é rejeitada pelo gateway remoto.
- **Fallback JSON:** não deve ser ativado; o runtime está corretamente falhando fechado.

## Próxima ação requerida

Théo/Sergio devem atualizar a referência segura da service role no Secret Manager/runtime autorizado, sem enviar o valor no chat, Git ou `.env.local` versionado. Depois David deve reiniciar o runtime e repetir o readback, esperando HTTP 200 e `version` coerente.

Nenhuma rotação, alteração Supabase, migration ou deploy foi executada nesta sessão.
