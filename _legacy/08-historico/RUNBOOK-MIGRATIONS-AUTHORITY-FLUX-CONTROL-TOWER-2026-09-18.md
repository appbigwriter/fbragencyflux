# Runbook de Migrations — Authority / Agency Flux / Control Tower

## Status

`MAPEADO` | `não aplicar ainda`

Este documento lista as migrations necessárias para o fluxo global aprovado. Ele não autoriza execução remota. A aplicação exige Gate de Sergio, backup, confirmação do projeto Supabase, plano de rollback e readback.

## Regra principal

Não aplicar todos os arquivos encontrados indiscriminadamente. Existem migrations legadas, duas migrations com o número 010, duas com o número 011 e um rascunho 004 que não deve ser usado.

---

## 1. Authority Engine

### Existente

```text
F:/Projetos/_FBR/AuthorityEngine/04-database/001-custom-authorityengine-operational.sql
```

### Necessárias para o fluxo global — ainda precisam ser criadas/aprovadas

1. Persona e versões;
2. Character Bible;
3. Physical Identity Bible;
4. Visual Consistency Profile;
5. Editorial/Channel Plans;
6. Generation Jobs;
7. Generation Module Runs;
8. Blog Projects e relação Persona → vários blogs;
9. Blog Name Versions;
10. Domain Versions;
11. Approval Package/versions;
12. Outbox de eventos assinados;
13. Idempotência e retries do outbox.

**Não aplicar a migration 001 como se ela já implementasse o fluxo global.** Ela é a base operacional existente e ainda precisa ser reconciliada com as novas entidades.

---

## 2. Agency Flux — banco relacional

### Caminho canônico para banco novo ou ainda não migrado

Aplicar nesta ordem:

```text
1. F:/Projetos/_FBR/FBR Agency Flux/04-database/003_flux_relational_persistence.sql
2. F:/Projetos/_FBR/FBR Agency Flux/04-database/004_flux_relational_rpcs.sql
```

A migration `004_flux_relational_rpcs.sql` é a única 004 canônica.

Ela adiciona:

- Colunas ausentes do contrato relacional;
- `flux_runtime_revision`;
- RPC `flux_relational_read()`;
- RPC `flux_relational_commit()`;
- CAS;
- RLS tenant-scoped;
- Policies fail-closed;
- Índices;
- Triggers `updated_at`;
- Relaxamentos/checks necessários.

### Não aplicar

```text
F:/Projetos/_FBR/FBR Agency Flux/04-database/004_flux_runtime_relational.sql
```

Esse arquivo é rascunho legado e usa `FORCE ROW LEVEL SECURITY`, podendo quebrar as RPCs `SECURITY DEFINER`.

### Migration 001

```text
F:/Projetos/_FBR/FBR Agency Flux/04-database/001_flux_foundation.sql
```

É fundação legada. Não reaplicar em banco onde `003_flux_relational_persistence.sql` já foi aplicada. A migration 003 repete as tabelas-base defensivamente e é a base do caminho relacional atual.

### Migration 002

```text
F:/Projetos/_FBR/FBR Agency Flux/04-database/002_flux_state_version_cas.sql
```

Aplicar somente se o runtime legado `public.flux_state` continuar sendo utilizado e a tabela existir no mesmo banco. Ela não cria `flux_state`; apenas adiciona a coluna `version` e o constraint CAS.

Não aplicar como parte automática do caminho relacional 003 → 004 sem confirmar que o adapter legado ainda está ativo.

### Migrations novas ainda necessárias para o fluxo aprovado

Ainda precisam ser criadas e aprovadas migrations para:

```text
flux_inbox_events
flux_outbox_events
flux_event_deliveries
flux_readbacks
flux_approval_events completos
flux_approval_versions
flux_publication_approvals
flux_external_receipts
```

Essas migrations não existem ainda como pacote canônico aprovado. Não improvisar SQL remoto antes da entrega dos agentes e do Gate.

---

## 3. GestaoDB / Control Tower — catálogo central

### Base obrigatória

Usar como base canônica:

```text
F:/Projetos/_FBR/GestaoDB/supabase/migrations/control_tower_final_schema.sql
```

Ela cria/define:

- `organizations`;
- `templates`;
- `projects`;
- `provisioning_jobs`;
- `audit_logs`;
- Funções de criação de schemas;
- Função `provision_project()`;
- Templates blog/store/saas/custom.

### Complementos canônicos

Aplicar somente após confirmar o estado da base:

```text
006_control_tower_public_read.sql
007_control_tower_reconcile_core_columns.sql
008_control_tower_stats_rpc.sql
009_control_tower_project_sql_exec.sql
```

Resumo:

- `006`: policies/leitura autenticada inicial;
- `007`: reconciliação de colunas e FKs de jobs/auditoria;
- `008`: RPC `get_control_tower_stats()`;
- `009`: RPC administrativa de SQL no schema dedicado.

`009` exige revisão de segurança e escopo antes de exposição operacional.

### Migration 010 — duas responsabilidades diferentes

Existem dois arquivos numerados 010:

```text
010_complete_schema_provisioning.sql
010_service_identity_and_secrets.sql
```

Ambos são necessários para o Control Tower completo, mas a numeração precisa ser reconciliada antes de aplicação.

Ordem lógica:

