# Bootstrap — nova sessão Hermes — FBR Agency Flux

**Data:** 2026-09-17  
**Objetivo:** retomar o projeto com contexto mínimo e verificável.  
**Escopo desta sessão:** leitura de fila, diagnóstico pós-reset, receipt do reset remoto e pendências bloqueadas. Não executar deploy, rotação de secret, migration ou mutação remota sem Gate explícito.

## Fontes únicas carregadas

1. `C:\Users\OEM\AppData\Local\hermes\PENDING_TASKLIST.md`
2. `F:\Projetos\_FBR\FBR Agency Flux\08-historico\DIAGNOSTICO-DADOS-APOS-RESET-2026-09-17.md`
3. `F:\Projetos\_FBR\FBR Agency Flux\08-historico\RESET-REMOTO-2026-09-17.md`
4. Este bootstrap, que somente referencia e resume as fontes acima.

## Estado factual atual

- O reset remoto de `state_key=fbr-agency-flux` foi confirmado por readback.
- Baseline remoto verificado: `version: 2`, 1 projeto After Forty, 2 cards, 2 Jobs planejados, 0 Handoffs, 0 blockers, 0 eventos, 0 gates, 0 approvals pendentes, 0 artifacts, 0 required actions, 0 Sprints e 0 Stories.
- Os dados antigos vistos em `/jobs` e `/handoffs` não estavam no remoto resetado; eram lidos do estado local/histórico por `getSnapshot()` sem escopo.
- Correção local aplicada: Dashboard, Jobs e Handoffs usam `getScopedSnapshot({ scopes, visibility: 'public' })`.
- Validação local da correção: 23 arquivos/120 testes, typecheck, lint e build aprovados.
- A correção ainda não foi validada no domínio público.

## Bloqueios ativos

### FLUX-012 — Supabase no runtime local
- **Causa:** endpoint REST configurado respondeu `HTTP 401 Unauthorized`.
- **Owner do desbloqueio:** Théo / Sergio.
- **Próxima ação:** atualizar a referência segura da service role a partir do runtime autorizado; nunca colar o valor no chat, Git ou arquivo versionado.
- **Próximo check:** após a atualização segura.
- **Aceite:** readback HTTP 200, versão coerente, Dashboard/Jobs/Handoffs no mesmo estado remoto e nenhuma queda silenciosa para JSON.

### FLUX-011 — Dados após reset
- **Causa restante:** deploy/readback público ainda não realizado.
- **Owner:** David / Théo; Gate externo com Sergio.
- **Próxima ação:** publicar somente a versão auditada após autorização e repetir readback público.
- **Aceite:** Dashboard, Jobs e Handoffs públicos exibem somente o baseline remoto.

### FLUX-009 — Alinhamento ao produto ideal
- **Estado:** local corrigido; público bloqueado.
- **Owner:** David / Sergio para Gates externos.
- **Próxima ação:** após Gate de Sergio, publicar versão auditada e repetir readback público.
- **Aceite:** Dashboard, Handoff e Jobs atendem ao objetivo global no ambiente usado; limitações externas permanecem explícitas.

### FLUX-002 — Persistência Supabase/RLS/CAS
- **Owner:** Théo / Sergio para Gate.
- **Próxima ação:** confirmar migration, RLS, CAS, duas leituras e readback após restart/redeploy.
- **Aceite:** estado, versão e decisões sobrevivem ao ciclo completo sem lost update.

### FLUX-003 — Rotação da service role exposta
- **Owner:** Théo / Sergio.
- **Próxima ação:** rotacionar no provedor, atualizar apenas runtime e revogar a versão exposta.
- **Aceite:** secret antigo não funciona e nenhum secret aparece em logs, Git ou chat.

### FLUX-004 — Dispatcher Hermes e heartbeat real
- **Owner:** Théo / owner Hermes.
- **Causa:** contrato/endpoint externo não confirmado.
- **Próxima ação:** configurar delivery assinado, receipt, retry e heartbeat com identidade de job.
- **Aceite:** evento real chega, é persistido uma vez e aparece no readback.

### FLUX-006 — Deploy público v1.5
- **Owner:** Théo / Sergio para Gate.
- **Próxima ação:** QA independente, revisão de diff, commit, push, deploy e readback público — nessa ordem.
- **Aceite:** commit implantado coincide com o auditado; Home, Sprints, Handoffs e Jobs funcionam publicamente.

## Tarefas prontas, mas não bloqueadas

- `FLUX-001`: QA independente da v1.5; executar após confirmar diff local.
- `FLUX-005`: E2E After Forty v1.5; executar localmente e registrar evidência por etapa.

## Regra de retomada

A nova sessão deve primeiro reler as quatro fontes acima, confirmar que os bloqueios continuam atuais e escolher somente uma próxima ação verificável. Não tratar plano, HTTP 200 isolado, build verde ou relato de agente como conclusão. Antes de encerrar, aplicar o gate: atende ao briefing, realiza o que Sergio precisa e coopera para o objetivo do projeto?

## Classificação

- **Fato:** reset remoto confirmado; correção local testada; Supabase local rejeita credencial com 401.
- **Bloqueio:** credencial/runtime externo, deploy/readback público, contratos do dispatcher e Gates humanos.
- **Decisão pendente:** autorização de Sergio para ações externas sujeitas a Gate.
- **Roadmap/fora do escopo imediato:** gestão operacional de Marketing, Vendas, Suporte e ML da versão 2.0.
