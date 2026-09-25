# Mudanças necessárias — Módulo de Secrets e IAM

## Status

`APROVADO PARA IMPLEMENTAÇÃO`

## Objetivo

Transformar o Control Tower em broker seguro de Service Identities, namespaces e referências de secrets para o FBR Agency Flux e os demais projetos da FBR Agency

A implementação deve permitir provisionamento automático sem entregar a chave mestre do Control Tower aos novos sistemas ou aos Gestores Editoriais

## Escopo

- IAM de agentes e serviços
- emissão, validação, expiração e revogação de tokens
- namespaces isolados de secrets
- bindings por referência
- adapters de providers
- integração com Easypanel
- auditoria e Zero Secret Leaks
- bootstrap seguro da primeira Service Identity
- testes automatizados e E2E sanitizados

## 1. Modelo de dados

Criar uma migration versionada, sem editar migrations históricas:

```text
supabase/migrations/010_service_identity_and_secrets.sql
```

### 1.1 Service Identities

```sql
create table if not exists public.service_identities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  namespace text not null,
  identity_type text not null check (identity_type in ('agent', 'service', 'admin')),
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked', 'expired')),
  issuer text not null,
  audience text not null,
  key_id text not null,
  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Regras:

- não armazenar token JWT
- armazenar somente metadados, hash ou fingerprint não reversível quando necessário
- `name` e `namespace` devem ser únicos
- identidade revogada nunca pode autenticar novamente
- identidades administrativas não devem ser criadas por chamadas de agents comuns

### 1.2 Secret Namespaces

```sql
create table if not exists public.secret_namespaces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete restrict,
  namespace text not null unique,
  provider text not null,
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Regras:

- namespaces de serviço podem ter `project_id` nulo apenas quando o contrato permitir explicitamente
- namespaces de projetos devem sempre apontar para um `project_id` válido
- exclusão de projeto não deve apagar silenciosamente os registros de auditoria
- o namespace deve ser imutável após criação

### 1.3 Secret Bindings

```sql
create table if not exists public.secret_bindings (
  id uuid primary key default gen_random_uuid(),
  namespace_id uuid not null references public.secret_namespaces(id) on delete restrict,
  key_name text not null,
  secret_ref text not null,
  provider text not null,
  version integer not null default 1,
  status text not null default 'active' check (status in ('active', 'pending', 'revoked', 'failed')),
  last_validated_at timestamptz,
  revoked_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(namespace_id, key_name, version)
);
```

Regras:

- nunca armazenar o valor real do secret
- nunca retornar o valor real em JSON
- nunca enviar o valor real para filas, logs, traces ou handoffs
- `secret_ref` deve identificar o provider e o namespace
- rotação cria nova versão antes de revogar a anterior

## 2. Bootstrap administrativo

A primeira Service Identity não pode ser criada por uma identidade que ainda não existe

Implementar um único fluxo de bootstrap:

1. administrador autentica no Control Tower
2. acessa operação protegida de bootstrap
3. cria `fbr-agency-flux-service`
4. define scopes aprovados
5. o Control Tower assina o JWT usando a chave mestre exclusivamente server-side
6. o token é exibido ou entregue uma única vez por canal seguro
7. o valor é armazenado no Secret Manager
8. o Control Tower registra somente metadados e fingerprint
9. chamadas futuras usam a Service Identity do Flux
10. o bootstrap é desabilitado após a primeira identidade ativa

O bootstrap deve possuir:

- feature flag explícita
- validade temporária
- auditoria
- proteção contra replay
- bloqueio após uso
- aprovação administrativa
- nenhuma credencial em logs

## 3. JWT e autenticação

A função `isValidAgentApiKey` deve aceitar apenas tokens válidos e não apenas decodificados

Validar obrigatoriamente:

- assinatura criptográfica
- algoritmo permitido
- `iss`
- `aud`
- `sub`
- `exp`
- `iat`
- `jti`, quando utilizado
- status da identidade
- revogação
- scopes exigidos pela rota

Rejeitar:

- token expirado
- token sem assinatura válida
- issuer desconhecido
- audience incorreta
- identidade suspensa ou revogada
- escopo ausente
- algoritmo inesperado

