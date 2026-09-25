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

## Por que podia funcionar antes sem mudança no `.env.local`

A verificação local mostrou que `.env.local` não tem diff no Git, não é versionado e tem última alteração em `2026-09-16 06:33:34 -03:00`. Isso prova apenas que o arquivo local não foi alterado; não prova que o segredo ou a política do serviço remoto permaneceu válida.

Há três contextos diferentes nos registros:

1. O reset foi executado no runtime remoto Easypanel, que pode possuir uma referência de secret diferente da `.env.local`.
2. O QA local que exibiu dados foi executado explicitamente com `FLUX_PERSISTENCE=json` e um arquivo temporário, não contra o Supabase.
3. O runtime atual está explicitamente em `FLUX_PERSISTENCE=supabase` e recebe `HTTP 401` do gateway.

Logo, o cenário mais consistente é: o arquivo local permaneceu igual, mas a credencial foi rotacionada, revogada, expirou, pertence a outro projeto, ou o runtime remoto/autorizado usa outra referência. Também é possível que o “funcionando antes” tenha sido o modo JSON/QA ou o readback público, que não testa a mesma autenticação do adapter Supabase.


Théo/Sergio devem atualizar a referência segura da service role no Secret Manager/runtime autorizado, sem enviar o valor no chat, Git ou `.env.local` versionado. Depois David deve reiniciar o runtime e repetir o readback, esperando HTTP 200 e `version` coerente.

Nenhuma rotação, alteração Supabase, migration ou deploy foi executada nesta sessão.
