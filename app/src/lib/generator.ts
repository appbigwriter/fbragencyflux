export interface ProjectCreationData {
  name: string;
  slug: string;
  publisher?: string;
  niche: string;
  targetAudience: string;
  language: string;
  domain?: string;
  monetization: string[];
  gestorName: string;
  personaTone: string;
  briefingText?: string;
  keyDeliverables?: string[];
  selectedSkills: string[];
}

export function generateHermesGestorPrompt(data: ProjectCreationData, workspaceRoot: string): string {
  const skillsListFormatted = data.selectedSkills.map(skill => {
    const skillPath = `${workspaceRoot}/02-skills/${skill}/SKILL.md`;
    return `- **Skill: \`${skill}\`**
  - Diretriz: [02-skills/${skill}/SKILL.md](${skillPath})
  - Aplicação no projeto: Consultar para orientar a geração de entregáveis desta disciplina.`;
  }).join('\n');

  const monetizationText = data.monetization.length > 0 
    ? data.monetization.join(', ') 
    : 'Afiliados, Tráfego Direto e Produtos Próprios';

  const globalBriefingSection = data.briefingText?.trim() 
    ? `\n---\n\n## 📖 Contexto & Briefing Global do Projeto\n${data.briefingText.trim()}\n`
    : '';

  return `# SYSTEM PROMPT — Agente Gestor Hermes: ${data.gestorName} (${data.name}) ⚡

Você é o **${data.gestorName}**, Agente Gestor de IA da **FBR Agency** encarregado da liderança técnica, editorial e de execução do projeto **${data.name}**.

Seu interlocutor direto é o **Sergio Castro** (Publisher/Fundador da FBR Agency).

---

## 🎯 1. Missão do Projeto
- **Projeto**: ${data.name}
- **Nicho & Mercado**: ${data.niche}
- **Público-Alvo**: ${data.targetAudience}
- **Idioma Principal**: ${data.language}
- **Domínio Previsto**: ${data.domain || 'A definir'}
- **Modelo de Monetização**: ${monetizationText}
- **Tom de Voz & Postura**: ${data.personaTone || 'Editorial premium, baseado em evidências, acolhedor e direto'}${globalBriefingSection}
---

## 🧠 2. Skills Obrigatórias do Projeto
Você deve operar com maestria multidisciplinar utilizando as diretrizes e frameworks da FBR Agency:

${skillsListFormatted}

> **Instrução de Uso das Skills**: Ao executar tarefas de pesquisa, redação de copy, criação visual ou código, leia diretamente as instruções de cada skill listada acima para manter o padrão de excelência da agência.

---

## 📁 3. Estrutura de Pastas e Artefatos do Projeto
Todos os arquivos e entregáveis devem ser lidos e gerados diretamente na pasta do projeto:
\`${workspaceRoot}/03-projetos/${data.slug}/\`

- \`brief.md\`: Briefing consolidado e visão do projeto.
- \`backlog.md\`: Checklist de progresso real e entregáveis.
- \`01-pesquisa/\`: Análise de nicho, concorrência, dores e palavras-chave.
- \`02-conteudo/\`: Artigos de conversão, pautas, newsletters e copys.
- \`03-design-ui/\`: Design tokens, paleta de cores, tipografia e assets visuais.
- \`04-site/\`: Código-fonte da aplicação web / blog em Next.js.

---

## ⚖️ 4. Regras de Ouro da FBR Agency
1. **Foco no Artefato Real**: Não simule burocracia nem gere relatórios vazios. Escreva o artigo, crie o componente de código ou faça a pesquisa no arquivo correspondente.
2. **Zero Falsas Afirmações (Compliance)**: Jamais invente estudos científicos, depoimentos milagrosos ou credenciais médicas não verificadas. Todo claim deve ter base sólida.
3. **Autonomia com Responsabilidade**:
   - Você tem **autonomia total** para redigir, codificar, estruturar o banco, testar localmente e organizar arquivos.
   - **Escalone para o Sergio SOMENTE em "One-Way Doors"**:
     - Gastos reais de verba (tráfego pago, compras).
     - Deploy final definitivo em produção em domínios oficiais.
     - Mudanças drásticas e irreversíveis no modelo de negócio.
4. **Comunicação Direta**: Ao interagir com o Sergio, seja conciso, mostre o que foi feito com links para os arquivos e liste as próximas ações claras.

---

## 🔄 5. Protocolo Obrigatório de Sincronização Contínua & Cobranças
Para que a sua operação seja virtuosa, contínua e alinhada com o Sergio e o Sistema Flux:
1. **Leitura Obrigatória de Updates (\`updates.md\` ou Web URL \`/p/${data.slug}\`)**:
   - No início de qualquer sessão ou tarefa, consulte a seção de **Observações e Cobranças Ativas** em \`updates.md\`.
   - Se houver diretrizes editoriais, correções ou cobranças de prazo pendentes, trate-as com **prioridade máxima** antes de avançar para novos entregáveis.
2. **Ciclo Virtuoso de Execução & Reporte**:
   - Ao executar ou revisar um entregável cobrado, gere o arquivo físico correspondente na pasta \`03-projetos/${data.slug}/\`.
   - Atualize o status no \`backlog.md\` marcando a tarefa concluída (\`- [x]\`).
   - Registre a resolução no \`updates.md\` na seção de *Histórico de Updates Atendidos* com a data, o que foi entregue e o caminho do arquivo.
3. **Comunicação Direta com o Sergio**:
   - Apresente sempre links objetivos para os arquivos gerados.
   - Em caso de dúvidas operacionais ou bloqueios, solicite a orientação do Sergio imediatamente.

---

## 🚀 6. Como Iniciar o Trabalho
Ao iniciar uma sessão com o Sergio:
1. Revise \`updates.md\` (cobranças ativas) e \`backlog.md\` (próximos entregáveis).
2. Identifique a próxima entrega prioritária.
3. Execute e gere o artefato físico correspondente com excelência.
4. Atualize o status no \`backlog.md\` e \`updates.md\` e reporte de forma limpa.
`;
}

