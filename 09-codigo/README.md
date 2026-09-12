# FBR Agency Flux dashboard

Aplicação local do Agency Flux com estado persistido em JSON. A página lê o estado server-side; os mocks históricos permanecem apenas nos testes/artefatos de referência e não são fonte de verdade da produção.

## Execução

```bash
npm install
npm run dev
# ou: npm run build && npm start
```

O estado padrão fica em `data/flux-state.json`, fora de `src`. Para usar outro arquivo, defina `FLUX_DATA_FILE` antes de iniciar o processo (caminho absoluto ou relativo ao diretório de execução). O repositório grava por arquivo temporário e rename para evitar escrita parcial.

## API local

- `GET /api/flux/snapshot` — snapshot agregado para o painel
- `GET /api/flux/cards` — cards persistidos
- `GET /api/flux/events` — eventos de auditoria
- `GET /api/flux/approvals` — approvals persistidos
- `POST` ou `PATCH /api/flux/cards/:id` — transição; body `{ "status": "review", "actor": "Íris", "scope": "local" }`
- `POST /api/flux/approvals/:id/decision` — decisão local; body `{ "decision": "approved", "actor": "Sergio", "scope": "local" }`

Transições desconhecidas ou fora da máquina falham fechado. Toda operação exige `scope: local`; decisões de approval exigem exatamente `actor: Sergio`, registram timestamp e evento, e não publicam, gastam, geram HopLink ou mutam qualquer sistema externo. A UI identifica isso como `LOCAL PERSISTED · NO EXTERNAL EFFECT`.

## Verificação

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

O seed inclui o card `AF-001`, projeto After Forty, approval pendente, eventos, handoff e artefatos. O arquivo é estado operacional local: não há autenticação, concorrência distribuída, banco, Control Tower, publicação, gasto ou integração externa.

## Fase 2

Adicionar autenticação/autorização server-side, storage transacional com locking/backup, contratos de adapters e receipts de execução, observabilidade/correlation IDs, isolamento por projeto e integração externa somente após contrato e autorização datada de Sergio. Até lá, approvals e transições são simulações locais.
