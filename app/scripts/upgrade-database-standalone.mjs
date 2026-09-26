import { Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres';

function generateInitialBrief(data) {
  return `# Briefing do Projeto: ${data.name} ⚡

---

## 📌 Identidade & Visão Geral
- **Nome do Projeto**: ${data.name}
- **Slug**: \`${data.slug}\`
- **Domínio Previsto**: \`${data.domain || `${data.slug}.fbr.news`}\`
- **Idioma / Mercado**: ${data.language || 'EN-US (Global)'}
- **Público-Alvo**: ${data.targetAudience || 'Não informado'}
- **Nicho Principal**: ${data.niche}
- **Gestor Hermes Responsável**: ${data.gestorName}
- **Posicionamento**: ${data.personaTone || 'Editorial de alta autoridade e rigor factual.'}

---

## 📖 Briefing Global & Visão Detalhada
${data.briefingText ? data.briefingText : `O projeto **${data.name}** é uma iniciativa da rede FBR News voltada a dominar o nicho de **${data.niche}** com autoridade, posicionamento claro e monetização ética.`}

---

## 💰 Modelo de Monetização
${(data.monetization || ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads']).map(m => `- [x] ${m}`).join('\n')}

---

## 🛠️ Habilidades & Skills Ativas
${(data.selectedSkills || ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']).map(s => `- \`${s}\``).join('\n')}
`;
}

function generateInitialBacklog(data) {
  return `# Backlog de Entregáveis: ${data.name}

> Gerenciado pelo **Gestor Hermes (${data.gestorName})**  
> Nicho: **${data.niche}** | Idioma: **${data.language || 'EN-US'}**

---

## 📋 Fase 1: Fundação, Identidade & Pesquisa de Mercado
- [x] **Setup Inicial do Projeto** \`01-pesquisa/setup-workspace.md\`
- [ ] **Pesquisa Profunda de Palavras-Chave & Intenção** \`01-pesquisa/keywords-intent.md\`
- [ ] **Mapeamento de Concorrentes & Gaps de Mercado** \`01-pesquisa/competitor-analysis.md\`
- [ ] **Definição de Persona Editorial & Diretrizes de Tom** \`01-pesquisa/persona-guidelines.md\`

---

## 🎨 Fase 2: Identidade Visual & Design System
- [ ] **Paleta de Cores & Tipografia** \`03-design-ui/design-tokens.md\`
- [ ] **Design de Logo & Favicon** \`03-design-ui/brand-assets.md\`
- [ ] **Wireframes & Layout da Home/Artigos** \`03-design-ui/wireframes.md\`

---

## 📝 Fase 3: Motor Editorial & Primeiros Artigos Pilares
- [ ] **Artigo Pilar 01 (Topo de Funil / Alto Volume)** \`02-conteudo/artigo-pilar-01.md\`
- [ ] **Artigo Pilar 02 (Meio de Funil / Comparativo)** \`02-conteudo/artigo-pilar-02.md\`
- [ ] **Artigo Pilar 03 (Fundo de Funil / Conversão & Review)** \`02-conteudo/artigo-pilar-03.md\`

---

## 💻 Fase 4: Engenharia & Infraestrutura Web
- [ ] **Estrutura Next.js & Integração Supabase** \`04-site/architecture.md\`
- [ ] **Implementação de SEO On-Page, Schema.org & OpenGraph** \`04-site/seo-setup.md\`
- [ ] **Páginas Obrigatórias (About, Privacy, Terms, Disclaimer)** \`04-site/legal-pages.md\`

---

## 🚀 Fase 5: QA, Monetização & Go-Live
- [ ] **Auditoria de Performance, Acessibilidade e SEO** \`01-pesquisa/qa-audit.md\`
- [ ] **Integração de Tags de Afiliados e AdSense** \`04-site/monetization-tags.md\`
- [ ] **Deploy de Produção & Verificação de Domínio** \`04-site/deployment-verification.md\`
`;
}

function generateInitialUpdates(data) {
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
  return `# Registro de Sincronização & Cobranças: ${data.name}

> Canal bidirecional entre o Publisher/Equipe e o **Gestor Hermes (${data.gestorName})**.
> Todas as pendências marcadas com \`- [ ]\` são lidas como prioridades de ação imediata pelos agentes.

---

## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)
- [ ] **[${dateStr} - ⚡ Inicialização do Projeto]**
  - **Autor**: Sergio Castro (Publisher)
  - **Instrução**: Inicializar o backlog da Fase 1, realizando a pesquisa de mercado detalhada e validação do posicionamento da persona ${data.gestorName}.
  - **Prioridade**: Alta
  - **Status**: Pendente de Resposta do Hermes

---

## 📤 Histórico de Respostas e Entregas do Hermes
- *(Nenhuma resposta registrada ainda pelo agente)*

---

## 🗄️ Histórico de Cobranças Resolvidas
- *(Nenhuma cobrança arquivada ainda)*
`;
}

