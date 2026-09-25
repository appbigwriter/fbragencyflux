# Auditoria E2E operacional — dashboard

Data da auditoria: 2026-09-12. Escopo: `09-codigo`, filesystem local e contratos em `03-arquitetura`/`04-database`. Status não significa homologação remota.

| Requisito do criterio-e2e-operacional.md | Status atual | Evidência real | Owner | Ação |
|---|---|---|---|---|
| Abrir dashboard | IMPLEMENTADO LOCAL | Next page server-side + client UI | Théo | Testar navegador/HTTP |
| Projetos, cards, status, owners, eventos, Handoffs, artefatos, approvals, blockers | IMPLEMENTADO LOCAL | Snapshot persistido e UI renderiza seções | Théo/Kora | Acrescentar cobertura visual |
| Filtrar/localizar AF-001 | IMPLEMENTADO LOCAL | Campo de filtro client-side | Théo | Cobrir UI |
| Abrir detalhe | IMPLEMENTADO LOCAL | Card clicável abre detalhe, artefatos, handoffs e ações | Théo | Cobrir UI |
| Executar ações disponíveis | IMPLEMENTADO LOCAL | Transição, approval e Handoff via fetch | Théo | Validar todas as rotas |
| Confirmação visual sucesso/erro | IMPLEMENTADO LOCAL | `role=status`, mensagens de API | Théo | Cobrir falha de rede |
| Atualizar e confirmar persistência | IMPLEMENTADO LOCAL | botão reload chama snapshot; arquivo JSON atomic rename | Théo | Testar duas leituras |
| Impedir ações sem permissão | IMPLEMENTADO LOCAL LIMITADO | allowlist de atores; Sergio obrigatório para approval | Théo/Gabe | Substituir por identidade autenticada |
| Projeto real de teste / AF-001 | IMPLEMENTADO LOCAL | After Forty e AF-001 presentes em `data/flux-state.json` | Kora | Readback remoto pendente |
| 12 artigos reais | IMPLEMENTADO LOCAL | 12 markdown em `08-historico/afterforty/drafts`, importados por filesystem | Gestor Editorial | Validar integridade/checksum |
| Drafts, fontes, evidências, Handoffs, artefatos reais | PARCIAL LOCAL | drafts e históricos existem; schema local registra artefatos/Handoffs | Gabe/Kora | Modelar fontes/evidências explicitamente |
| Owners, dependências, status, gates, decisões | PARCIAL LOCAL | owners/status/gates no JSON; dependências não modeladas no runtime | Kora | Implementar dependências e critérios completos |
| Duas leituras independentes iguais | IMPLEMENTADO LOCAL | GET snapshot e leitura direta do arquivo após operação | Théo | Automatizar HTTP readback |
| Transições válidas | IMPLEMENTADO LOCAL | tabela `transitions` + API/UI | Kora | Exercitar todas as arestas |
| Transições inválidas | IMPLEMENTADO LOCAL | `INVALID_TRANSITION`, fail-closed | Gabe | Cobrir matriz completa |
| actor/timestamp/motivo/origem/correlation_id | PARCIAL LOCAL | eventos novos têm actor/timestamp/reason/correlationId; origem é LOCAL no texto | Gabe | Campo origin formal |
| Conclusão exige artefato/evidência | IMPLEMENTADO LOCAL | guard `MISSING_EVIDENCE` | Gabe | Exigir evidência distinta de artigo |
| Gate exige critérios | PARCIAL LOCAL | critérios agora presentes no AF-001; guard de aceite ainda precisa endurecimento | Gabe | Bloquear awaiting_approval sem critérios |
| Readback de transição | IMPLEMENTADO LOCAL | save atômico + snapshot/GET detail | Théo | Teste HTTP |
| Criar approval real de teste | NÃO IMPLEMENTADO | existe decisão sobre seed; não existe POST de criação | Kora | Criar endpoint/form de solicitação |
| Escopo/impacto/reversibilidade/rollback | IMPLEMENTADO LOCAL | Approval contém scope/impact/rollback e UI exibe | Sergio/Gabe | Persistir reversibilidade como campo formal |
| Ator não autorizado | IMPLEMENTADO LOCAL | `SERGIO_REQUIRED`/403 e allowlist | Gabe | Integrar auth |
| Decisão Sergio com data/escopo | PARCIAL LOCAL | data/decidedBy persistem; scope é da solicitação | Sergio | Registrar escopo da decisão |
| Approval local não é autorização externa | IMPLEMENTADO LOCAL | banners e eventos `NO EXTERNAL EFFECT` | Sergio | Manter gate remoto |
| Readback approval após reload/API | IMPLEMENTADO LOCAL | persistência JSON e GET approvals | Théo | Testar com servidor iniciado |
| Handoff completo | IMPLEMENTADO LOCAL | POST valida 10 campos obrigatórios | Kora | Cobrir formulário no browser |
| Handoff vinculado projeto/card | IMPLEMENTADO LOCAL | payload exige project/cardId | Kora | Integridade cruzada server-side |
| Artefato/evidência vinculados | PARCIAL LOCAL | artifacts vinculados AF-001; evidenceRef em Handoff | Gabe | entidade evidence separada |
| Leitura pelo próximo owner | IMPLEMENTADO LOCAL | detalhe lista Handoffs e destinatário | Kora | Autorização por owner |
| Handoff incompleto rejeitado | IMPLEMENTADO LOCAL | validação sem gravação antes de push | Gabe | Teste de falha sem mutação |
| Autenticação | NÃO IMPLEMENTADO | README/rodapé declaram limite; allowlist não autentica identidade | Théo | Contrato de auth/credencial |
| Autorização por papel/escopo | PARCIAL LOCAL | allowlist e Sergio para approval; escopo local obrigatório | Gabe | RBAC real e sessão |
| Isolamento After Forty | PARCIAL LOCAL | dados possuem projeto; rotas não aceitam filtro arbitrário por tenant | Théo | Guard server-side por projeto |
| RLS remoto | NÃO VERIFICADO | SQL habilita RLS sem policies; Control Tower não acessível | Théo | aplicar/validar policies |
| Scan de secrets | NÃO EXECUTADO NESTA FASE | contratos usam referências; sem credenciais no código | Gabe | executar secret scan reproduzível |
| API/banco/timeout/corrida | NÃO IMPLEMENTADO | JSON local sem locking distribuído e sem adapter de falha | Théo | storage transacional e testes |
| Payload inválido | IMPLEMENTADO LOCAL | parsers e validações retornam 400 | Gabe | testes HTTP |
| Erro sanitizado | IMPLEMENTADO LOCAL | `jsonError` não retorna stack | Théo | cobrir exceções inesperadas |
| Sem gravação parcial | IMPLEMENTADO LOCAL LIMITADO | valida antes de mutar; temp+rename | Théo | lock e teste de rename failure |
| Retry/idempotência/rollback | NÃO IMPLEMENTADO | sem idempotency key; failed pode voltar in_progress | Théo | contrato de execução |
| Adapter real/homologado/readback externo | BLOQUEADO | health CT 404; gateway Supabase 401 conforme runtime-control-tower | Théo/Control Tower | confirmar roteamento, credencial e deploy |
| Receipt/correlation externo | NÃO IMPLEMENTADO | correlation apenas local | Théo | adapter + receipt |
| Control Tower/schema/auth/backup/observabilidade/locking | BLOQUEADO REMOTO | sem deploy/contrato executável; SQL apenas fundação | Théo/Control Tower | provisionar e ler de volta |
| Operação externa com autorização datada | BLOQUEADO POR REGRA | não há publicação/gasto/HopLink neste código | Sergio | só após gate formal |

