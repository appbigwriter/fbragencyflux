# Plano de execução noturna — Authority Engine e FBR Agency Flux

## Stories executáveis desta rodada

### Authority Engine
- AUTH-003 — persistência relacional, adapter local e RLS
- AUTH-004 — runtime, autenticação, adapters fail-closed e QA local

### FBR Agency Flux
- FLUX-022 — persistência relacional, isolamento das APIs e typecheck
- FLUX-023 — worker oficial, wrapper e E2E local

## Estado
ready para execução por quatro agentes GPT-5.5.

## Limites
Integrações externas, migrations remotas, deploy, publicação, gasto, secrets e dispatcher real permanecem bloqueados por Gate/credencial. O objetivo desta rodada é implementar e verificar tudo que é possível localmente.
