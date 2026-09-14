# Flux — contrato operacional de resolução e encaminhamento

Todo blocker aberto possui `resolutionAction` executável: `from`, `to`, `objective`, `deliverable`, `acceptanceCriteria`, `evidenceRequired` e `nextStep`. `resolutionPlan` iniciado por retenção (`manter pendente`, `aguardar`, `não executar` etc.) é inválido quando não contém uma ação executável.

## Fluxo

1. A página exibe causa, owner, como resolver, objetivo, entregável, critérios e evidência necessária.
2. Usuário autenticado abre o formulário, revisa/edita os campos e envia `POST /api/flux/blockers/:id/forward` com `resolutionAction`, `cardId`, `jobId` opcional e `correlationId`. O actor vem da sessão server-side.
3. O servidor valida blocker `open`, todos os campos da instrução e rejeita planos passivos. Blockers `legacy`/`resolved` não são encaminháveis.
4. A operação persiste novo Handoff, job e evento com correlationId. A chave `blockerId|cardId|to|objective|deliverable` e a correlação tornam repetições idempotentes.
5. Card/job aguarda o owner; o blocker continua `open`. Encaminhar nunca resolve blocker.
6. Resolução exige endpoint separado e evidência real persistida; não há botão de encaminhamento que altere `status` do blocker.

### Produto-pauta After Forty

Destino: Gestor Editorial, com dependência de Rick/Amazon Research. Objetivo: fornecer 2–3 opções rastreáveis por pauta, sem escolher nem inventar produto, ASIN, preço, claim ou link. Entregável: matriz por pauta com fonte, URL, data de consulta e limitações. Aceite: todas as pautas têm 2–3 opções verificáveis e a matriz separa fatos, ausência de dados e decisão. Evidência: matriz versionada, URLs/datas e retorno registrado de Rick/Amazon Research.

A operação é local e não executa deploy, publicação, gasto, migration ou integração externa.
