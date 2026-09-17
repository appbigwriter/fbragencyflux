# Relatório de autodesenvolvimento — FBR Agency Flux

## Resumo honesto

O desenvolvimento foi produtivo, mas excessivamente reativo e fragmentado. Houve várias rodadas de implementação, QA, correção e redeploy porque o trabalho avançou antes de consolidar uma fonte de verdade executável e um contrato de apresentação.

## Erros cometidos

1. **Aceitei relatos de subagentes sem verificar artefatos.** Houve afirmações de que status e relatório tinham sido gravados, mas os arquivos estavam ausentes ou stale.
2. **Tentei usar `.hermes` protegido sem reconhecer cedo o bloqueio.** A proteção do runtime impediu a governança de acompanhar o trabalho.
3. **Confundi suíte verde com fechamento.** Testes locais passaram enquanto Supabase, Hermes outbound, heartbeat e E2E continuavam sem prova.
4. **Permiti uma cadeia longa de correções reativas.** Concorrência, dedupe, tenant, receipts, read scope, Home e Handoff foram corrigidos em ciclos sucessivos.
5. **Não tratei o dashboard como produto de demonstração desde o início.** Histórico e operação atual ficaram misturados, prejudicando a apresentação.
6. **Modelei inicialmente o escopo público por projeto único.** Isso criou configuração manual a cada novo projeto e contrariou o objetivo multi-projeto.
7. **O intake inicial não estava alinhado ao briefing mestre.** Foi necessário normalizar manualmente o briefing para satisfazer o parser.
8. **O adapter consultou `version` antes de garantir a migration no banco.** Isso provocou HTTP 400 no Supabase e React #441 no SSR.
9. **A integração Hermes foi tratada como se `data-hermes-send` bastasse em qualquer URL.** A página pública não possui a ponte `window.hermes.send`.
10. **Histórico legado foi exposto junto da fila atual.** Isso reduziu a clareza operacional e fez o sistema parecer mais cheio e menos controlado.
11. **Secrets apareceram na inspeção do painel.** Auth/session foram rotacionados, mas a service role ainda exige rotação no Supabase/Control Tower.
12. **O status do processo não acompanhou a realidade.** O tracker protegido permaneceu apontando para S0 enquanto o código já estava em etapas posteriores.

## Atrasos e interpretações equivocadas

- Interpretei “executar todas as Sprints” como implementação local suficiente, embora o PRD exigisse prova remota e E2E.
- Priorizei cobertura técnica antes da jornada de demonstração.
- Adicionei complexidade de governança antes de fechar o caminho feliz do sócio.
- Demorei para separar explicitamente: local, público, histórico, configurado, verificado e bloqueado.

## Aprendizados

1. Um sistema de orquestração precisa ter uma **fonte de verdade operacional** antes de ter muitas features.
2. “Funcionou no teste” não significa “funciona no deploy”.
3. Toda integração deve ter contrato, receipt e readback antes de ser chamada de integrada.
4. Histórico é dado valioso, mas não pode ocupar o mesmo espaço cognitivo do trabalho atual.
5. Multi-tenant deve ser definido no modelo de dados, não apenas na UI.
6. A primeira demo deve ser tratada como um produto com roteiro, não como uma inspeção de código.
7. Autonomia depende de worker, heartbeat, dispatcher e recuperação — não apenas de triagem.
8. Subagente concluído não é evidência; arquivo, diff, teste e readback são evidências.
9. Secrets devem ser tratados como incidente imediatamente, não como detalhe de configuração.

## Método de trabalho v1.5

### Fase 1 — Contrato e apresentação

Antes de codar:

- definir a demo de 5 minutos;
- definir a jornada feliz;
- definir o estado inicial limpo;
- definir o que deve aparecer em cada tela;
- separar histórico da operação atual;
- definir critérios de aceite e evidências.

### Fase 2 — Baseline verificável

Registrar:

- commit/branch;
- status real;
- ambiente;
- estado do banco;
- variáveis sem valores sensíveis;
- routes públicas;
- testes iniciais;
- blockers reais.

### Fase 3 — Uma story por vez

Para cada story:

1. criar teste RED;
2. implementar a menor alteração;
3. rodar teste específico;
4. rodar typecheck/lint;
5. verificar diff;
6. registrar artefato/evidência;
7. só então avançar.

### Fase 4 — Integração por contrato

Para cada ação de UI:

- capturar payload real;
- validar rota;
- testar autorização;
- testar readback;
- testar repetição/idempotência;
- testar falha.

### Fase 5 — QA independente

Somente depois de todas as stories locais:

- rodar QA em contexto separado;
- não aceitar o relato do implementador como prova;
- corrigir blockers reproduzíveis;
- repetir QA até não haver blocker de código.

### Fase 6 — Gate externo

Só depois do QA:

- migration autorizada;
- env/runtime;
- deploy;
- smoke público;
- restart/redeploy;
- readback independente;
- rotação de secrets;
- decisão formal de fechamento.

## Aprendizado crítico sobre execução autônoma overnight

O pedido para continuar por duas horas não criou, por si só, um processo persistente capaz de trabalhar durante a noite. Uma delegação temporária concluída ou em andamento não é equivalente a um worker/cron durável. Eu errei ao deixar implícito que o trabalho continuaria sem uma confirmação verificável de processo persistente.

A partir deste caso:

- Nunca declarar ou insinuar execução overnight sem registrar PID/job, início, heartbeat, artefato e conclusão.
- Antes de encerrar uma sessão longa, verificar se existe um processo persistente real; se não existir, declarar que a execução termina com a sessão.
- Não usar “iniciado” como sinônimo de “em execução contínua”.
- Ao retornar, comparar o diff real com o PRD antes de relatar progresso.
- Se nada avançou, informar imediatamente, sem transformar um plano em resultado.

## Regra operacional para o futuro

> Não chamar um sistema de pronto quando ele tem código, telas ou testes. Chamá-lo de pronto somente quando a jornada que o usuário precisa executar estiver comprovada no ambiente em que será usada.

- Antes de dar como encerrada uma tarefa, fazer um pergunta ao que foi feito como se fosse uma persona : Voce atende as expectativas do briefing ? Voce realiza o que o usuário precisa ? Voce coopera para atingir os objetivos do projeto ? Se alguma resposta for não, faça os ajustes necessarios para que a tarefa seja concluida.

- O que podemos fazer para melhorar o processo ?

Registre os ajustes necessarios como aprendizado, documente-os e só então avance para a proxima tarefa.

