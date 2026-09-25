# Relatório de falha operacional — Auditoria, migrations e schema do Flux

- **Data:** 2026-09-18
- **Owner:** David
- **Projeto:** Authority Engine / FBR Agency Flux / GestaoDB-Control Tower / FBR Blogs
- **Status:** retrospectiva registrada; correções locais e parte da reconciliação remota verificadas; E2E e smoke público ainda pendentes

## 1. Resumo executivo

Esta foi a pior execução da parceria até aqui porque eu tratei evidência local como se fosse evidência do banco remoto, recomendei migrations antes de conhecer o estado real do banco e usei nomes de tabelas/schema sem confirmação suficiente.

O erro mais grave foi arquitetural: a migration original do Flux criava objetos no `public`, misturando-os com o Control Tower. Depois, durante a correção, eu ainda afirmei que não havia `public.flux_*` sem ter readback remoto. O usuário encontrou mais de 50 tabelas Flux no `public` e algumas no schema já provisionado `custom_agencyflux`.

A situação foi corrigida operacionalmente durante a sessão:

- tabelas `public.flux_*` foram movidas para `custom_agencyflux`;
- `flux_runtime_revision` e `flux_state` foram preservadas com seus dados;
- funções Flux foram movidas para `custom_agencyflux`;
- RPCs ficaram com `SECURITY DEFINER` e `search_path` controlado;
- RLS e policies tenant-scoped foram verificados;
- grants de tabelas e RPCs para `anon`/`authenticated` foram revogados;
- `flux_relational_read()` foi ampliada para retornar todas as tabelas relacionais;
- readback final retornou `version=47` e todas as collections relacionais esperadas.

## 2. O que deu errado

### 2.1 Falha de pré-requisito

Eu deveria ter começado pelo inventário remoto de schemas, tabelas, funções, grants, RLS, policies e migrations aplicadas. Em vez disso, comecei lendo o código local e derivei o estado do banco a partir das migrations.

**Causa:** tratei o código local como fonte de verdade do estado remoto.

**Impacto:** recomendei comandos com nomes assumidos (`flux_projects`) e uma estratégia de criação/migration que não correspondia ao banco já provisionado.

### 2.2 Erro de ownership de schema

A migration original usava tabelas Flux no `public`. A migration `004` também qualificava objetos como `public.flux_*`.

**Causa:** não conferi o ownership do schema do Flux contra a arquitetura do Control Tower antes de aceitar a migration.

**Impacto:** mistura entre catálogo central do Control Tower e estado operacional do Agency Flux.

**Correção:** o Flux passou a usar o schema provisionado real:

```text
custom_agencyflux
```

### 2.3 Confusão entre arquivos lógicos e arquivos reais

Eu apresentei `010A`, `010B` e `012 consolidada` como se fossem arquivos existentes.

Na realidade:

- existem dois arquivos `010_*` separados;
- existem três arquivos `012_*` conflitantes;
- não existe uma migration `012 consolidada` pronta.

**Impacto:** a instrução de aplicação ficou ambígua e poderia induzir execução incorreta.

### 2.4 Falha ao distinguir migration nova de reconciliação

Eu corrigi as migrations locais para `custom_agencyflux`, mas isso não moveu automaticamente objetos já existentes em `public`.

**Impacto:** o banco remoto continuou misturado até o usuário executar a movimentação dinâmica das tabelas.

A correção necessária não era apenas criar novas tabelas; era reconciliar objetos existentes:

```text
public.flux_* → custom_agencyflux.flux_*
```

preservando dados e tratando as exceções:

- `flux_runtime_revision` com uma linha CAS;
- `flux_state` com snapshot legado.

### 2.5 RPC incompleta

O primeiro readback de `flux_relational_read()` retornava apenas as entidades principais, apesar de existirem dezenas de tabelas relacionais auxiliares.

**Correção:** a RPC foi ampliada para retornar todas as collections relacionais, mantendo `flux_state` fora da projeção relacional principal por ser legado.

### 2.6 Grants perigosos

O readback revelou que `anon` e `authenticated` tinham `EXECUTE` nas RPCs e grants completos nas tabelas Flux:

```text
SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
```

**Correção aplicada:**

- revogado acesso de `anon` e `authenticated` ao schema;
- revogados grants de tabela;
- revogado `EXECUTE` das RPCs;
- mantido `USAGE` de schema e `EXECUTE` das RPCs para `service_role`.

