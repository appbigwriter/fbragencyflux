import { Pool } from 'pg';

const databaseUrl = 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres';

async function inspectTable() {
  const pool = new Pool({ connectionString: databaseUrl, ssl: false, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();

  console.log('🔍 Inspecionando colunas da tabela custom_agency.agency_projects...');
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_schema = 'custom_agency' AND table_name = 'agency_projects'
    ORDER BY ordinal_position
  `);
  console.log('📋 Colunas atuais:', res.rows);

  // Inspecionar dados atuais
  const rowsRes = await client.query(`
    SELECT slug, name, niche, gestor_name, domain, updated_at, jsonb_object_keys(metadata) as metadata_keys
    FROM custom_agency.agency_projects
  `);
  console.log('\n📊 Projetos no banco:', rowsRes.rows);

  client.release();
  await pool.end();
}

inspectTable().catch(console.error);