function generateHermesGestorPrompt(data) {
  return `# GESTOR HERMES — PROMPT DE OPERAÇÃO DO PROJETO

Você é o **Gestor Hermes (${data.gestorName})**, o agente de IA autônomo e responsável executivo pelo projeto **"${data.name}"** no ecossistema FBR Agency Flux.

## 🎯 SEU PAPEL E MISSÃO
Sua missão é coordenar e executar com excelência todas as etapas de desenvolvimento do projeto, liderando as squads de especialistas nas áreas de pesquisa de mercado, estratégia de conteúdo, identidade visual, engenharia web e tráfego orgânico.

---

## 📌 PARÂMETROS DO PROJETO
- **Nome do Projeto**: ${data.name}
- **Slug**: \`${data.slug}\`
- **Nicho Principal**: ${data.niche}
- **Público-Alvo**: ${data.targetAudience || 'Não informado'}
- **Idioma Principal**: ${data.language || 'EN-US (Global)'}
- **Domínio**: \`${data.domain || `${data.slug}.fbr.news`}\`
- **Tom de Voz da Persona**: ${data.personaTone || 'Editorial de autoridade'}

---

## 📖 CONTEXTO & BRIEFING GLOBAL
${data.briefingText ? data.briefingText : `O projeto **${data.name}** atua no nicho de **${data.niche}** com rigor técnico, profundidade editorial e monetização inteligente.`}

---

## 💰 MONETIZAÇÃO
${(data.monetization || ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads']).map(m => `- [x] ${m}`).join('\n')}

---

## 🛠️ SUAS HABILIDADES & SKILLS ATIVAS
${(data.selectedSkills || ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']).map(s => `- Skill: \`${s}\``).join('\n')}

---

## 🔄 PROTOCOLO DE ATUAÇÃO
1. Consulte sempre \`brief.md\`, \`backlog.md\` e \`updates.md\`.
2. Ao receber novas cobranças em \`updates.md\`, priorize a entrega dos arquivos solicitados.
3. Marque as tarefas concluídas no \`backlog.md\` e reporte os resultados em \`updates.md\`.
`;
}

