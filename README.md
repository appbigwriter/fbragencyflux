# FBR Agency Flux

Camada transversal de concepção, governança e coordenação dos projetos da FBR Agency

## Escopo da versão 1.0

A versão 1.0 é dedicada à concepção coordenada e controlada dos projetos. O Flux recebe o conceito, organiza o escopo, informa e treina os agentes, verifica ou cria skills e workflows necessários, controla dependências e Gates e acompanha em tempo real quem está fazendo cada job, seu status e sua conclusão baseada em evidência

A versão 1.0 do Flux não é o executor técnico de todos os deploys, mas coordena a concepção e o encaminhamento dos projetos para os owners de execução. O piloto After Forty continua sendo uma entrega completa da FBR Agency, executada pelo FBR Blogs e pelos agents especializados

## Objetivo

Definir o modelo comum de concepção, intake, escopo, arquitetura conceitual, agentes, ownership, critérios de aceite, Handoffs, evidências e Gates dos projetos da FBR Agency

O Flux não substitui os projetos específicos, o Control Tower, o Kanban da Kora ou os agents especialistas. Ele define os contratos e regras que conectam essas partes

## Versão 2.0 — gestão, acompanhamento e governança

Na versão 2.0, o Flux guiará os workflows de gestão, acompanhamento e governança dos projetos nas áreas de:

- Marketing
- Vendas
- Suporte
- Machine Learning

A governança manterá os processos em evolução contínua, aprimorando e adaptando workflows, responsabilidades, skills, critérios, métricas e Gates conforme novas realidades, necessidades, riscos e aprendizados dos projetos. Mudanças relevantes deverão ter motivo, evidência, impacto, owner, versão, critérios de aceite e aprovação quando exigida

## Estrutura

```text
/01-conceitual
/02-prd
/03-arquitetura
/04-database
/05-workflows
/06-design
/07-marketing
/08-historico
/09-codigo
README.md
```

## Fonte de referência

O diretório histórico `F:\Projetos\_Sistemas\BigFlux` será tratado como fonte de referência técnica para extração de padrões, não como autoridade automática. Qualquer componente, decisão ou contrato reaproveitado deverá ser validado e registrado neste projeto

## Skill compartilhada

A skill operacional compartilhada está em:

`F:\Projetos\_FBR-Agency\skills-time\fbr-agency-flux\SKILL.md`

Ela deve orientar todos os agents Hermes da equipe

## Governança inicial

- Sergio aprova decisões de produto, arquitetura, produção, publicação, gastos e ações irreversíveis
- Íris coordena intake, escopo e delegação
- Kora controla o estado operacional no Kanban
- Théo executa engenharia e infraestrutura
- Gabe executa QA e valida gates
- Todos os agents devem registrar handoffs, evidências, riscos e blockers
- Secrets permanecem no Secret Manager ou runtime, seguindo Zero Secret Leaks

## Dashboard local

O dashboard mínimo está em `09-codigo` e usa somente dados mock locais. Ele mostra projetos, cards ativos, aprovações pendentes, bloqueios e eventos recentes

```bash
cd 09-codigo
npm install
npm run dev
```

Validação completa:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Estado atual

A fundação documental, DDL e dashboard local estão implementados. A base histórica no Supabase ainda depende da configuração segura do Control Tower e será criada somente após validação do contrato de dados

- Implementado: schema inicial, fluxo genérico e superfície local de revisão
- Verificado: testes, typecheck, lint e build do app local
- Bloqueado: provisionamento externo, aplicação do DDL e adapter Supabase sem contrato/credencial de runtime
- Segurança: nenhum secret é necessário ou incluído no projeto
