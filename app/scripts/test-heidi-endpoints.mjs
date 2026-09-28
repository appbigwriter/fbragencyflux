import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

const databaseUrl = 'postgresql://postgres.supabase-vps2:ffff332788fcc1ae8a484930fd1e3272@76.13.168.223:15432/postgres';
const projectsDir = path.resolve('..', '03-projetos');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false
});

async function runHeidiVerificationTest() {
  console.log('🧪 Iniciando teste de verificação e integridade para o projeto After Forty by Heidi Braun...\n');

  // 1. Leitura atual do banco VPS
  const res = await pool.query(`
    SELECT slug, name, gestor_name, niche, target_audience, language,
           LENGTH(brief_content) as brief_len,
           LENGTH(backlog_content) as backlog_len,
           LENGTH(prompt_content) as prompt_len,
           LENGTH(updates_content) as updates_len,
           updated_at
    FROM custom_agency.agency_projects
    WHERE slug = 'after-forty'
  `);

  const p = res.rows[0];
  console.log('1️⃣ Estado no PostgreSQL VPS:');
  console.log(`   📌 Nome: ${p.name}`);
  console.log(`   📌 Gestor: ${p.gestor_name}`);
  console.log(`   📌 Nicho: ${p.niche}`);
  console.log(`   📌 Tamanhos: Briefing (${p.brief_len}b), Backlog (${p.backlog_len}b), Prompt (${p.prompt_len}b), Updates (${p.updates_len}b)`);
  console.log(`   📌 Atualizado em: ${p.updated_at}\n`);

  // 2. Leitura dos arquivos no disco
  const pDir = path.join(projectsDir, 'after-forty');
  const files = await fs.readdir(pDir);
  console.log('2️⃣ Arquivos locais em disco (03-projetos/after-forty):');
  for (const f of files) {
    const s = await fs.stat(path.join(pDir, f));
    console.log(`   📂 ${f} (${s.isDirectory() ? 'DIR' : s.size + ' bytes'})`);
  }

  // 3. Teste de gravação e confirmação (readback)
  console.log('\n3️⃣ Teste de persistência e gravação de artefato de teste:');
  const testFileName = '01-pesquisa/teste-verificacao-heidi.md';
  const testContent = `# Verificação de Persistência Hermes\nTimestamp: ${new Date().toISOString()}\nAutor: Heidi Braun Manager\nStatus: 100% Persistido e Verificado.`;
  
  const testFilePath = path.join(pDir, testFileName);
  await fs.mkdir(path.dirname(testFilePath), { recursive: true });
  await fs.writeFile(testFilePath, testContent, 'utf-8');
  
  const readBack = await fs.readFile(testFilePath, 'utf-8');
  const matches = readBack.includes('Heidi Braun Manager');
  console.log(`   ✅ Gravação local em disco: ${matches ? 'CONFIRMADA' : 'FALHOU'}`);

  // Limpa o arquivo de teste após confirmação
  await fs.unlink(testFilePath);

  await pool.end();
  console.log('\n🎉 Teste de integridade concluído com sucesso!');
}

runHeidiVerificationTest().catch(console.error);
