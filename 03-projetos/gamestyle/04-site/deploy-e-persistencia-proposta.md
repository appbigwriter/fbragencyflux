# Game Style — proposta de avanço para discussão

Data: 2026-09-28
Status: proposta técnica; não é deploy executado.

## Objetivo
Eliminar a regressão do backlog e preparar o lançamento externo sem declarar publicação inexistente.

## Track A — Persistência do Flux

### Problema observado
Após reinícios do serviço, o endpoint `api/projects/gamestyle` reidrata versões antigas do backlog e de `updates.md`. O resultado já oscilou entre 9/12, 11/12 e 12/12, apesar dos artefatos físicos existirem.

### Proposta recomendada
1. Usar PostgreSQL remoto como única fonte de verdade.
2. Fazer cada mutação de backlog em transação explícita.
3. Retornar erro quando `UPDATE` afetar zero linhas ou falhar.
4. Fazer readback obrigatório após cada mutação.
5. Impedir seed/rehidratação de sobrescrever conteúdo existente.
6. Registrar `correlation_id`, actor, tarefa, estado anterior, estado novo e evidência.
7. Criar teste de ciclo: marcar tarefa, reiniciar API, ler novamente e confirmar permanência.

### Critério de aceite
GS-001 a GS-010 permanecem no mesmo estado após pelo menos três reinícios do serviço e três leituras canônicas consecutivas.

## Track B — Deploy externo

### Situação
Build local, TypeScript, rotas `/` e `/guides` e `npm audit` foram verificados. Não há target, projeto de hospedagem, endpoint ou credencial de deploy identificados no workspace.

### Opções

1. **Easypanel/VPS + Caddy — recomendada**
   - Mantém o stack self-hosted existente.
   - Exige app/service, domínio `gamestyle.fbr.news`, variáveis de runtime, health check e proxy Caddy.

2. **Vercel**
   - Fluxo simples para Next.js.
   - Exige projeto/conta, domínio, variáveis de ambiente e decisão sobre integração com o Flux remoto.

3. **Staging local/privado**
   - Nenhum efeito externo.
   - Serve para validação visual e Lighthouse antes do deploy definitivo.

### Critério de aceite do deploy
- URL pública respondendo com HTTPS.
- `/` e `/guides` retornando HTTP 200.
- Readback do estado publicado e health check registrados.
- Rollback definido.
- Nenhum secret exposto.

## Decisão necessária de Sergio
Escolher o target de deploy: `Easypanel/VPS`, `Vercel` ou `staging privado`.

Até essa escolha, o trabalho deve avançar em staging e na correção da persistência, sem publicar externamente.
