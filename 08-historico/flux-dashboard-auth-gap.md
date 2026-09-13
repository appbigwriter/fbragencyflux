# Flux auth gap — 2026-09-13

## Modelo

- Mutations require an opaque, HttpOnly, SameSite=Strict `flux_session` cookie
- Session identity is kept server-side in the process store; the browser never supplies the actor for authorization
- Published mode requires runtime-injected `FLUX_AUTH_ACTOR`, `FLUX_AUTH_SECRET` and `FLUX_SESSION_SECRET` (Control Tower/secret manager reference only, never values)
- Local mode is explicit (`NODE_ENV != production`) and only exposes login when `FLUX_LOCAL_LOGIN_ACTOR` and `FLUX_LOCAL_LOGIN_SECRET` exist; this is local-only and not a production fallback
- Gate and approval decisions require `gatekeeper`; card transitions require `operator`; Handoff creation requires `coordinator` and `from` must match the authenticated actor
- Existing local decisions remain state history. They are not retroactively treated as authenticated decisions and are not reverted

## Limites

- The server-side session store is process-local and requires a durable shared session store before horizontal scaling
- No deployment, Control Tower write, DNS change, external integration, spend, or publication is performed here
- Local decisions keep `externalActionAuthorized: false`
- Published credential provisioning and rotation remain an infrastructure responsibility

## Comandos

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run build

# local-only smoke
export NODE_ENV=development
export FLUX_LOCAL_LOGIN_ACTOR=Sergio
export FLUX_LOCAL_LOGIN_SECRET='<runtime-only-value>'
npm run dev -- -p 3000
curl -i -c /tmp/flux.cookies -X POST http://localhost:3000/api/auth/login -H 'content-type: application/json' -d '{"actor":"Sergio","secret":"<runtime-only-value>"}'
curl -i http://localhost:3000/api/auth/session
curl -i -X POST http://localhost:3000/api/flux/gates/FLUX-GATE-01/decision -H 'content-type: application/json' -d '{"decision":"approved","actor":"Sergio"}'
```

The last request without the session cookie must return `401`; a body claiming `actor: Sergio` is not authentication. Do not put runtime values in Git, README, frontend bundles, logs, or receipts.
