# Tasklist — FBR Agency Flux

## Objetivo desta rodada
Avançar o Agency Flux nas duas lacunas operacionais mais relevantes, preservando a distinção entre núcleo local verificado e operação externa ainda pendente.

## Stories

| ID | Story | Owner | Estado | Depende de |
|---|---|---|---|---|
| FLUX-020 | Validar adapter relacional e readback de persistência | Subagente Flux A | review | credencial/runtime autorizado para teste remoto |
| FLUX-021 | Preparar worker contínuo, dispatcher e E2E operacional | Subagente Flux B | review | contrato outbound e Gates para produção |

## Regras
- Não publicar, fazer deploy ou alterar secrets sem Gate de Sergio.
- Paths de código devem ser tratados com ownership separado.
- Fakes/JsonStore são desenvolvimento; não provam operação remota.

## Critério de encerramento da rodada
Cada story entrega artefato revisável, evidência real ou blocker reproduzido, com próximo responsável e next check.
