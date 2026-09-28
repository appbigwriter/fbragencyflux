import { Pool } from 'pg';
import path from 'path';

const pool = new Pool({
  connectionString: 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres',
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

async function testDashboardList() {
  const res = await pool.query('SELECT slug, name, niche, gestor_name, backlog_content FROM custom_agency.agency_projects ORDER BY name');
  const projectSummaries = res.rows.map(row => {
    const counts = countBacklogTasks(row.backlog_content || '');
    return {
      slug: row.slug,
      name: row.name,
      gestor: row.gestor_name,
      completed: counts.completedTasks,
      total: counts.totalTasks,
      percent: counts.percent
    };
  });
  console.table(projectSummaries);
  await pool.end();
}

testDashboardList();
