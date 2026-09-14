# Íris coordinator worker

O ciclo explícito é executado com `npm run worker:iris -- --once` (ou `--dry-run`). Ele lê o snapshot, detecta job/Handoff sem `lastActivity` ou `nextCheck` devido, chama a triagem da Íris, calcula tracks independentes, cria uma ação requerida ou HOLD e reavalia no próximo ciclo.

- `lastActivity`, `nextCheck`, heartbeat, `correlationId` e resultado são persistidos.
- Pesquisa e provisionamento podem iniciar em paralelo quando não há dependência; conteúdo comercial aguarda a pesquisa declarada.
- Blocker aberto, ação fora do plano ou ação de risco ficam em HOLD. Fora do plano gera consulta explícita a Sergio; risco nunca executa sem Gate.
- Sem `FLUX_DISPATCHER_URL` e `FLUX_DISPATCHER_TOKEN`, o resultado é `DISPATCHER_OUTBOUND_NOT_CONFIGURED`, com ação/Handoff de conexão pendente. O worker não afirma que um agente foi acionado.
- O worker não inicia daemon permanente: `--once` é obrigatório. Repetição usa chave determinística e não duplica ações/eventos.
- Readback: `GET /api/flux/iris/worker`; o dashboard exibe último ciclo, HOLDs e razões de espera.

Regra dos agentes: não encerrar diante do muro. Registrar blocker, próximo passo executável e Handoff; a Íris mantém a solução em movimento por encaminhamento, atividade paralela, HOLD ou consulta explícita a Sergio. Máxima transversal: `There are no hard tasks, only unfinished ones. Keep going.` Dificuldade deve virar decomposição; gap, ação/HOLD; impasse, ajuda/encaminhamento; contexto ausente, consulta à Íris; fora do plano, Sergio; dependência real, tracks paralelas. Nunca deixar item sem `nextAction`, owner e `nextCheck`.
