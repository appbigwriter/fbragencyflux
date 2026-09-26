# The Thirties — Arquitetura e contratos v1

**Projeto:** The Thirties by Maia Mendes  
**Estado:** proposta local para revisão; não é autorização de implementação, migration, deploy ou publicação.  
**Data da execução:** 2026-09-26 20:12 -03:00  
**Owner:** Maia Mendes / Gestor Editorial; Théo para futura implementação técnica  
**Execution directory:** `F:\Projetos\_FBR\FBR Agency Flux\03-projetos\thethirties`  

## 1. Escopo e decisão operacional

Este documento traduz o briefing atual em uma fundação técnica proposta para artigos e vídeos EN-US, com fontes, revisão YMYL, disclosure e Gates de publicação/monetização rastreáveis.

- **Fato:** o briefing define EN-US, mercado EUA/global, público de mulheres de 30–39 anos, artigos e vídeos, persona não médica, Sources e disclosure.
- **Fato:** o briefing exige aprovação de Sergio para publicação pública e ativação de monetização.
- **Decisão operacional:** propor Next.js + TypeScript para a superfície futura e Supabase/Postgres como fonte única de estado operacional, sem criar código ou executar SQL nesta tarefa.
- **Hipótese (confiança média):** uma aplicação única com área editorial protegida e conteúdo público atenderá a primeira versão melhor que múltiplos serviços; isso depende da validação do escopo técnico.
- **Bloqueio:** publisher/responsável/e-mail, identidade visual final, credenciais, contratos externos e autorização de produção ainda não estão definidos.

## 2. Componentes propostos

1. **Web app Next.js/TypeScript** — páginas públicas, preview protegido e área de revisão.
2. **Domínio editorial** — artigos, vídeos, fontes, claims, disclosures e estados de revisão.
3. **Persistência Supabase/Postgres** — estado canônico, versionamento e auditoria; nenhum JSON local como fonte operacional.
4. **Auth server-side** — sessão, tenant/projeto e autorização por papel; secrets nunca chegam ao browser.
5. **Adapters** — storage de mídia, analytics e monetização somente atrás de interfaces; sem endpoint presumido.
6. **QA/observabilidade** — checks de contrato, logs sanitizados, correlation id e receipts por transição.

## 3. Entidades mínimas propostas

| Entidade | Campos mínimos | Regra de integridade |
|---|---|---|
| `editorial_projects` | `id`, `slug`, `name`, `locale`, `status` | slug único por projeto; contexto de projeto explícito |
| `content_items` | `id`, `project_id`, `type`, `title`, `slug`, `status`, `version` | artigo/vídeo; versão concorrente rejeitada |
| `content_sources` | `id`, `content_item_id`, `title`, `publisher`, `url`, `accessed_at`, `limitation` | fonte identificável; URL não inventada |
| `content_claims` | `id`, `content_item_id`, `text`, `risk`, `source_id`, `review_status` | claim factual sem fonte permanece em revisão |
| `disclosures` | `id`, `content_item_id`, `kind`, `text`, `placement`, `status` | disclosure obrigatório quando houver monetização |
| `review_gates` | `id`, `content_item_id`, `gate_type`, `decision`, `actor_id`, `decided_at`, `reason` | publicação/monetização exigem decisão formal |
| `media_assets` | `id`, `content_item_id`, `kind`, `origin`, `license_note`, `label` | imagem gerada/ilustrativa deve ser rotulada |
| `audit_events` | `id`, `project_id`, `actor_id`, `event_type`, `payload_sanitized`, `created_at` | payload sem secrets; append-only |

Os nomes são contratos propostos, não prova de tabelas existentes. Nenhuma migration foi criada ou aplicada.

## 4. Contratos de entrada e saída

### 4.1 Criar/editar conteúdo (proposto)

**Entrada:** `project_id`, `type`, `locale`, `title`, `body`, `source_refs[]`, `claim_refs[]`, `disclosure_ref`, `version`.  
**Saída:** `content_id`, `status`, `version`, `validation_errors[]`, `missing_gates[]`.  
**Validações:** locale `en-US`; projeto autorizado; claims de risco sem fonte ficam `review`; versão stale retorna conflito; nenhuma publicação implícita.

### 4.2 Enviar para revisão (proposto)

**Entrada:** `content_id`, `version`, `requested_gate`, `actor_session`.  
**Saída:** receipt com `content_id`, `version`, `status=review`, `required_checks[]`, `correlation_id`.  
**Regra:** envio não aprova publicação, afiliado, anúncio ou deploy.