Headers aceitos:

```http
Authorization: Bearer <CONTROL_TOWER_AGENT_API_KEY>
```

O header `x-api-key` pode permanecer apenas por compatibilidade controlada e deve aplicar a mesma validação de identidade e scopes

## 4. Scopes da Service Identity do Flux

A identidade `fbr-agency-flux-service` deve receber inicialmente:

```text
projects:read
projects:provision
projects:sql:execute
secrets:namespaces:create
secrets:bindings:write
health:read
handoffs:read
```

Não conceder inicialmente:

```text
projects:delete
projects:rebuild
secrets:values:read
identities:admin
users:admin
```

Scopes destrutivos só podem ser adicionados por decisão administrativa formal

## 5. Endpoints

### Criar Service Identity

```http
POST /api/control-tower/identities
Authorization: Bearer <admin-token>
Content-Type: application/json
```

Payload:

```json
{
  "name": "fbr-agency-flux-service",
  "namespace": "fbr/services/agency-flux/",
  "identity_type": "service",
  "scopes": [
    "projects:read",
    "projects:provision",
    "projects:sql:execute",
    "secrets:namespaces:create",
    "secrets:bindings:write",
    "health:read",
    "handoffs:read"
  ],
  "audience": "fbr-agency-flux"
}
```

Resposta: retornar somente o token pela operação segura de bootstrap ou um `secret_ref`, conforme o provider configurado. Nunca registrar o token em logs

### Criar namespace

```http
POST /api/control-tower/secrets/namespaces
Authorization: Bearer <CONTROL_TOWER_AGENT_API_KEY>
```

Payload:

```json
{
  "project_id": "<PROJECT_ID>",
  "namespace": "fbr/saas/<PROJECT_ID>/",
  "provider": "easypanel"
}
```

A operação deve ser idempotente

### Criar binding

```http
POST /api/control-tower/secrets/bindings
Authorization: Bearer <CONTROL_TOWER_AGENT_API_KEY>
```

Payload seguro:

```json
{
  "namespace": "fbr/saas/<PROJECT_ID>/",
  "key_name": "SUPABASE_SERVICE_ROLE_KEY",
  "secret_ref": "<provider-ref>",
  "provider": "easypanel",
  "version": 1
}
```

A API não deve aceitar valor plaintext como caminho normal. Caso um provider exija ingestão inicial do valor, usar canal administrativo separado, sem persistência, sem fila, sem logging e com redaction obrigatório

### Rotação

```http
POST /api/control-tower/secrets/bindings/<id>/rotate
Authorization: Bearer <operator-token>
```

Sequência:

```text
criar versão nova
→ injetar no provider
→ reiniciar serviço
→ executar health check
→ validar runtime
→ marcar nova versão active
→ revogar versão antiga
```

### Revogação

```http
POST /api/control-tower/secrets/bindings/<id>/revoke
Authorization: Bearer <operator-token>
```

A resposta deve conter apenas receipt sanitizado

## 6. Contrato `SecretsProvider`

Criar interface provider-neutral:

```ts
interface SecretsProvider {
  createService(input: CreateServiceInput): Promise<ServiceReceipt>
  bindSecret(input: BindSecretInput): Promise<BindingReceipt>
  rotateSecret(input: RotateSecretInput): Promise<RotationReceipt>
  revokeSecret(input: RevokeSecretInput): Promise<RevokeReceipt>
  restartService(input: RestartServiceInput): Promise<ServiceReceipt>
  readServiceStatus(input: ReadServiceStatusInput): Promise<ServiceStatusReceipt>
}
```

Implementações previstas:

- `EasypanelSecretsProvider`
- `LocalSecretsProvider` apenas para desenvolvimento
- futuro `AwsSecretsProvider`
- futuro `DopplerSecretsProvider`

Requisitos de todo provider:

- timeout
- retry limitado
- idempotência
- erro sanitizado
- correlation ID
- receipt sem secret
- health check
- fail-closed quando faltar configuração

## 7. Easypanel

O adapter do Easypanel deve editar o Environment do serviço do novo projeto, não o Gestor Editorial e não o Control Tower

Fluxo:

```text
FBR Agency Flux
→ Control Tower cria projeto
→ adapter cria/localiza serviço no Easypanel
→ adapter vincula secret_ref
→ adapter reinicia serviço
→ adapter lê status
→ FBR Agency Flux registra evidência
```

A implementação não deve presumir endpoints da API Easypanel. O contrato real precisa definir:

- autenticação
- criação/localização de projeto
- criação de serviço
- alteração de Environment
- associação de secret
- restart/redeploy
- leitura de status
- rollback

Até o contrato ser confirmado, o provider deve permanecer fail-closed e não utilizar chamadas inventadas

## 8. RLS e autorização

As três tabelas são centrais e exigem proteção administrativa

Implementar:

- RLS habilitado
- nenhuma policy pública permissiva
- policies para Control Tower server-side
- autorização por scope
- bloqueio de leitura de valores
- auditoria de criação, alteração, rotação e revogação
- isolamento por namespace
- proteção contra alteração do namespace

A Service Identity do FBR Agency Flux deve ler e alterar apenas os recursos necessários ao seu escopo

## 9. Auditoria

Cada operação deve registrar:

```text
correlation_id
actor
identity_id
operation
resource_type
resource_id
scope_used
provider
version
status
timestamp
error_sanitized
```

Nunca registrar:

```text
secret_value
JWT completo
service role key
senha
CVC
token de recuperação
```

## 10. Zero Secret Leaks

Adicionar testes que falhem se valores sensíveis aparecerem em:

- resposta JSON
- logs
- receipts
- filas
- arquivos temporários
- snapshots
- mensagens de erro
- documentação
- Git
- bundle frontend

Handoffs devem conter apenas:

```text
secret_ref
namespace
provider
version
status
```

## 11. Testes

### Unitários

- criação idempotente de identidade
- validação completa de JWT
- expiração
- revogação
- scopes
- namespace imutável
- binding sem plaintext
- rotação de versão
- fail-closed do provider
- redaction de logs

### Integração

- migration em banco de teste
- RLS
- autorização por scope
- criação de namespace
- binding fake
- rotação fake
- rollback de provider

### E2E sanitizado

```text
criar identidade de teste
→ autenticar com JWT temporário
→ chamar health
→ criar namespace
→ criar binding fake
→ validar receipt
→ rotacionar
→ revogar
→ confirmar auditoria
```

O teste E2E não deve usar nem imprimir credenciais reais

## 12. Critérios de aceite

- [ ] migration versionada aplicada no banco de teste
- [ ] três tabelas criadas com RLS
- [ ] bootstrap administrativo protegido
- [ ] JWT validado por assinatura, issuer, audience, expiração e status
- [ ] identidade `fbr-agency-flux-service` criada no ambiente de teste
- [ ] scopes mínimos funcionando
- [ ] endpoint de namespace idempotente
- [ ] binding não armazena plaintext
- [ ] rotação e revogação funcionando
- [ ] adapter `SecretsProvider` implementado
- [ ] Easypanel provider fail-closed sem contrato
- [ ] testes Zero Secret Leaks aprovados
- [ ] auditoria sanitizada funcionando
- [ ] health check autenticado retornando `HTTP 200`
- [ ] documentação `.env.example` usando apenas referências
- [ ] nenhum secret no Git, frontend, logs ou handoffs
- [ ] provisionamento automático validado em ambiente de teste

## 13. Ordem de implementação

```text
migration
→ RLS e policies
→ modelo IAM
→ bootstrap administrativo
→ JWT e scopes
→ namespaces
→ bindings
→ SecretsProvider
→ adapter Easypanel
→ rotação/revogação
→ auditoria
→ testes
→ deploy de staging
→ E2E
→ produção
```

## 14. Resultado esperado

Após esta implementação, o processo será:

```text
Service Identity do FBR Agency Flux criada uma única vez
→ Flux solicita novo projeto
→ Control Tower cria schema e project_id
→ namespace do projeto é criado
→ bindings são registrados por referência
→ adapter configura o Easypanel
→ secrets são injetados no runtime
→ aplicação inicia
→ health check confirma operação
→ Flux registra evidências e encerra o card
```

A aplicação do novo projeto nunca recebe a chave mestre do Control Tower