async function run() {
  console.log('🚀 Conectando ao PostgreSQL VPS (76.13.168.223:15432)...');
  const pool = new Pool({ connectionString: databaseUrl, ssl: false, connectionTimeoutMillis: 10000 });
  const client = await pool.connect();

  console.log('1️⃣ Criando/atualizando schema e colunas em custom_agency.agency_projects...');
  await client.query(`
    CREATE SCHEMA IF NOT EXISTS custom_agency;

    CREATE TABLE IF NOT EXISTS custom_agency.agency_projects (
      slug VARCHAR(100) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      niche VARCHAR(255),
      gestor_name VARCHAR(150),
      target_audience TEXT,
      language VARCHAR(50),
      domain VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      brief_content TEXT,
      backlog_content TEXT,
      prompt_content TEXT,
      updates_content TEXT,
      metadata JSONB,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS brief_content TEXT;
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS backlog_content TEXT;
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS prompt_content TEXT;
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS updates_content TEXT;
  `);

  console.log('2️⃣ Buscando projetos existentes no banco...');
  const res = await client.query('SELECT slug, name, niche, gestor_name, target_audience, language, domain, metadata, brief_content, backlog_content, prompt_content, updates_content FROM custom_agency.agency_projects');
  console.log(`   Encontrados ${res.rows.length} projetos já cadastrados no banco.`);

  const projectsToEnsure = [
    {
      slug: 'talk-to-your-crowd',
      name: 'Talk to Your Crowd',
      niche: 'Storefront, Sinalização e Varejo',
      gestor_name: 'Marcus Cole',
      target_audience: 'Empresas e Empreendedores',
      language: 'EN-US (Global)',
      domain: 'talk2yourcrowd.fbr.news',
      personaTone: 'Editorial sofisticado, temas transversais, transparente, baseado em evidências científicas e sem falsas promessas.',
      monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
      selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
    },
    {
      slug: 'after-forty',
      name: 'After Forty',
      niche: 'Saúde feminina 40+, Longevidade e Nutrição',
      gestor_name: 'Dra. Beatriz Bia Matos',
      target_audience: 'Mulheres 40+ anos',
      language: 'PT-BR / EN-US',
      domain: 'afterforty.fbr.news',
      personaTone: 'Acolhedor, altamente científico, baseado em evidências médicas, empático e sem falsas promessas.',
      monetization: ['Afiliados Especializados', 'Produtos Próprios', 'FBR Ads'],
      selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
    },
    {
      slug: 'sharpeye',
      name: 'SharpEye by Nadia Volkova',
      niche: 'Design, negócios e marketing',
      gestor_name: 'Nadia Volkova',
      target_audience: 'Empresas e empreendedores',
      language: 'EN-US (Global)',
      domain: 'sharpeye.fbr.news',
      personaTone: 'Editorial sofisticado, transparente, baseado em evidências científicas e sem falsas promessas.',
      monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
      selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
    },
    {
      slug: 'gamestyle',
      name: 'Game Style by Tara Lindqvist',
      niche: 'Universo gamer e acessórios',
      gestor_name: 'Tara Lindqvist',
      target_audience: 'Homens e mulheres apaixonados por games',
      language: 'EN-US (Global)',
      domain: 'gamestyle.fbr.news',
      personaTone: 'Curadoria sofisticada, transparente e útil: hardware, periféricos, setup e estilo gamer.',
      monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
      selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
    },
    {
      slug: 'thethirties',
      name: 'The Thirties by Maia Mendes',
      niche: 'Saúde, bem-estar e vida emocional para mulheres 30+',
      gestor_name: 'Maia Mendes',
      target_audience: 'Mulheres de 30 a 39 anos',
      language: 'EN-US (Global)',
      domain: 'thethirties.fbr.news',
      personaTone: 'Evidence-based living in your thirties. Humor inteligente, calor humano e sem falsas promessas.',
      monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
      selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
    }
  ];

  for (const p of projectsToEnsure) {
    const existing = res.rows.find(r => r.slug === p.slug);
    let brief = '';
    let backlog = '';
    let prompt = '';
    let updates = '';
    let metadata = {};

    if (existing) {
      metadata = existing.metadata || {};
      const pData = {
        name: existing.name || p.name,
        slug: p.slug,
        niche: existing.niche || p.niche,
        targetAudience: existing.target_audience || p.target_audience,
        language: existing.language || p.language,
        domain: existing.domain || p.domain,
        gestorName: existing.gestor_name || p.gestor_name,
        personaTone: metadata.personaTone || p.personaTone,
        briefingText: metadata.briefingText || '',
        monetization: metadata.monetization || p.monetization,
        selectedSkills: metadata.selectedSkills || p.selectedSkills
      };

      brief = existing.brief_content || (metadata.briefingText ? generateInitialBrief(pData) : generateInitialBrief(pData));
      backlog = existing.backlog_content || generateInitialBacklog(pData);
      prompt = existing.prompt_content || generateHermesGestorPrompt(pData);
      updates = existing.updates_content || generateInitialUpdates(pData);

      await client.query(`
        UPDATE custom_agency.agency_projects
        SET name = $1,
            niche = $2,
            gestor_name = $3,
            target_audience = $4,
            language = $5,
            domain = $6,
            brief_content = $7,
            backlog_content = $8,
            prompt_content = $9,
            updates_content = $10,
            metadata = $11,
            updated_at = NOW()
        WHERE slug = $12
      `, [
        pData.name,
        pData.niche,
        pData.gestorName,
        pData.targetAudience,
        pData.language,
        pData.domain,
        brief,
        backlog,
        prompt,
        updates,
        JSON.stringify(pData),
        p.slug
      ]);
      console.log(`   ✅ Projeto [${p.slug}] atualizado com 100% dos dados completos no PostgreSQL VPS.`);
    } else {
      const pData = {
        name: p.name,
        slug: p.slug,
        niche: p.niche,
        targetAudience: p.target_audience,
        language: p.language,
        domain: p.domain,
        gestorName: p.gestor_name,
        personaTone: p.personaTone,
        briefingText: '',
        monetization: p.monetization,
        selectedSkills: p.selectedSkills
      };

      brief = generateInitialBrief(pData);
      backlog = generateInitialBacklog(pData);
      prompt = generateHermesGestorPrompt(pData);
      updates = generateInitialUpdates(pData);

      await client.query(`
        INSERT INTO custom_agency.agency_projects (
          slug, name, niche, gestor_name, target_audience, language, domain, status, brief_content, backlog_content, prompt_content, updates_content, metadata, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10, $11, $12, NOW())
      `, [
        p.slug,
        p.name,
        p.niche,
        p.gestor_name,
        p.target_audience,
        p.language,
        p.domain,
        brief,
        backlog,
        prompt,
        updates,
        JSON.stringify(pData)
      ]);
      console.log(`   ✅ Projeto [${p.slug}] inserido com 100% dos dados completos no PostgreSQL VPS.`);
    }
  }

  // Validação final de contagem
  const finalCheck = await client.query('SELECT slug, name, gestor_name, length(brief_content) as brief_len, length(backlog_content) as backlog_len, length(prompt_content) as prompt_len, length(updates_content) as updates_len FROM custom_agency.agency_projects ORDER BY name ASC');
  console.log('\n📊 === TABELA custom_agency.agency_projects ATUALIZADA ===');
  console.table(finalCheck.rows);

  client.release();
  await pool.end();
  console.log('\n🎉 Sincronização e Upgrade do banco concluídos com sucesso!');
}

run().catch(err => {
  console.error('❌ Erro durante a execução:', err);
  process.exit(1);
});
