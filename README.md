# FBR Agency Flux ⚡

Sistema ágil e direto de concepção, execução e coordenação de projetos da **FBR Agency**.

---

## 🎯 Filosofia Operacional: *Fast-Flow & Artifact-Driven*

O novo Agency Flux abandona burocracias artificiais (teatro de 10 personas trocando cartões em JSON) para focar em **entregas reais, rápidas e auditáveis**.

1. **Agente Único Multidisciplinar**: O agente/copiloto atua de ponta a ponta acionando *Skills* especializadas sob demanda.
2. **Orientação a Arquivos (*File-First*)**: O progresso é medido por artefatos reais (código, SQL, designs, artigos de blog, copys), e não por status de cartórios virtuais.
3. **Zero Deadlocks**: As etapas leem diretamente os arquivos de entrada gerados na etapa anterior.
4. **Gates Apenas para Ações Críticas**: Intervenção humana é reservada exclusivamente para decisões irreversíveis (gastos reais, publicação final e deploys em produção).

---

## 📁 Estrutura do Repositório

```text
FBR Agency Flux/
├── 01-docs/             # Documentação viva, manifesto e arquitetura enxuta
│   ├── manifesto-flux.md
│   ├── fluxo-operacional.md
│   └── prd-agency-flux.md
│
├── 02-skills/           # Habilidades modulares acionadas sob demanda
│   ├── pesquisa-mercado/
│   ├── copy-posicionamento/
│   ├── design-identidade/
│   ├── engenharia-fullstack/
│   ├── trafego-growth/
│   └── qa-auditoria/
│
├── 03-projetos/         # Hub dos projetos reais da FBR Agency
│   └── after-forty/     # Projeto piloto: brief, backlog e artefatos
│
├── app/                 # Dashboard leve de visualização e monitoramento
│
└── _legacy/             # Histórico preservado intacto da v1.0 e arquitetura antiga
```

---

## 🚀 Como Iniciar um Projeto

1. Crie uma pasta dentro de `03-projetos/<nome-do-projeto>/`
2. Crie o `brief.md` com objetivo, nicho, proposta de valor e entregáveis esperados.
3. Crie o `backlog.md` com a lista direta de tarefas (Checklist).
4. O agente executa cada frente gerando artefatos reais na pasta do projeto.
5. Valide no preview local e aprove para deploy.

---

*FBR Agency Flux — Menos burocracia, mais produto entregue.*