export function generateInitialBrief(data: ProjectCreationData): string {
  const briefingSection = data.briefingText?.trim()
    ? `\n---\n\n## 📖 Briefing Global & Visão Detalhada\n${data.briefingText.trim()}\n`
    : '';

  return `# Briefing do Projeto: ${data.name} ⚡

## 📌 Identidade & Visão Geral
- **Nome do Projeto**: ${data.name}
- **Publisher**: ${data.publisher || 'FBR Agency (sergio@fbr.news)'}
- **Domínio Previsto**: ${data.domain || 'https://' + data.slug + '.fbr.news'}
- **Idioma / Mercado**: ${data.language}
- **Público-Alvo**: ${data.targetAudience}
- **Nicho Principal**: ${data.niche}
- **Gestor Hermes Responsável**: ${data.gestorName}${briefingSection}
---

## 🎯 Pilares & Proposta de Valor
- **Posicionamento**: ${data.personaTone || 'Editorial premium focado em alta autoridade e engajamento.'}
- **Monetização**: ${data.monetization.join(', ') || 'Afiliados e Ads'}

---

## 📄 Entregáveis Chave
${(data.keyDeliverables && data.keyDeliverables.length > 0)
  ? data.keyDeliverables.map(d => `- ${d}`).join('\n')
  : `- Pesquisa de nicho e personas
- Identidade visual e design tokens
- Artigos e pautas com SEO e conversão
- Aplicação web / blog responsivo de alta performance`}
`;
}

export function generateInitialBacklog(data: ProjectCreationData): string {
  return `# Backlog de Execução: ${data.name} ⚡

Acompanhamento direto e transparente dos entregáveis do projeto.

---

## 🏁 Fase 1: Fundação & Inteligência
- [x] **Briefing e Escopo Definido** (\`brief.md\`)
- [x] **Agente Gestor Hermes Configurado** (\`GESTOR-HERMES-PROMPT.md\`)
- [ ] **Pesquisa de Mercado e Palavras-Chave** (\`01-pesquisa/analise-nicho.md\`)
- [ ] **Design Tokens & Identidade Visual** (\`03-design-ui/tokens.css\`)

---

## ✍️ Fase 2: Conteúdo & Copywriting
- [ ] **Estruturação da Linha Editorial e Pautas** (\`02-conteudo/pautas.md\`)
- [ ] **Lote 1 de Artigos de Alta Conversão** (\`02-conteudo/\`)
- [ ] **Páginas Institucionais (About, Contact, Disclaimer)** (\`02-conteudo/\`)

---

## 💻 Fase 3: Desenvolvimento Web
- [ ] **Setup da Aplicação Web (Next.js / Tailwind)** (\`04-site/\`)
- [ ] **Página Inicial & Layout Editorial**
- [ ] **Templates de Artigo & Callouts de Afiliados**

---

## 🚀 Fase 4: QA & Lançamento
- [ ] **Auditoria de SEO, Performance & Compliance**
- [ ] **Aprovação do Gate Final de Deploy**
`;
}

export function generateInitialUpdates(data: ProjectCreationData): string {
  const dateStr = new Date().toISOString().split('T')[0];
  return `# 📢 Sincronização & Cobranças: ${data.name} ⚡

Canal ativo de comunicação, observações e cobranças entre o Publisher (Sergio Castro / Sistema Flux) e o Agente Gestor Hermes (**${data.gestorName}**).

---

## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)
- [ ] **[${dateStr} - 🎯 Inicialização do Projeto]**
  - **Autor**: Sergio Castro (Publisher) / Sistema Flux
  - **Instrução**: Inicializar as atividades de pesquisa de mercado e definição dos tokens de design conforme o briefing.
  - **Entregável**: \`01-pesquisa/analise-nicho.md\` e \`03-design-ui/tokens.css\`
  - **Prioridade**: Alta
  - **Status**: Pendente de Resposta do Hermes

---

## ✅ Histórico de Updates Atendidos & Resoluções
- Nenhum update arquivado ainda. Conforme as cobranças forem atendidas, mova-as para esta seção com o link do entregável.
`;
}

