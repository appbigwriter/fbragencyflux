# Critério de E2E operacional — FBR Agency Flux

## Definição obrigatória

E2E significa testar o fluxo completo em condições operacionais, usando a interface e os serviços reais do ambiente de teste. Mock, seed estático, endpoint isolado, página sem interação ou build verde não constituem E2E

## O que o teste deve exercitar

### Interface

- abrir o dashboard
- visualizar projetos, cards, status, owners, eventos, Handoffs, artefatos, approvals e blockers
- filtrar ou localizar AF-001
- abrir detalhes do card
- executar cada ação disponível na interface
- receber confirmação visual de sucesso ou erro
- atualizar a tela e confirmar persistência
- impedir ações sem permissão

### Estado e persistência

- criar ou ler o projeto real de teste
- criar ou ler o card AF-001
- registrar os 12 artigos reais
- registrar drafts, fontes, evidências, Handoffs e artefatos reais
- registrar owners, dependências, status, gates e decisões
- recarregar a aplicação e confirmar que os dados continuam presentes
- verificar que duas leituras independentes retornam o mesmo estado

### Máquina de estados

- executar transições válidas pela interface ou API autorizada
- rejeitar transições inválidas
- registrar actor, timestamp, motivo, origem e correlation_id
- impedir conclusão sem artefato e evidência
- impedir avanço de gate sem critérios de aceite
- confirmar readback da transição no estado persistido

### Aprovações

- criar uma solicitação de aprovação real no ambiente de teste
- exibir escopo, impacto, reversibilidade e rollback
- rejeitar ator não autorizado
- registrar decisão de Sergio com data e escopo
- impedir que aprovação local seja confundida com autorização externa
- confirmar a decisão após reload e por leitura direta da API/banco

### Handoffs e evidências

- registrar Handoff com todos os campos obrigatórios
- vincular Handoff ao projeto e ao card
- vincular artefato e evidência ao job
- permitir leitura pelo próximo owner
- rejeitar Handoff sem entregável, blocker, próximo passo ou critério de aceite

### Segurança e isolamento

- autenticar o usuário
- autorizar cada ação por papel e escopo
- provar isolamento do projeto After Forty
- rejeitar acesso a dados de outro projeto
- confirmar RLS ou equivalente no ambiente remoto
- executar scan de secrets em código, resposta, log, artefato e banco
- nunca colocar secret em frontend, URL ou chat

### Falhas e recuperação

- testar API indisponível
- testar banco indisponível
- testar timeout
- testar payload inválido
- testar corrida/conflito de atualização
- confirmar erro sanitizado
- confirmar que não há estado parcialmente gravado
- executar retry idempotente quando permitido
- confirmar rollback ou estado de recuperação

### Integrações externas

- testar o adapter real contra o endpoint homologado
- validar autenticação server-side
- executar a ação autorizada em staging ou sandbox
- ler o estado externo depois da ação
- confirmar que o estado local corresponde ao estado externo
- registrar receipt, correlation_id e evidência
- não chamar integração de produção validada sem readback real

## O que não é E2E

- arrays fixos em TypeScript
- JSON seed usado sem alteração e sem readback
- mock de API
- teste unitário isolado
- snapshot visual
- HTTP 200 de health check
- build, lint ou typecheck isolados
- página que apenas exibe dados
- aprovação simulada sem persistência oficial
- relatório de agente sem reprodução independente

## Gates de conclusão

### Gate técnico local

- interface navegável
- todas as ações locais disponíveis funcionando
- estado persistente
- API e readback funcionando
- testes de sucesso e falha
- reload preserva estado
- artefatos reais do AF-001 visíveis

### Gate de homologação remota

- Control Tower implantado
- schema aplicado
- autenticação funcional
- RLS validado
- adapter real conectado
- readback remoto confirmado
- isolamento comprovado
- observabilidade e backup validados

### Gate de operação externa

- publicação, gasto, compra, candidatura, HopLink ou mutação somente com autorização explícita e datada de Sergio
- execução deve usar escopo, impacto, rollback e evidência
- readback externo obrigatório antes de declarar sucesso

## Critério final

O teste After Forty só será declarado concluído quando uma pessoa conseguir operar o fluxo pela interface, provocar transições válidas e inválidas, registrar Handoffs e approvals, recarregar e confirmar o estado, observar os artefatos reais e reproduzir os resultados sem depender de mock ou explicação verbal do agente

### Estado inicial do novo E2E After Forty

A preparação local pode usar `09-codigo/data/after-forty-intake.fixture.json` como fixture explícita, desde que seja identificada como estado inicial e não como execução. O estado mínimo deve conter apenas o projeto After Forty, `AF-001`, jobs iniciais em `planned`/`ready`, Handoffs de intake em `received`, Gates pendentes e blockers com `cause`, `owner`, `nextAction`, `resolutionPlan` e evidência. O job de Théo prepara a proposta técnica, mas não executa migration ou provisionamento remoto. Nenhum status `ready`/`received` equivale a trabalho realizado, aprovação ou autorização externa.

O fluxo local de lançamento é: `After Forty → intake Íris → Kanban Kora → jobs paralelos Bia/Rick → Handoffs → blockers/soluções → Gates → job de proposta Théo`. Banco, frontend, backend, deploy, domínio e publicação permanecem posteriores e condicionados a Gates específicos e readback.

A entrega final deve separar:

- implementado
- verificado operacionalmente
- verificado remotamente
- aguardando autorização
- bloqueado por dependência real
- não implementado
