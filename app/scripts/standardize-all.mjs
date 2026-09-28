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

const GESTORES = {
  'after-forty': { name: 'After Forty by Heidi Braun', gestor: 'Heidi Braun' },
  'gamestyle': { name: 'Game Style by Tara Lindqvist', gestor: 'Tara Lindqvist' },
  'sharpeye': { name: 'SharpEye by Nadia Volkova', gestor: 'Nadia Volkova' },
  'talk-to-your-crowd': { name: 'Talk to Your Crowd', gestor: 'Marcus Cole' },
  'thethirties': { name: 'The Thirties by Maia Mendes', gestor: 'Maia Mendes' }
};

async function fixAndStandardizeAll() {
  const client = await pool.connect();
  console.log('🧹 Padronizando nomes de gestores e sincronizando backlogs 100%...\n');

  try {
    for (const [slug, meta] of Object.entries(GESTORES)) {
      const pPath = path.join(projectsDir, slug, 'backlog.md');
      let backlog = '';
      if (fs.existsSync(pPath)) {
        backlog = fs.readFileSync(pPath, 'utf-8');
      }

      const counts = countBacklogTasks(backlog);

      await client.query(`
        UPDATE custom_agency.agency_projects
        SET name = $1,
            gestor_name = $2,
            backlog_content = CASE WHEN $3 <> '' THEN $3 ELSE backlog_content END,
            updated_at = NOW()
        WHERE slug = $4
      `, [meta.name, meta.gestor, backlog, slug]);

      console.log(`✅ [${slug}] => Gestor: "${meta.gestor}" | Backlog: ${counts.completedTasks}/${counts.totalTasks} (${counts.percent}%)`);
    }
  } finally {
    client.release();
  }

  await pool.end();
  console.log('\n🎉 Todos os 5 projetos padronizados com sucesso!');
}

fixAndStandardizeAll().catch(console.error);