### 4.3 Aprovar/reprovar Gate (proposto)

**Entrada:** `content_id`, `version`, `gate_type`, `decision`, `reason`, sessão autenticada.  
**Saída:** decisão persistida e readback do estado.  
**Regra:** somente ator autorizado; decisão específica não se estende a outra versão ou gate.

### 4.4 Publicar/monetizar (proposto, bloqueado)

**Pré-condições:** revisão editorial, QA técnico, Sources, disclosure, asset/licença, decisão de Sergio e runtime autorizado.  
**Saída esperada:** receipt externo e readback do mesmo `content_id`/`version`.  
**Estado atual:** não implementar nem executar.

## 5. Autenticação, isolamento e segurança

- Todo request carrega `project_id` derivado de contexto autorizado no servidor; o browser não escolhe schema por valor livre.
- RLS deve ser habilitado e validado com testes positivos e negativos antes de qualquer Gate remoto.
- Service role, tokens de storage e credenciais de afiliados permanecem server-side e em referência segura.
- Sem configuração obrigatória, adapters devem falhar fechado; fake adapters são apenas desenvolvimento/teste.
- Logs e receipts registram erro sanitizado, não tokens, prompts privados ou dados de pagamento.

## 6. Estados e gates

`draft → review → blocked | awaiting_approval → approved → verifying → published`, com `rejected` retornando a `draft` com motivo.

- Conteúdo factual com claim sem fonte: `blocked` com ação requerida ao Gestor Editorial.
- Monetização/afiliado sem disclosure e validação do produto: `blocked` com owner editorial/comercial.
- Publicação, deploy, gasto, links afiliados e mutações remotas: `awaiting_approval` até decisão formal de Sergio.
- `completed` exige artefato, testes e readback; build verde isolado não encerra integração.

## 7. QA e observabilidade

- Contratos: schema de entrada/saída, status HTTP e rejeição de versão stale.
- Conteúdo: fontes, claims, linguagem YMYL, encaminhamento profissional e disclosure.
- Segurança: 401 sem sessão, 403 fora do escopo e testes de isolamento.
- Operação: `correlation_id`, projeto, job, step, início/fim, status, erro sanitizado, artefato e gate.
- Integrações: fake adapter determinístico antes de qualquer adapter externo.
- Build futuro: `npm test`, `npm run typecheck`, `npm run lint` e `npm run build` no diretório efetivo; não executados agora porque não existe aplicação Next.js neste diretório.

## 8. Critérios de aceite do card THI-005

1. **Dado** o briefing local, **a entrega deve** declarar stack proposta, escopo, fora de escopo e dependências sem inventar requisitos.
2. **Dado** o domínio editorial, **a entrega deve** listar entidades e regras de integridade para conteúdo, fontes, claims, disclosure, mídia, gates e auditoria.
3. **Dado** cada contrato proposto, **a entrega deve** registrar entrada, saída e validações observáveis.
4. **Dado** um usuário sem sessão ou fora do projeto, **a arquitetura deve** exigir 401/403 e isolamento server-side/RLS; isso permanece contrato a testar na implementação.
5. **Dado** um claim YMYL sem fonte ou monetização sem disclosure, **o fluxo deve** permanecer bloqueado com owner e ação requerida.
6. **Dado** publicação, deploy, gasto ou migration, **o documento deve** exigir Gate de Sergio e readback; nenhuma dessas ações pode ocorrer nesta tarefa.
7. **Dado** o estado atual do diretório, **o handoff deve** distinguir proposta local de implementação, aplicação e readback verificados.

## 9. Handoff e próximos passos

- **De:** Maia Mendes / Gestor Editorial
- **Para:** Théo, após validação do escopo técnico
- **Entregável:** este documento de arquitetura e contratos v1
- **Feito:** proposta local, contratos, entidades, estados, segurança, QA e Gates definidos
- **Falta:** validação de escopo, decisões de publisher/identidade, implementação real, migrations, credenciais e readbacks
- **Precisa de Gate:** qualquer SQL estrutural, deploy, publicação, monetização, links de afiliado ou alteração irreversível
- **Próximo:** registrar revisão humana do escopo; se aprovado, abrir story de implementação com paths de ownership e testes; se não, devolver este artefato com decisão explícita
- **Evidência:** arquivo local; readback independente e `git diff --check` devem ser registrados no receipt da execução
