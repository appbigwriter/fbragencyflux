# Acessos técnicos compartilhados — GitHub e Easypanel

## Decisão arquitetural

Os agents não recebem credenciais diretamente. Eles recebem jobs e referências seguras. A identidade técnica central executa a ação dentro do escopo aprovado

```text
Agent designado
→ Handoff válido
→ Théo executa usando identidade técnica
→ Secret Manager resolve credencial no runtime
→ readback do serviço
→ Flux registra evento e evidência
```

## GitHub — opção recomendada

Usar um **GitHub App da FBR Agency**, instalado somente na organização ou nos repositórios de destino

Permissões mínimas sugeridas:

- Contents: Read and write
- Metadata: Read-only
- Actions: Read-only no início; Read and write somente se o workflow exigir disparo/reexecução
- Pull requests: Read and write se o fluxo usar PR obrigatório
- Administration: Read and write somente se o App precisar criar repositórios

Não usar token pessoal de Sergio como credencial compartilhada. Se a conta atual não permitir GitHub App ou criação automática de repositórios, usar uma conta técnica dedicada com fine-grained PAT limitado aos repositórios da FBR e prazo de expiração definido

### O GitHub App deve permitir

- criar ou acessar o repositório de um projeto aprovado
- criar a estrutura de diretórios por commits
- criar branches
- enviar código aprovado
- ler checks e Actions
- ler o commit remoto
- abrir PR quando exigido pelo workflow

### O GitHub App não deve permitir por padrão

- acesso a todos os repositórios pessoais
- administração da conta inteira
- alteração de billing
- acesso a secrets existentes sem necessidade
- exclusão de repositórios
- alteração de regras de segurança sem Gate

### Armazenamento

A chave privada, App ID e Installation ID ficam no Secret Manager da infraestrutura autorizada. Agents usam somente uma referência como:

```text
secret_ref: github/fbr-agency-app
```

Nunca colocar chave privada, PAT ou token em Git, frontend, Handoff, log ou chat

## Easypanel — local de armazenamento

O token da API do Easypanel deve ficar somente no Secret Manager/runtime do serviço que executa o adapter, preferencialmente o Control Tower

```text
EASYPANEL_API_URL → configuração não secreta do Control Tower
EASYPANEL_API_TOKEN → secret_ref easypanel/control-tower-api
EASYPANEL_PROJECT_NAME → configuração do ambiente
EASYPANEL_SERVICE_NAME → configuração do ambiente
```

O FBR Flux não deve manter uma cópia própria do token. O fluxo correto é:

```text
FBR Flux solicita provisionamento ao Control Tower
→ Control Tower resolve EASYPANEL_API_TOKEN no runtime
→ adapter chama Easypanel
→ Control Tower lê status
→ Flux recebe receipt sanitizado
```

Se o FBR Flux precisar de acesso direto no futuro, será criada uma identidade separada, com escopo menor e justificativa registrada. Não duplicar segredo por conveniência

## Operações do token Easypanel

O adapter deve poder executar somente o escopo aprovado:

- localizar projeto/serviço
- criar ou atualizar serviço
- atualizar environment
- configurar domínio já aprovado
- iniciar deploy
- ler status
- ler health/readback

O adapter deve falhar fechado se faltar URL, token, projeto, serviço ou contrato de API. Nunca retornar `running` ou `success` simulado

## DNS

Sergio fará previamente os registros DNS. O sistema deve apenas validar, sem alterar DNS automaticamente:

- registro apontando para o destino correto
- resolução pública
- HTTPS/TLS
- domínio respondendo após deploy

## Checklist de configuração

### GitHub

- [ ] definir organização/conta técnica
- [ ] criar GitHub App ou conta técnica dedicada
- [ ] limitar instalação aos repositórios FBR
- [ ] definir permissões mínimas
- [ ] criar credencial com expiração/rotação
- [ ] armazenar referência no Secret Manager
- [ ] validar criação/acesso de repositório de teste
- [ ] validar commit e readback remoto
- [ ] revogar credenciais de teste

### Easypanel

- [ ] confirmar URL da API real
- [ ] criar token com escopo mínimo
- [ ] armazenar token no Secret Manager da VPS
- [ ] associar referência ao Control Tower
- [ ] configurar projeto/serviço sem secret em texto aberto
- [ ] testar getService
- [ ] testar updateEnv em serviço de teste
- [ ] testar deploy
- [ ] testar getStatus e health
- [ ] confirmar readback
- [ ] revogar token de teste quando aplicável

### FBR Flux

- [ ] registrar apenas secret_ref e metadados
- [ ] nunca duplicar o token Easypanel
- [ ] registrar agent, job, correlation_id e escopo
- [ ] exigir Gate antes de mutação externa
- [ ] armazenar receipt sem valores secretos
- [ ] verificar estado externo após execução

## O que Sergio precisará fornecer fora do chat

- identificação da organização/conta GitHub de destino
- decisão entre GitHub App e conta técnica com fine-grained PAT
- criação da credencial no provedor escolhido
- token Easypanel inserido diretamente no Secret Manager da VPS

Os valores secretos nunca devem ser enviados nesta conversa
