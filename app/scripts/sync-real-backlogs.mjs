import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres',
  ssl: false
});

const projectsDir = path.resolve('..', '03-projetos');

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

async function main() {
  const slugs = ['after-forty', 'gameraesthetic', 'sharpeye', 'talk-to-your-crowd', 'thethirties'];
  
  console.log('🔄 Gravando backlogs reais do disco diretamente no PostgreSQL VPS...');
  
  for (const slug of slugs) {
    const pPath = path.join(projectsDir, slug, 'backlog.md');
    if (fs.existsSync(pPath)) {
      const content = fs.readFileSync(pPath, 'utf-8');
      const counts = countBacklogTasks(content);
      
      const query = 'UPDATE custom_agency.agency_projects SET backlog_content = $1, updated_at = NOW() WHERE slug = $2';
      await pool.query(query, [content, slug]);
      
      console.log(`✅ [${slug}] gravado com sucesso no VPS => ${counts.completedTasks}/${counts.totalTasks} (${counts.percent}%)`);
    } else {
      console.warn(`⚠️ Arquivo não encontrado: ${pPath}`);
    }
  }

  // Verifica os dados gravados no banco
  console.log('\n📊 Conferencia direta dos dados no PostgreSQL VPS:');
  const res = await pool.query('SELECT slug, name, backlog_content FROM custom_agency.agency_projects ORDER BY slug');
  for (const row of res.rows) {
    const counts = countBacklogTasks(row.backlog_content || '');
    console.log(`   📌 ${row.name} (${row.slug}): ${counts.completedTasks}/${counts.totalTasks} (${counts.percent}%)`);
  }

  await pool.end();
  console.log('\n🎉 Sincronização 100% concluída!');
}

main().catch(async (err) => {
  console.error('Erro:', err);
  await pool.end();
});