```text
010A_complete_schema_provisioning.sql
010B_service_identity_and_secrets.sql
```

Não renomear/aplicar silenciosamente em produção. Criar uma decisão de versionamento ou renumerar formalmente uma das duas migrations.

`010_complete_schema_provisioning.sql` atualiza as funções de provisionamento dos schemas.

`010_service_identity_and_secrets.sql` cria:

- `service_identities`;
- `secret_namespaces`;
- `secret_bindings`;
- Triggers de `updated_at`.

### Migration de configuração do Control Tower

Necessária:

```text
011_project_configuration_artifacts.sql
```

Cria:

```text
public.project_configuration_artifacts
```

Usada pelos três artefatos:

- Variáveis públicas;
- Namespace;
- Domínio de validação.

### Migration 011 do estado legado do Flux

Arquivo diferente:

```text
011_flux_external_state.sql
```

Cria:

```text
public.flux_state
```

Ela só é necessária se o runtime legado baseado em snapshot `flux_state` continuar sendo usado. Não é parte da persistência relacional 003 → 004.

Como existe colisão de numeração, ela deve ser renumerada formalmente, por exemplo:

```text
012_flux_external_state.sql
```

ou ser mantida em um pacote explicitamente separado do Control Tower.

---

## 4. Ordem recomendada de aplicação

### 4.1 Primeiro: Authority Engine

Não aplicar ainda. Antes criar e aprovar as migrations de Persona, versões, identidade física, module runs e outbox.

### 4.2 Segundo: Agency Flux relacional

**Schema proprietário confirmado pelo runtime:** `custom_agencyflux`.

Todas as tabelas, funções, triggers, policies e índices operacionais do Flux devem ser criados/consultados em `custom_agencyflux`. O schema `public` permanece reservado ao catálogo e às entidades próprias do Control Tower.

Somente em banco novo ou após readback confirmar que 003 ainda não foi aplicada:

```text
003_flux_relational_persistence.sql
004_flux_relational_rpcs.sql
```

Se 003 já estiver aplicada no remoto:

```text
004_flux_relational_rpcs.sql
```

Não reaplicar 003.

### 4.3 Terceiro: Control Tower

Sequência lógica:

```text
control_tower_final_schema.sql
006_control_tower_public_read.sql
007_control_tower_reconcile_core_columns.sql
008_control_tower_stats_rpc.sql
009_control_tower_project_sql_exec.sql
010A_complete_schema_provisioning.sql
010B_service_identity_and_secrets.sql
011_project_configuration_artifacts.sql
```

A ordem real precisa ser confirmada pelo histórico de migrations aplicado no Supabase. Não executar somente pelo nome do arquivo.

### 4.4 Estado legado Flux

O snapshot legado, quando realmente necessário, também pertence a `custom_agencyflux`:

```text
012_flux_external_state.sql
002_flux_state_version_cas.sql
```

A ordem entre esses dois deve ser confirmada no banco correto, pois `002` pressupõe que `flux_state` já exista.

---

## 5. Migrations novas que devem ser produzidas antes do fluxo ficar completo

### Authority Engine

- Persona/versionamento;
- Physical Identity Bible;
- Visual Consistency;
- Module Runs;
- Blog projects;
- Domain/name versions;
- Approval package;
- Outbox.

### Agency Flux

- Inbox persistente;
- Outbox persistente;
- Event deliveries/retries;
- Readbacks/receipts;
- Approval events/versioning;
- Publication approval package.

### Control Tower

- Proteção da rota `/configuration` com autenticação/scopes;
- Reconciliação automática Flux → Control Tower;
- Readback de configuration artifacts;
- Eventual vínculo entre artifact e approval/job.

---

## 6. Pré-check obrigatório antes de Sergio aplicar

Para cada banco:

1. Confirmar projeto Supabase e ambiente corretos;
2. Fazer backup/export autorizado;
3. Consultar migrations/tabelas já aplicadas;
4. Confirmar se `003`, `004`, `010`, `011` já existem;
5. Resolver colisões de numeração;
6. Confirmar owner e schema alvo;
7. Validar SQL em banco limpo local;
8. Validar SQL em staging, se disponível;
9. Definir rollback;
10. Executar migration com receipt;
11. Fazer readback das tabelas, funções, policies e índices;
12. Reexecutar readback após restart/redeploy.

## 7. Resumo executivo para aplicação

### Pode ser aplicado somente após Gate e confirmação de estado

```text
Agency Flux: 003 → 004 canônica
Control Tower: base → 006 → 007 → 008 → 009 → 010A → 010B → 011_project_configuration_artifacts
```

### Condicional

```text
001 Flux: somente banco legado/fresco compatível
002 Flux: somente se flux_state legado estiver ativo
011_flux_external_state: somente se flux_state legado for mantido; renumerar
```

### Não aplicar

```text
004_flux_runtime_relational.sql
```

### Ainda não existem como pacote final

```text
Authority Persona migrations
Agency Flux inbox/outbox/readback migrations
Approval versioning/publication package migrations
```

**Conclusão:** você não deve aplicar “todas” as migrations encontradas. A aplicação segura exige escolher a trilha correta, resolver as colisões 010/011 e aguardar as migrations novas do fluxo global. Este runbook está mapeado, mas ainda não é autorização de execução remota.