## Classificação

- **Implementado/verificado local:** UI navegável, JSON persistido, importação filesystem, filtros, detalhe, transições fail-closed, approval Sergio local, Handoff, mensagens e readback
- **Parcial:** modelo de evidência/dependências, origem formal, isolamento e RBAC
- **Bloqueado:** autenticação real, Control Tower, schema remoto/RLS validado, adapter, backup, locking distribuído, observabilidade externa
- **Não E2E completo:** a interface ainda não cobre criação de approval e não existe identidade autenticada nem readback remoto

## Gap adicional — resultado esperado do Flux executor

| Requisito | Status | Evidência/limite | Owner | Ação |
|---|---|---|---|---|
| Receber MD conceitual e validar entradas | NÃO IMPLEMENTADO | Não há intake/upload/parser de MD | Íris/Théo | Criar intake persistido com campos faltantes |
| Conduzir intake, PRD, critérios e plano | NÃO IMPLEMENTADO | AF-001 é estado pré-existente, não pipeline gerado | Íris/Kora | Orquestrar pipeline e registrar artefatos |
| Arquitetura, banco/schema, backend e frontend | PARCIAL LOCAL | frontend/API local; SQL existe, banco não aplicado | Théo | adapter Control Tower + migration/readback |
| Identidade visual, domínio, Easypanel, DNS e publicação | BLOQUEADO | domínio só está no briefing; sem acesso/contrato | Théo/Sergio | gate datado, provisionamento e DNS |
| Workflows, integrações, conteúdo e QA | PARCIAL | drafts/históricos reais; sem worker/orquestração | Agents/Gabe | pipeline com owners e evidências |
| Cada etapa tem artefato/owner/estado/evidência/próximo passo | PARCIAL LOCAL | cards/eventos/artifacts existem; cobertura incompleta | Kora | expandir entidades e guards |
| Gate com decisão, motivo, impacto, custo, escopo, reversibilidade, rollback e evidências | PARCIAL LOCAL | scope/impact/rollback; custo/reversibilidade faltam | Sergio/Gabe | completar contrato de Gate |
| Sergio opera Gates simples sem coordenar agents | LIMITADO LOCAL | approval local, sem autenticação de identidade | Sergio/Théo | auth e trilha formal |
| Autonomia de agents | NÃO IMPLEMENTADO | não existe worker/orquestrador executor | Íris | implementar jobs/adapters |
| Conclusão exige banco/backend/frontend/domínio/integr./isolamento/auth/QA/log/rollback/URLs | NÃO ATENDIDO | nenhum readback remoto/público | Théo/Gabe | Gate de homologação e operação |
| Estados provisionado/implantado/publicado/verificado honestos | PARCIAL LOCAL | estados locais não cobrem infra/deploy/publicação | Kora | ampliar estados e receipts |
| Piloto AF-001 como blog After Forty operacional | NÃO ATENDIDO | sem banco, deploy, domínio, publicação ou smoke público | Sergio/Théo | desbloquear Fase 2; não publicar automaticamente |

