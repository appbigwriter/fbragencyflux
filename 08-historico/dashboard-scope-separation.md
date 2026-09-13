# Separação de escopos do dashboard

## Diagnóstico

A apresentação anterior misturava o Gate transversal do FBR Flux, projetos acompanhados e cards do After Forty. O título `Gate FBR Flux` aparecia no singular e o subtítulo tratava After Forty como se fosse o estado geral do Flux. Os indicadores também combinavam contagens de cards, aprovações e Gates sem deixar claro que pertencem a escopos diferentes.

O estado persistido confirma quatro Gates do `FBR Agency Flux` e dois cards do projeto `After Forty`:

- `FLUX-GATE-01` a `FLUX-GATE-04`: aprovados conforme a decisão registrada para esta entrega
- `AF-001`: `awaiting_approval`
- `AF-002`: `review`
- nenhum dos dois cards foi fechado por inferência

Evidências e caminhos continuam vindo do estado persistido e dos artefatos sincronizados. Nenhum path novo foi inventado.

## Solução

O snapshot agora expõe um modelo de leitura explícito:

- `pendingGates`: Gates com status `pending`
- `pendingCards`: cards que não estão `completed` ou `failed`
- `blockerCount`: cards com status `blocked`
- `projectCards`: cards agrupados pelo nome do projeto persistido

A interface foi reorganizada em:

1. **Gates do FBR Flux**, com os quatro IDs, status, decisão, blockers e evidências
2. **Projetos acompanhados**, com os projetos persistidos
3. **Pendências por projeto**, com cards agrupados e status individual
4. indicadores independentes para Gates pendentes, cards pendentes, blockers e projetos acompanhados

Também foi incluído o contexto visual: aprovar um Gate do FBR Flux não altera automaticamente cards de projetos. O readback continua disponível e a separação é preservada após reload.

## Critérios verificáveis

- [x] A seção de Gates exibe exatamente `FLUX-GATE-01` a `FLUX-GATE-04`
- [x] A seção de projetos não apresenta After Forty como estado geral do Flux
- [x] A seção de pendências agrupa `AF-001` e `AF-002` em After Forty
- [x] `AF-001` permanece `awaiting_approval`
- [x] `AF-002` permanece `review`
- [x] Gates pendentes, cards pendentes e blockers têm contagens independentes
- [x] O teste de reload lê novamente os status sem fechar cards
- [x] Evidências são exibidas a partir de referências já existentes
- [x] Não houve commit, push ou deploy
