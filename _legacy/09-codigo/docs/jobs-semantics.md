# Semântica de Jobs

A página `/jobs` separa intenção, histórico e execução observada. A classificação é mutuamente exclusiva:

- **Planejado**: `status` `planned`/`ready`, origem `local/intake-fixture`, sem `startedAt` e sem evento/heartbeat de execução. `lastSeen` herdado do fixture não é heartbeat.
- **Histórico**: job marcado `historical` ou derivado de `filesystem`. É readback arquivado, não execução viva e nunca é marcado `stale`.
- **Realtime**: somente origem live/dispatcher com `startedAt` e evento real de dispatcher ou `lastSeen` posterior ao início. Um registro local/fixture não é realtime apenas por conter `lastSeen` ou `dispatched`.
- **Stale**: somente job realtime iniciado cujo `lastSeen` excede 30 segundos. Jobs planejados e históricos nunca entram no contador de stale.

Os contadores, filtros, cards e detalhes devem usar a mesma classificação. O fixture público After Forty deve exibir `planned=4`, `realtime=0` e `stale=0`. Eventos recebidos pelo dispatcher são normalizados como `sourceType: live`; isso fornece a evidência necessária para a transição a Realtime sem fabricar heartbeat.
