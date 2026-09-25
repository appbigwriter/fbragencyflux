# FLUX-020 — Validar adapter relacional e readback de persistência

## Status
ready

## Projeto
FBR Agency Flux — `F:/Projetos/_FBR/FBR Agency Flux`

## Objetivo
Auditar a migração DB-first do Flux e preparar a validação do estado relacional, distinguindo claramente testes locais, configuração ausente, autenticação upstream e readback remoto.

## Escopo
- Revisar migrations SQL, repositories, persistence, tipos e testes.
- Verificar se Dashboard, Jobs e Handoffs usam fonte relacional escopada.
- Rodar checks locais sem alterar produção.
- Documentar exatamente o que impede o readback remoto e o teste necessário após o runtime autorizado.

## Fora do escopo
- Não rotacionar secrets.
- Não aplicar migration remota.
- Não fazer deploy.

## Ownership de paths
- Preferir relatório em `08-historico/` e testes novos em arquivo dedicado.
- Não editar simultaneamente o núcleo de persistência compartilhado sem registrar conflito.

## Entregáveis
- `08-historico/FLUX-020-persistencia-readback.md`
- Matriz de evidências local/remota.
- Handoff padrão.

## Aceite
- [ ] Migrations e tabelas esperadas estão mapeadas.
- [ ] Fonte de verdade de cada superfície está comprovada no código.
- [ ] HTTP 401, ausência de schema e fallback local estão separados.
- [ ] Roteiro de readback pós-credencial está exato e reproduzível.
