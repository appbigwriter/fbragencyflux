import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

const databaseUrl = 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres';
const projectsDir = path.resolve('..', '03-projetos');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false
});

function countBacklogTasks(backlogContent) {
  if (!backlogContent) return { completedTasks: 0, totalTasks: 0, percent: 0 };
  const completedMatches = backlogContent.match(/^-\s*\[x\]/gim);
  const pendingMatches = backlogContent.match(/^-\s*\[\s\]/gim);
  const completedTasks = completedMatches ? completedMatches.length : 0;
  const pendingTasks = pendingMatches ? pendingMatches.length : 0;
  const totalTasks = completedTasks + pendingTasks;
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return { completedTasks, totalTasks, percent };
}

async function auditAllAgents() {
  console.log('🔍 INICIANDO AUDITORIA COMPLETA DE TODOS OS AGENTES E PROJETOS...\n');

  const res = await pool.query('SELECT slug, name, gestor_name, niche, language, domain, brief_content, backlog_content, prompt_content, updates_content FROM custom_agency.agency_projects ORDER BY slug');
  
  for (const dbRow of res.rows) {
    const slug = dbRow.slug;
    const pDir = path.join(projectsDir, slug);
    console.log(`========================================================================`);
    console.log(`📁 PROJETO: ${dbRow.name} (slug: ${slug})`);
    console.log(`========================================================================`);
    
    // 1. Verificar Gestor
    console.log(`👤 Gestor no Banco VPS: "${dbRow.gestor_name}"`);

    // 2. Verificar arquivos físicos existentes
    let localFiles = [];
    try {
      async function scan(dir, base = '') {
        const items = await fs.readdir(dir, { withFileTypes: true });
        for (const item of items) {
          const rel = path.join(base, item.name).replace(/\\/g, '/');
          if (item.isDirectory()) {
            await scan(path.join(dir, item.name), rel);
          } else {
            const s = await fs.stat(path.join(dir, item.name));
            localFiles.push({ path: rel, size: s.size });
          }
        }
      }
      await scan(pDir);
    } catch (err) {
      console.log(`⚠️ Erro ao ler pasta local: ${err.message}`);
    }

    console.log(`📂 Total de arquivos físicos locais: ${localFiles.length}`);
    localFiles.forEach(f => {
      console.log(`   - ${f.path} (${f.size} bytes)`);
    });

    // 3. Comparar Backlog Banco vs Disco
    let localBacklog = '';
    try {
      localBacklog = await fs.readFile(path.join(pDir, 'backlog.md'), 'utf-8');
    } catch {}

    const dbCounts = countBacklogTasks(dbRow.backlog_content);
    const localCounts = countBacklogTasks(localBacklog);

    console.log(`\n📊 Contagem de Tarefas:`);
    console.log(`   - Banco VPS: ${dbCounts.completedTasks}/${dbCounts.totalTasks} (${dbCounts.percent}%)`);
    console.log(`   - Disco Local: ${localCounts.completedTasks}/${localCounts.totalTasks} (${localCounts.percent}%)`);
    
    const isSynced = (dbCounts.completedTasks === localCounts.completedTasks) && (dbCounts.totalTasks === localCounts.totalTasks);
    console.log(`   - Sincronização: ${isSynced ? '✅ 100% Sincronizado' : '❌ Divergente'}`);

    // 4. Verificar Gestor no Briefing e Prompt
    let promptGestor = '';
    const promptMatch = (dbRow.prompt_content || '').match(/Você é o \*\*([^*]+)\*\*/i);
    if (promptMatch) promptGestor = promptMatch[1];
    
    console.log(`   - Gestor no Prompt: "${promptGestor}"`);
    console.log('\n');
  }

  await pool.end();
}

auditAllAgents().catch(console.error);
