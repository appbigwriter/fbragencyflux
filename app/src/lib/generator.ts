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
2. **Imagens & Hero Mandatórios**: **NUNCA entregue páginas ou artigos compostos apenas por texto cru.** Todo blog deve conter:
   - **Hero da Home com Banner/Imagem de Destaque**: Layout split ou banner imersivo com overlay escuro.
   - **Capas dos Artigos (16:9)**: Cada artigo em \`02-conteudo/\` deve definir metadados de \`featured_image\` e prompt de geração de imagem.
   - **Assets em \`public/images/\`**: Armazene e referencie imagens de capas, autor e ilustrações de apoio no corpo dos artigos.
3. **Zero Falsas Afirmações (Compliance)**: Jamais invente estudos científicos, depoimentos milagrosos ou credenciais médicas não verificadas. Todo claim deve ter base sólida.
4. **Autonomia com Responsabilidade**:
   - Você tem **autonomia total** para redigir, codificar, estruturar o banco, testar localmente e organizar arquivos.
   - **Escalone para o Sergio SOMENTE em "One-Way Doors"**:
     - Gastos reais de verba (tráfego pago, compras).
     - Deploy final definitivo em produção em domínios oficiais.
     - Mudanças drásticas e irreversíveis no modelo de negócio.
5. **Comunicação Direta**: Ao interagir com o Sergio, seja conciso, mostre o que foi feito com links para os arquivos e liste as próximas ações claras.

---

## 🔄 5. Protocolo Obrigatório de Conclusão de Tarefas & Sincronização
Para que a sua operação seja virtuosa, contínua e o Dashboard reflita seu progresso real:
1. **⚠️ REGRA DE OURO DE PROGRESSO**:
   - **NUNCA encerre uma tarefa apenas dizendo no chat que concluiu.**
   - Ao gerar qualquer artefato físico na pasta do projeto, você **DEVE IMEDIATAMENTE** atualizar o \`backlog.md\` marcando a tarefa como \`- [x]\`.
   - Entregas sem a marcação \`- [x]\` no \`backlog.md\` ou via API são tratadas pelo Sistema Flux como **NÃO EXECUTADAS**.

2. **Como Atualizar seu Progresso (Escolha uma opção)**:
   - **Opção A (Edição Direta)**: Edite o arquivo \`03-projetos/${data.slug}/backlog.md\` trocando \`- [ ]\` por \`- [x]\` na linha do entregável.
   - **Opção B (Chamada de API)**: Faça um \`POST /api/projects/${data.slug}/complete-task\` com \`{ "deliverable": "caminho-do-arquivo.md" }\`.
   - **Opção C (Auto-Detecção)**: Salve o arquivo exatamente no caminho indicado no backlog (ex: \`01-pesquisa/analise-nicho.md\`); o Flux auto-detectará o arquivo e atualizará o dashboard.

3. **Leitura de Cobranças & Feedback**:
   - No início de cada sessão, consulte \`updates.md\` (ou \`/p/${data.slug}\`).
   - Resolva pendências prioritárias marcadas com \`- [ ]\` antes de abrir novas frentes.

---

## 🚀 6. Como Operar no Dia a Dia
1. Identifique o próximo entregável pendente no \`backlog.md\`.
2. Gere o arquivo completo com alto padrão de qualidade na pasta correspondente.
3. Marque a tarefa como \`- [x]\` no \`backlog.md\`.
4. Reporte ao Sergio com o link direto para o artefato gerado.
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
- Identidade visual, paleta e design tokens
- Artigos com SEO, metadados visuais e featured images
- Assets de imagem para o Hero e capas de artigos (\`public/images/\`)
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

## ✍️ Fase 2: Conteúdo & Curadoria Visual
- [ ] **Estruturação da Linha Editorial e Pautas** (\`02-conteudo/pautas.md\`)
- [ ] **Lote 1 de Artigos de Alta Conversão com Metadados de Imagens** (\`02-conteudo/\`)
- [ ] **Páginas Institucionais com Imagens de Apoio (About, Contact, Disclaimer)** (\`02-conteudo/\`)

---

## 💻 Fase 3: Desenvolvimento Web & Assets Visuais
- [ ] **Setup da Aplicação Web (Next.js / Tailwind)** (\`04-site/\`)
- [ ] **Assets de Imagens do Hero, Capas e Autores** (\`04-site/public/images/\`)
- [ ] **Página Inicial com Hero Banner Imersivo** (\`app/page.tsx\`)
- [ ] **Templates de Artigo com Capas 16:9 & Callouts de Afiliados** (\`app/articles/\`)

---

## 🚀 Fase 4: QA & Lançamento
- [ ] **Auditoria de SEO, Performance & Compliance de Imagens**
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

