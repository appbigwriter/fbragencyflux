# PRD — autenticação visível e gestão de blockers

## Causa
O layout compartilhado foi simplificado e removeu o formulário de sessão. As APIs continuaram exigindo autenticação server-side, mas as rotas públicas `/`, `/handoffs` e `/jobs` não ofereciam um meio visível de iniciar ou encerrar sessão. O dashboard também reduzia a atenção a uma contagem de blockers, sem localizar causa, vínculo operacional ou ação possível.

## Solução implementada
- `AuthProvider` + `AuthControl` client no layout compartilhado: consulta apenas `/api/auth/session`, autentica em `/api/auth/login` e encerra com DELETE em `/api/auth/session`.
- O formulário aceita actor e credencial sem valor default; a credencial permanece em input password, é limpa após login e nunca é renderizada.
- Ações de blocker (`Passar problema` e `Consultar Sergio`) permanecem clicáveis sem sessão: disparam o evento `flux:auth:request`, expandem o `AuthControl`, focam o actor e exibem `Entre para passar este problema`. O servidor continua exigindo a sessão e responde 401 para mutações não autenticadas.
- Após login, `AuthProvider.refresh()` atualiza a sessão e re-renderiza as ações sem reload; o actor enviado pelo browser nunca é usado para autorizar a mutação.
- Sem sessão, as três rotas seguem legíveis e exibem `Leitura permitida; gestão bloqueada sem sessão`; ações de Handoffs e Jobs ficam desabilitadas.
- A home agora tem uma seção compacta com até seis blockers localizáveis por causa, card/job/Handoff, owner, nextAction, resolutionPlan, resolutionEvidence e status. `Prosseguir / liberar para owner` chama a API existente de forwarding somente após login e registra readback sem resolver o blocker.
- Blockers resolved, legacy ou sem solução exibem o motivo de a ação estar bloqueada; detalhes completos continuam em Handoffs.

## Critérios de aceite
- Login, sessão autenticada e logout cobertos por integração.
- Contrato de UI cobre login visível, aviso read-only e gating de ações sem sessão.
- Verificações executadas: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.
