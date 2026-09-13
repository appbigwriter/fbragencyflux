# Escopo aprovado do FBR Agency Flux

## Definição

O FBR Agency Flux é a ferramenta transversal da FBR Agency que mantém todos os agentes acordados, informados e dentro dos eixos. Ele transforma a concepção de um projeto em um plano coordenado, distribui o trabalho, acompanha a execução da concepção em tempo real e verifica o que foi concluído

## Fase 1 — concepção coordenada e controlada

A Fase 1 deve:

- receber e interpretar o arquivo conceitual do projeto
- organizar briefing, escopo e fora de escopo
- definir objetivos e critérios de aceite
- identificar e distribuir responsabilidades aos agentes
- verificar skills existentes
- criar ou solicitar novas skills quando necessárias
- verificar workflows existentes
- criar ou solicitar workflows necessários
- treinar e informar os agentes sobre o projeto
- criar knowledge packs e contexto específico quando necessário
- controlar dependências entre jobs e agentes
- controlar Gates e aprovações
- registrar Handoffs, decisões, hipóteses, riscos e blockers
- acompanhar em tempo real quem está fazendo cada tarefa
- mostrar status real de cada tarefa
- mostrar percentual ou etapa de conclusão baseado em evidência
- verificar se o entregável foi produzido
- identificar atrasos, falhas e ausência de resposta
- manter todos os agentes sincronizados com a versão vigente do projeto
- entregar o pacote completo de concepção pronto para execução

### Controle em tempo real da Fase 1

O dashboard da Fase 1 deve permitir visualizar:

- projeto ativo
- job atual
- agente responsável
- agente que está executando
- status do job
- início, última atualização e conclusão
- dependências bloqueantes
- Gates pendentes
- artefatos esperados e recebidos
- Handoffs enviados e recebidos
- evidências anexadas
- erros e tentativas
- próximo responsável
- percentual de conclusão calculado a partir dos jobs aceitos

O status não pode ser inventado por seed ou atualizado somente manualmente. Deve refletir eventos, Handoffs e artefatos registrados pelo fluxo

### Entrega da Fase 1

Ao final, o Flux deve entregar:

- briefing normalizado
- escopo e fora de escopo
- objetivos
- agentes e ownership
- skills verificadas, criadas ou solicitadas
- workflows verificados, criados ou solicitados
- treinamento/contexto dos agentes
- arquitetura conceitual
- jobs distribuídos
- dependências
- critérios de aceite
- Gates
- riscos e blockers
- Handoffs
- decisões de Sergio
- status de conclusão por job
- histórico de eventos
- pacote conceitual pronto para a execução do projeto

## Fase 2 — gestão contínua e governança dos projetos

A Fase 2 guiará a gestão, o acompanhamento e a governança dos projetos de todos os agentes nas áreas de:

- Marketing
- Vendas
- Suporte
- Machine Learning

A governança da Fase 2 será responsável por manter os processos adequados à realidade. Ela deverá revisar, aprimorar e adaptar continuamente workflows, responsabilidades, skills, critérios, métricas, Gates e controles sempre que os projetos apresentarem novas necessidades, riscos, aprendizados, mudanças de mercado ou condições operacionais

A adaptação deve ser rastreável: toda mudança relevante registra motivo, evidência, impacto, owner, versão, critérios de aceite e eventual aprovação de Sergio. O processo pode evoluir, mas não pode perder histórico, ownership, segurança ou controle de Gates

A Fase 2 deve transformar o que foi aprendido e definido na Fase 1 em execução contínua, acompanhando:

- tarefas recorrentes
- metas e indicadores
- campanhas
- vendas e ofertas
- atendimento e suporte
- aprendizado de máquina e seus ciclos
- desempenho dos agentes
- melhorias de processo
- novos riscos e dependências
- resultados e feedbacks

## Relação com os projetos executores

A Fase 1 do Flux concebe, organiza, treina, informa e controla a concepção em tempo real. Os projetos e agentes especializados executam as entregas definidas nos seus próprios ambientes

No piloto After Forty:

```text
FBR Flux Fase 1
→ concepção, organização, skills, workflows, treinamento, dependências, Gates e controle em tempo real

FBR Blogs + agentes especializados
→ execução do blog conforme o pacote conceitual aprovado

FBR Flux Fase 2
→ gestão contínua de marketing, vendas, suporte e aprendizado de máquina
```

## Interação de Sergio

Sergio deve interagir por decisões simples e objetivas, visualizando o estado real antes de decidir. O Flux deve solicitar aprovação somente quando a decisão exigir autoridade humana, como escopo, risco, gasto, publicação ou ação irreversível

Cada solicitação deve mostrar:

- decisão necessária
- contexto
- impacto
- evidências
- custo
- risco
- reversibilidade
- rollback
- opções Aprovar, Rejeitar ou Solicitar alteração

## Critério de conclusão da Fase 1

A Fase 1 só estará concluída quando o Flux receber um conceito e produzir o pacote completo de concepção, mantendo o trabalho dos agentes visível em tempo real e comprovando, por eventos, Handoffs e artefatos, o status de cada job

Uma página estática, mock, seed não atualizado ou relatório sem readback não satisfaz esse critério
