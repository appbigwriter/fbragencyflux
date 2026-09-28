import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres',
  ssl: false
});

const projectsDir = fs.existsSync(path.resolve('03-projetos')) 
  ? path.resolve('03-projetos') 
  : path.resolve('..', '03-projetos');

function countTasks(content) {
  if (!content) return { completed: 0, total: 0, percent: 0 };
  const done = (content.match(/^-\s*\[[xX]\]/gm) || []).length;
  const pending = (content.match(/^-\s*\[\s\]/gm) || []).length;
  const total = done + pending;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { completed: done, total, percent };
}

async function validateProjectForCron(slug) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT slug, name, gestor_name, backlog_content, updated_at FROM custom_agency.agency_projects WHERE slug = $1', [slug]);
    if (res.rows.length === 0) {
      throw new Error(`[CRON ERROR] Projeto '${slug}' não cadastrado no banco.`);
    }

    const dbRow = res.rows[0];
    const dbBacklog = dbRow.backlog_content || '';
    const dbCounts = countTasks(dbBacklog);

    // Leitura do arquivo local em disco
    const localBacklogPath = path.join(projectsDir, slug, 'backlog.md');
    let localBacklog = '';
    if (fs.existsSync(localBacklogPath)) {
      localBacklog = fs.readFileSync(localBacklogPath, 'utf-8');
    }
    const localCounts = countTasks(localBacklog);

    // Validação de Integridade
    const dbHash = crypto.createHash('sha256').update(dbBacklog).digest('hex').substring(0, 8);
    const localHash = crypto.createHash('sha256').update(localBacklog).digest('hex').substring(0, 8);

    if (dbCounts.total !== localCounts.total || dbCounts.completed !== localCounts.completed) {
      console.error(`🚨 ERRO DE SINCRONIZAÇÃO [${slug}]: Discrepância entre Banco (${dbCounts.completed}/${dbCounts.total}) e Disco (${localCounts.completed}/${localCounts.total})`);
      return {
        status: 'SYNC_ERROR',
        message: 'ERRO DE SINCRONIZAÇÃO: O percentual não será publicado até reconciliação explícita.',
        slug,
        dbCounts,
        localCounts
      };
    }

    console.log(`✅ [CRON VALIDADO] ${dbRow.name} (${dbRow.gestor_name}): ${dbCounts.completed}/${dbCounts.total} (${dbCounts.percent}%) [Hash: ${dbHash}]`);
    return {
      status: 'OK',
      slug,
      gestor: dbRow.gestor_name,
      completed: dbCounts.completed,
      total: dbCounts.total,
      percent: dbCounts.percent,
      hash: dbHash,
      updatedAt: dbRow.updated_at
    };
  } finally {
    client.release();
  }
}

async function run() {
  console.log('🔍 Executando Verificação de Integridade de Cron & Backlog...\n');
  const slugs = ['after-forty', 'gameraesthetic', 'sharpeye', 'talk-to-your-crowd', 'thethirties'];
  const results = [];

  for (const slug of slugs) {
    results.push(await validateProjectForCron(slug));
  }

  await pool.end();
  return results;
}

run().catch(console.error);
