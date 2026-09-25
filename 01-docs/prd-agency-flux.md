# PRD — FBR Agency Flux (Versão Ágil)

## 1. Visão Geral
O **FBR Agency Flux** é a plataforma de governança leve e hub de projetos da FBR Agency. Seu objetivo é permitir que a equipe e o Sergio acompanhem o status real de todos os projetos, visualizem artefatos, acessem previews e tomem decisões estratégicas sem atrito burocrático.

## 2. Requisitos Centrais

### R1. Navegação Direta de Projetos
- Listagem dos projetos ativos e arquivados da agência.
- Acesso com 1 clique a Briefing, Backlog, Documentos de Pesquisa, Conteúdos, Identidade Visual e Repositório de Código.

### R2. Visão de Progresso por Entregáveis (Artifact-Driven)
- O progresso de um projeto é calculado pelo percentual de itens concluídos no `backlog.md` e existência física dos arquivos esperados.

### R3. Centro de Decisões e Aprovações Rápidas
- Exibição limpa de itens que realmente exigem intervenção humana:
  - Aprovação de orçamento de tráfego.
  - Aprovação final de deploy em produção.
  - Registro de decisões estratégicas de produto.

### R4. Interface Moderna e Rápida
- Dashboard em Next.js / React limpo, responsivo, esteticamente agradável (dark mode / glassmorphism moderno), sem depender de workers em loop ou simulação de sockets artificiais.