## 3. Evidências finais obtidas

### Banco remoto

- Todas as tabelas `flux_*` aparecem em `custom_agencyflux`.
- Nenhuma tabela `public.flux_*` permaneceu no readback fornecido.
- `flux_runtime_revision` e `flux_state` foram preservadas no schema correto.
- RLS está habilitado nas tabelas Flux.
- Policies `flux_tenant_isolation` estão presentes.
- Funções Flux estão em `custom_agencyflux`.
- `flux_relational_read()` retorna todas as collections relacionais.
- Versão retornada: `47`.
- `anon` e `authenticated` não têm mais USAGE no schema.
- `anon` e `authenticated` não têm grants de tabela.
- RPCs estão executáveis por `service_role`, `postgres` e `supabase_admin`.

### Verificações locais

- Testes de ownership/adapters: 12/12 PASS.
- Typecheck Flux: PASS.
- Build Flux: PASS.
- Busca local não encontrou `custom_flux` remanescente.
- Nenhum segredo foi solicitado ou registrado no chat.

## 4. O que ainda não está comprovado

- Smoke HTTP autenticado do PostgREST usando `service_role` e `Accept-Profile: custom_agencyflux`.
- Versão efetivamente servida pelo deploy público após a correção do banco.
- Restart/redeploy e readback posterior.
- Suíte completa do Flux: execuções anteriores mantiveram falhas de cleanup/fixture e testes PostgreSQL contra banco sem schema migrado.
- E2E Authority → Flux → Control Tower → Blogs.
- Persistência remota real do Authority e do Blogs.

## 5. Soluções aplicadas

1. Corrigir migrations Flux para `custom_agencyflux`.
2. Colocar `004_flux_runtime_relational.sql` legado em quarentena.
3. Corrigir adapters PostgreSQL e PostgREST.
4. Configurar `Accept-Profile`/`Content-Profile` para `custom_agencyflux`.
5. Criar teste de ownership de schema.
6. Mover tabelas públicas vazias e exceções com dados preservados.
7. Mover funções Flux para o schema correto.
8. Recriar RPCs com `SECURITY DEFINER` e `search_path` restrito.
9. Revogar grants de tabelas/RPCs para `anon` e `authenticated`.
10. Completar o readback relacional.

## 6. O que Sergio pode fazer para tornar David mais assertivo

Sergio não deveria precisar compensar erros básicos do agente, mas estes gates reduzem o risco operacional:

### Antes de qualquer migration

Fornecer ou exigir esta saída do banco:

```text
schemas
public tables
Flux tables por schema
functions/RPCs
RLS
policies
grants
migration history
```

### Exigir formato de resposta

Para qualquer decisão de banco, exigir sempre:

```text
FATO REMOTO
FATO LOCAL
HIPÓTESE
AÇÃO PROPOSTA
RISCO
ROLLBACK
READBACK
```

### Proibir inferência

Regras úteis:

- não aceitar nomes de tabela que não vieram de `information_schema`/`pg_catalog`;
- não aceitar “migration pronta” sem schema, ordem e estado aplicado;
- não aceitar “RLS configurado” sem readback de `relrowsecurity`, policies e grants;
- não aceitar “RPC protegida” sem readback de `prosecdef`, `proconfig` e privilégios;
- não aceitar build verde como prova de banco ou deploy;
- não aplicar migration quando houver colisão de numeração sem registry explícito;
- exigir stop imediato quando o estado remoto divergir do local.

### Melhor forma de dar acesso

Não enviar secrets no chat. O caminho correto é um runtime/terminal autorizado com:

```text
DATABASE_URL
```

ou uma sessão autenticada do Supabase CLI. A role deve ter permissão para migration/readback e ser removida ou desabilitada depois.

## 7. Aprendizado operacional

A regra permanente passa a ser:

> O código local define intenção; somente o readback remoto define o estado do banco.

E:

> Antes de criar, mover ou alterar qualquer tabela, listar objetos reais por schema e abortar se houver divergência não classificada.

## 8. Próximo passo ao retomar

1. Executar smoke read-only autenticado no PostgREST.
2. Confirmar versão/commit servido no Flux.
3. Fazer restart/redeploy controlado e repetir readback.
4. Retomar E2E começando pelo Authority.

Este relatório não declara os quatro projetos encerrados.
