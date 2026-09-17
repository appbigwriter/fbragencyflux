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

## Estado atual

**Código local:** corrigido para usar Supabase remoto nas três superfícies.  
**Ambiente público:** ainda não contém essa correção; deploy e readback público continuam pendentes.  
**Reset remoto:** confirmado e preservado no baseline autorizado.

## Conclusão

Os dados antigos não estavam no estado remoto resetado. Eles permaneciam visíveis porque duas páginas públicas ignoravam o adapter remoto e carregavam o estado local/histórico. A divergência só será encerrada para o usuário após publicar esta correção e verificar novamente Dashboard, Jobs e Handoffs no domínio público.
