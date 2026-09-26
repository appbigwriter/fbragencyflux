import { Pool } from 'pg';
import { generateHermesGestorPrompt, generateInitialBrief, generateInitialBacklog, generateInitialUpdates } from '../src/lib/generator.js';

const databaseUrl = 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres';

async function upgradeDatabaseSchema() {
  const pool = new Pool({ connectionString: databaseUrl, ssl: false, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();

  console.log('🚀 === UPGRADE ESTRUTURAL DO BANCO POSTGRESQL VPS (custom_agency) ===\n');

  // 1. Garantir que todas as colunas necessárias existam na tabela agency_projects
  console.log('1️⃣ Criando/atualizando colunas da tabela custom_agency.agency_projects...');
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

    -- Adiciona colunas caso a tabela já existisse sem elas
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS brief_content TEXT;
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS backlog_content TEXT;
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS prompt_content TEXT;
    ALTER TABLE custom_agency.agency_projects ADD COLUMN IF NOT EXISTS updates_content TEXT;
  `);
  console.log('   ✅ Colunas atualizadas com sucesso!');

  // 2. Garantir que After Forty também exista no banco
  console.log('\n2️⃣ Verificando e populando todos os projetos oficiais no banco com 100% dos dados...');

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
    // Buscar se já existe registro
    const existing = await client.query('SELECT * FROM custom_agency.agency_projects WHERE slug = $1', [p.slug]);
    let brief = '';
    let backlog = '';
    let prompt = '';
    let updates = '';
    let metadata = {};

    const pData = {
      name: p.name,
      slug: p.slug,
      niche: p.niche,
      targetAudience: p.target_audience,
      language: p.language,
      domain: p.domain,
      gestorName: p.gestor_name,
      personaTone: p.personaTone,
      monetization: p.monetization,
      selectedSkills: p.selectedSkills
    };

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      metadata = row.metadata || {};
      brief = row.brief_content || metadata.briefingText || generateInitialBrief(pData);
      backlog = row.backlog_content || generateInitialBacklog(pData);
      prompt = row.prompt_content || generateHermesGestorPrompt(pData, '/app');
      updates = row.updates_content || generateInitialUpdates(pData);

      await client.query(`
        UPDATE custom_agency.agency_projects
        SET brief_content = $1,
            backlog_content = $2,
            prompt_content = $3,
            updates_content = $4,
            gestor_name = $5,
            domain = $6,
            metadata = $7,
            updated_at = NOW()
        WHERE slug = $8
      `, [brief, backlog, prompt, updates, p.gestor_name, p.domain || row.domain, metadata, p.slug]);
      console.log(`   ✅ Projeto [${p.slug}] atualizado com todos os conteúdos completos no banco.`);
    } else {
      brief = generateInitialBrief(pData);
      backlog = generateInitialBacklog(pData);
      prompt = generateHermesGestorPrompt(pData, '/app');
      updates = generateInitialUpdates(pData);

      await client.query(`
        INSERT INTO custom_agency.agency_projects (
          slug, name, niche, gestor_name, target_audience, language, domain, status, brief_content, backlog_content, prompt_content, updates_content, metadata, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10, $11, $12, NOW())
      `, [p.slug, p.name, p.niche, p.gestor_name, p.target_audience, p.language, p.domain, brief, backlog, prompt, updates, JSON.stringify(pData)]);
      console.log(`   ✅ Projeto [${p.slug}] inserido com 100% dos dados estruturados no banco.`);
    }
  }

  console.log('\n🎉 === UPGRADE CONCLUÍDO COM SUCESSO! 100% DOS DADOS ESTÃO SALVOS NO BANCO VPS! ===');
  client.release();
  await pool.end();
}

upgradeDatabaseSchema().catch(console.error);
