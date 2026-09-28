import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres',
  ssl: false
});

async function updateHeidi() {
  await pool.query(`
    UPDATE custom_agency.agency_projects
    SET name = 'After Forty by Heidi Braun',
        gestor_name = 'Heidi Braun',
        niche = 'Longevidade, Skincare Maduro & Home Fitness 40+',
        target_audience = 'Homens e mulheres 40+ focados em saúde e estética',
        language = 'EN-US (Global)',
        updated_at = NOW()
    WHERE slug = 'after-forty'
  `);
  console.log('✅ Gestor do After Forty atualizado com sucesso para Heidi Braun!');
  await pool.end();
}

updateHeidi().catch(console.error);
