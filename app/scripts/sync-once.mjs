import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

const databaseUrl = 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres';
const projectsDir = path.resolve('..', '03-projetos');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false,
  connectionTimeoutMillis: 10000
});

async function syncAllProjects() {
  try {
    const client = await pool.connect();
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });

    console.log('🔄 Sincronizando backlogs reconciliados para o PostgreSQL VPS...');

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const slug = entry.name;
        const pDir = path.join(projectsDir, slug);
        let brief = '';
        let backlog = '';
        let prompt = '';
        let updates = '';

        try { brief = await fs.readFile(path.join(pDir, 'brief.md'), 'utf-8'); } catch {}
        try { backlog = await fs.readFile(path.join(pDir, 'backlog.md'), 'utf-8'); } catch {}
        try { prompt = await fs.readFile(path.join(pDir, 'GESTOR-HERMES-PROMPT.md'), 'utf-8'); } catch {}
        try { updates = await fs.readFile(path.join(pDir, 'updates.md'), 'utf-8'); } catch {}

        if (backlog || brief || updates || prompt) {
          await client.query(`
            UPDATE custom_agency.agency_projects
            SET backlog_content = CASE WHEN $1 <> '' THEN $1 ELSE backlog_content END,
                brief_content = CASE WHEN $2 <> '' THEN $2 ELSE brief_content END,
                prompt_content = CASE WHEN $3 <> '' THEN $3 ELSE prompt_content END,
                updates_content = CASE WHEN $4 <> '' THEN $4 ELSE updates_content END,
                updated_at = NOW()
            WHERE slug = $5
          `, [backlog, brief, prompt, updates, slug]);

          const done = (backlog.match(/^-\s*\[x\]/gim) || []).length;
          const pending = (backlog.match(/^-\s*\[\s\]/gim) || []).length;
          const total = done + pending;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          console.log(`   ✅ [${slug}] => Concluídas: ${done}/${total} (${percent}%)`);
        }
      }
    }

    client.release();
    await pool.end();
    console.log('🎉 Sincronização e reconciliação concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro na sincronização:', err.message);
    await pool.end();
  }
}

syncAllProjects();
