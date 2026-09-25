# Diagnóstico — dados visíveis após reset remoto

**Data:** 2026-09-17  
**Tarefa:** FLUX-011  
**Projeto:** FBR Agency Flux

## Causa confirmada

O reset remoto foi confirmado pelo endpoint público de snapshot:

- projeto: 1
- cards: 2
- Jobs: 2 planejados
- Handoffs: 0
- blockers: 0
- eventos: 0
- gates: 0
- version: 2

O Dashboard também refletia esse baseline. Porém, as páginas `/jobs` e `/handoffs` continuavam exibindo dados antigos porque usavam:

```ts
getSnapshot()
```

Esse caminho lia o estado local/histórico do runtime, sem escopo público remoto.

## Correção aplicada localmente

As páginas foram alteradas para usar:

```ts
getScopedSnapshot({ scopes, visibility: 'public' })
```

com `publicReadScope()` e fallback controlado de erro.

Arquivos:

- `09-codigo/src/app/jobs/page.tsx`
- `09-codigo/src/app/handoffs/page.tsx`
- `09-codigo/src/app/page.tsx` — correção anterior do Dashboard

## Validação local

- `npm test`: 23 arquivos / 120 testes aprovados;
- `npm run typecheck`: aprovado;
- `npm run lint`: aprovado;
- `npm run build`: aprovado.

## Verificação do runtime local Supabase

A configuração `.env.local` declara `FLUX_PERSISTENCE=supabase` e `FLUX_STATE_KEY=fbr-agency-flux`. Uma instância limpa sem sobrescrever essas variáveis foi iniciada na porta 3030. Dashboard, Jobs e Handoffs retornaram a mensagem controlada `Agency Flux indisponível — Não foi possível ler o estado persistido`, confirmando que o runtime local não está conseguindo ler o Supabase configurado.

A instância QA que exibia dados foi iniciada explicitamente com `FLUX_PERSISTENCE=json` e `FLUX_DATA_FILE` temporário; portanto, aqueles dados não representavam o estado remoto.

## Diagnóstico upstream confirmado

Consulta direta ao endpoint REST configurado, usando a credencial somente em memória e sem registrar o valor, retornou:

```text
HTTP 401 Unauthorized
{"message":"Unauthorized","request_id":"e3cdc71ad824e913e3a8c805da9d6912"}
```

A aplicação estava correta ao mascarar esse detalhe na interface. A causa do `Agency Flux indisponível` é a credencial local rejeitada pelo gateway Supabase remoto — potencialmente expirada, de projeto diferente, revogada ou sem autorização. Não é falha do reset remoto nem motivo para fallback silencioso a JSON.

## Próximo desbloqueio

Théo/Sergio devem atualizar a referência segura da service role local a partir do Secret Manager/runtime autorizado, sem colar o valor no chat, Git ou `.env.local` versionado. Depois repetir o readback com `state_key=fbr-agency-flux` e confirmar `HTTP 200`, `version` inteira e Dashboard/Jobs/Handoffs coerentes.

## Conclusão

Os dados antigos não estavam no estado remoto resetado. Eles permaneciam visíveis porque duas páginas públicas ignoravam o adapter remoto e carregavam o estado local/histórico. A divergência só será encerrada para o usuário após publicar esta correção e verificar novamente Dashboard, Jobs e Handoffs no domínio público.
