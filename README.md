# FBR Agency Flux

Camada transversal de governança, orquestração, execução e auditoria dos projetos da FBR Agency

## Objetivo

Definir o fluxo comum para intake, planejamento, delegação entre agents, Kanban, gates de aprovação, handoffs, evidências, QA, publicação, deploy e histórico dos projetos da FBR Agency

O Flux não substitui os projetos específicos, o Control Tower, o Kanban da Kora ou os agents especialistas. Ele define os contratos e regras que conectam essas partes

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
