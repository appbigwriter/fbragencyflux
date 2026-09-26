import { Pool } from 'pg';

const databaseUrl = 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres';

async function inspectDatabase() {
  const pool = new Pool({ connectionString: databaseUrl, ssl: false, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();

  console.log('🔍 Conectado ao PostgreSQL VPS. Inspecionando schemas e tabelas...');

  // 1. Schemas
  const schemasRes = await client.query(`
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  `);
  console.log('📁 Schemas encontrados:', schemasRes.rows.map(r => r.schema_name));

  // 2. Tabelas em custom_agency, custom_agencyflux, public
  const tablesRes = await client.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema IN ('custom_agencyflux', 'custom_agency', 'public')
    ORDER BY table_schema, table_name
  `);
  console.log('📋 Tabelas encontradas:', tablesRes.rows);

  // 3. Projetos em custom_agencyflux.flux_projects se existir
  try {
    const p1 = await client.query(`SELECT * FROM custom_agencyflux.flux_projects LIMIT 10`);
    console.log('\n📊 custom_agencyflux.flux_projects:', p1.rows);
  } catch (e) {
    console.log('❌ custom_agencyflux.flux_projects erro:', e.message);
  }

  // 4. Projetos em custom_agency.agency_projects se existir
  try {
    const p2 = await client.query(`SELECT * FROM custom_agency.agency_projects LIMIT 10`);
    console.log('\n📊 custom_agency.agency_projects:', p2.rows);
  } catch (e) {
    console.log('❌ custom_agency.agency_projects erro:', e.message);
  }

  // 5. Projetos em public.projects se existir
  try {
    const p3 = await client.query(`SELECT * FROM public.projects LIMIT 10`);
    console.log('\n📊 public.projects:', p3.rows);
  } catch (e) {
    console.log('❌ public.projects erro:', e.message);
  }

  client.release();
  await pool.end();
}

inspectDatabase().catch(console.error);
