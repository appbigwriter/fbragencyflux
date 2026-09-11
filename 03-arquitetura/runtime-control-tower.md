# Configuração de runtime — FBR Agency Flux

## Contrato esperado

```env
CONTROL_TOWER_BASE_URL=https://control-tower.fbr.news
CONTROL_TOWER_AGENT_API_KEY=<secret-manager:fbr/services/agency-flux/CONTROL_TOWER_AGENT_API_KEY>
SUPABASE_URL=https://supabase-control-tower-api.fbr.news
SUPABASE_SERVICE_ROLE_KEY=<secret-manager:fbr/saas/<PROJECT_ID>/SUPABASE_SERVICE_ROLE_KEY>
CONTROL_TOWER_PROJECT_ID=<PROJECT_ID>
CONTROL_TOWER_SCHEMA_NAME=saas_fbragencyflux
```

As variáveis acima são referências/documentação. Os valores devem ser injetados no processo Node.js pelo Secret Manager/Easypanel

## Validação executada em 2026-09-11

- `https://control-tower.fbr.news/api/control-tower/health` → `404 Not Found`
- `https://supabase-control-tower-api.fbr.news/api/control-tower/health` → `401 Unauthorized`, servido pelo Kong

## Bloqueio

O contrato informa que `control-tower.fbr.news` deveria expor a API, mas o health check retorna 404. O host `supabase-control-tower-api.fbr.news` alcança o gateway, mas requer `CONTROL_TOWER_AGENT_API_KEY`. Antes do provisionamento, o Dev do Control Tower precisa confirmar o roteamento oficial e injetar a identidade `fbr-agency-flux-service` no runtime

Nenhuma chave foi gravada neste arquivo, no Git, no dashboard ou em logs
