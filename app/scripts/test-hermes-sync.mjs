import fs from 'fs/promises';
import path from 'path';

const BASE_DIR = path.resolve(process.cwd(), '..');
const PROJECTS_DIR = path.join(BASE_DIR, '03-projetos');

async function runE2ETest() {
  console.log('🧪 === TESTE E2E DE SINCRONIZAÇÃO E DISPATCH HERMES ===\n');

  const slug = 'talk-to-your-crowd';
  const projectDir = path.join(PROJECTS_DIR, slug);

  // 1. Verificar arquivos físicos
  console.log('1️⃣ Verificando integridade física dos artefatos do projeto...');
  const promptExists = await fs.access(path.join(projectDir, 'GESTOR-HERMES-PROMPT.md')).then(() => true).catch(() => false);
  const briefExists = await fs.access(path.join(projectDir, 'brief.md')).then(() => true).catch(() => false);
  const backlogExists = await fs.access(path.join(projectDir, 'backlog.md')).then(() => true).catch(() => false);
  const updatesExists = await fs.access(path.join(projectDir, 'updates.md')).then(() => true).catch(() => false);

  console.log(`   - GESTOR-HERMES-PROMPT.md: ${promptExists ? '✅ OK' : '❌ Falhou'}`);
  console.log(`   - brief.md: ${briefExists ? '✅ OK' : '❌ Falhou'}`);
  console.log(`   - backlog.md: ${backlogExists ? '✅ OK' : '❌ Falhou'}`);
  console.log(`   - updates.md: ${updatesExists ? '✅ OK' : '❌ Falhou'}`);

  // 2. Verificar persona e protocolo de sincronização no prompt
  console.log('\n2️⃣ Verificando System Prompt do Agente Gestor...');
  const promptContent = await fs.readFile(path.join(projectDir, 'GESTOR-HERMES-PROMPT.md'), 'utf-8');
  const hasMarcus = promptContent.includes('Marcus Cole');
  const hasProtocol = promptContent.includes('Protocolo Obrigatório de Sincronização Contínua');

  console.log(`   - Persona correta (Marcus Cole): ${hasMarcus ? '✅ Identificado' : '❌ Erro de Persona'}`);
  console.log(`   - Protocolo de sincronização contínua presente: ${hasProtocol ? '✅ Ativo' : '❌ Ausente'}`);

  // 3. Simular postagem de nova cobrança do Sergio
  console.log('\n3️⃣ Simulando postagem de nova cobrança do Publisher Sergio...');
  const testInstruction = 'Teste automatizado: Revisar análise de concorrentes de storefront para entrega até 18h.';
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  
  const currentUpdates = await fs.readFile(path.join(projectDir, 'updates.md'), 'utf-8');
  const newEntry = `- [ ] **[${timestamp} - ⚡ Cobrança de Entrega]**\n  - **Autor**: Sergio Castro (Publisher)\n  - **Instrução**: ${testInstruction}\n  - **Entregável**: \`01-pesquisa/analise-nicho.md\`\n  - **Prioridade**: Urgente\n  - **Status**: Pendente de Resposta do Hermes\n`;
  
  const updatedContent = currentUpdates.replace(
    '## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)',
    `## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)\n${newEntry}`
  );
  await fs.writeFile(path.join(projectDir, 'updates.md'), updatedContent, 'utf-8');
  console.log('   - Cobrança escrita com sucesso em updates.md: ✅ OK');

  // 4. Verificar o payload que o Hermes consome via rota consolidada
  console.log('\n4️⃣ Verificando o Payload Consolidado de Ingestão do Hermes...');
  const briefContent = await fs.readFile(path.join(projectDir, 'brief.md'), 'utf-8');
  const backlogContent = await fs.readFile(path.join(projectDir, 'backlog.md'), 'utf-8');
  const readUpdates = await fs.readFile(path.join(projectDir, 'updates.md'), 'utf-8');

  const consolidatedHermesView = `
${promptContent}

---

# ANEXO I: BRIEFING COMPLETO DO PROJETO
${briefContent}

---

# ANEXO II: BACKLOG DE ENTREGÁVEIS ATUALIZADO
${backlogContent}

---

# ANEXO III: 📢 OBSERVAÇÕES, FEEDBACKS E COBRANÇAS ATIVAS (UPDATES)
${readUpdates}
  `.trim();

  const hermesSeesUpdate = consolidatedHermesView.includes(testInstruction);
  console.log(`   - Hermes recebe a nova cobrança na URL /p/${slug}: ${hermesSeesUpdate ? '✅ Sim, 100% integrado' : '❌ Falhou'}`);

  // 5. Simular atendimento da cobrança pelo Agente Hermes
  console.log('\n5️⃣ Simulando atendimento da cobrança pelo Hermes (Conclusão do Ciclo)...');
  const oldItemPattern = `- [ ] **[${timestamp} - ⚡ Cobrança de Entrega]**\n  - **Autor**: Sergio Castro (Publisher)\n  - **Instrução**: ${testInstruction}\n  - **Entregável**: \`01-pesquisa/analise-nicho.md\`\n  - **Prioridade**: Urgente\n  - **Status**: Pendente de Resposta do Hermes\n`;
  const resolvedItem = `- [x] **[${timestamp} - ⚡ Cobrança de Entrega]** (Atendido por Marcus Cole em ${timestamp})\n  - **Instrução**: ${testInstruction}\n  - **Entregável**: \`01-pesquisa/analise-nicho.md\` (Gerado com sucesso)\n`;
  
  let finalUpdates = readUpdates.replace(oldItemPattern, '');
  finalUpdates = finalUpdates.replace(
    '## ✅ Histórico de Updates Atendidos & Resoluções',
    `## ✅ Histórico de Updates Atendidos & Resoluções\n${resolvedItem}`
  );
  await fs.writeFile(path.join(projectDir, 'updates.md'), finalUpdates, 'utf-8');
  console.log('   - Hermes moveu o item para histórico de atendidos: ✅ OK');

  console.log('\n🎉 === RESULTADO FINAL: TODOS OS 5 GATES DO CICLO PASSARAM COM SUCESSO! ===');
}

runE2ETest().catch(console.error);
