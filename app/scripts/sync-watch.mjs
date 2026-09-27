import { Pool } from 'pg';
import fs from 'fs/promises';
import { watch } from 'fs';
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

    console.log('🔄 Sincronizando backlogs reais de todos os agentes para o PostgreSQL VPS...');

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
          const percent = Math.round((done / (done + pending || 1)) * 100);
          console.log(`   ✅ [${slug}] => Concluídas: ${done}/${done + pending} (${percent}%)`);
        }
      }
    }

    client.release();
    console.log('🎉 Sincronização inicial concluída com sucesso!');
  } catch (err) {
    console.error('❌ Erro na sincronização:', err.message);
  }
}

async function syncSingleProject(slug, fileChanged) {
  try {
    const client = await pool.connect();
    const pDir = path.join(projectsDir, slug);
    const filePath = path.join(pDir, fileChanged);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      let field = '';
      if (fileChanged === 'backlog.md') field = 'backlog_content';
      else if (fileChanged === 'brief.md') field = 'brief_content';
      else if (fileChanged === 'updates.md') field = 'updates_content';
      else if (fileChanged === 'GESTOR-HERMES-PROMPT.md') field = 'prompt_content';

      if (field) {
        await client.query(`
          UPDATE custom_agency.agency_projects
          SET ${field} = $1, updated_at = NOW()
          WHERE slug = $2
        `, [content, slug]);

        if (fileChanged === 'backlog.md') {
          const done = (content.match(/^-\s*\[x\]/gim) || []).length;
          const pending = (content.match(/^-\s*\[\s\]/gim) || []).length;
          console.log(`⚡ [AUTO-SYNC] Projeto '${slug}' atualizou backlog: ${done}/${done + pending} tarefas concluídas!`);
        } else {
          console.log(`⚡ [AUTO-SYNC] Projeto '${slug}' atualizou ${fileChanged} no banco VPS.`);
        }
      }
    } catch {}

    client.release();
  } catch (err) {
    console.error(`Erro ao sincronizar ${slug}/${fileChanged}:`, err.message);
  }
}

async function startWatcher() {
  await syncAllProjects();

  console.log(`\n👀 Monitorando alterações em tempo real em ${projectsDir}...`);

  let debounceTimer = null;
  try {
    watch(projectsDir, { recursive: true }, (eventType, filename) => {
      if (!filename) return;
      const normalized = filename.replace(/\\/g, '/');
      const parts = normalized.split('/');

      if (parts.length >= 2) {
        const slug = parts[0];
        const fileName = parts[parts.length - 1];

        if (['backlog.md', 'brief.md', 'updates.md', 'GESTOR-HERMES-PROMPT.md'].includes(fileName)) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            syncSingleProject(slug, fileName);
          }, 300);
        }
      }
    });
  } catch (err) {
    console.error('Aviso ao iniciar watcher:', err.message);
  }
}

startWatcher();
