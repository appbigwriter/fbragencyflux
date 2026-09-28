import { setProjectTaskStatus, getProjectDetail, countBacklogTasks } from '../src/lib/projects.ts';

async function runPersistenceTest() {
  console.log('🧪 Iniciando Teste de Persistência, Versionamento e Readback...\n');

  const slug = 'after-forty';

  // 1. Leitura Inicial
  const detail1 = await getProjectDetail(slug);
  const counts1 = countBacklogTasks(detail1.backlog);
  console.log(`1️⃣ Leitura Inicial: ${counts1.completedTasks}/${counts1.totalTasks} tarefas concluídas (${counts1.percent}%)`);

  // 2. Executar marcação de status (Artigo 04)
  const updateResult = await setProjectTaskStatus(slug, {
    taskIdentifier: 'Artigo 04',
    newStatus: true,
    author: 'Heidi Braun Manager'
  });

  console.log('2️⃣ Resultado da Gravação com Readback:', {
    project: updateResult.project,
    task: updateResult.task,
    previousStatus: updateResult.previousStatus,
    newStatus: updateResult.newStatus,
    timestamp: updateResult.timestamp,
    author: updateResult.author,
    revisionId: updateResult.revisionId,
    persisted: updateResult.persisted,
    counts: `${updateResult.completedTasks}/${updateResult.totalTasks} (${updateResult.percentComplete}%)`
  });

  // 3. Teste de Conflito de Versão (Tentativa de gravação com Revision ID obsoleto)
  try {
    await setProjectTaskStatus(slug, {
      taskIdentifier: 'Artigo 05',
      newStatus: true,
      author: 'Heidi Braun Manager',
      expectedRevisionId: 'rev-obsoleta-invalida'
    });
    console.error('❌ ERRO: Deveria ter rejeitado com conflito de versão!');
  } catch (err) {
    console.log('3️⃣ Teste de Conflito de Versão: SUCESSO ✅ ->', err.message);
  }

  // 4. Reverter Artigo 04 para o estado canônico exato de 7/24
  const revertResult = await setProjectTaskStatus(slug, {
    taskIdentifier: 'Artigo 04',
    newStatus: false,
    author: 'Heidi Braun Manager'
  });

  console.log(`4️⃣ Reversão para Estado Canônico: ${revertResult.completedTasks}/${revertResult.totalTasks} (${revertResult.percentComplete}%) [Revisão: ${revertResult.revisionId}]`);

  // 5. Confirmação Final de Readback
  const finalDetail = await getProjectDetail(slug);
  const finalCounts = countBacklogTasks(finalDetail.backlog);
  console.log(`\n🎉 CONFIRMAÇÃO FINAL DE PERSISTÊNCIA: ${finalCounts.completedTasks}/${finalCounts.totalTasks} (${finalCounts.percent}%)`);
}

runPersistenceTest().catch(console.error);
