import fs from 'fs/promises';
import path from 'path';
import { ProjectCreationData, generateHermesGestorPrompt, generateInitialBrief, generateInitialBacklog, generateInitialUpdates } from './generator';
import { syncProjectToDatabase, fetchProjectsFromDatabase, fetchProjectDetailFromDatabase, updateProjectFieldInDatabase } from './integrations/supabase';
import { registerProjectInControlTower } from './integrations/control-tower';
import { triggerN8nWorkflow } from './integrations/n8n';
import { ensureDefaultProjectsSeeded } from './seed-data';

// Caminho para a raiz do repositório (com suporte seguro a ambiente Docker/Easypanel e local)
const isInsideApp = process.cwd().replace(/\\/g, '/').endsWith('/app') || process.cwd().replace(/\\/g, '/').endsWith('app');
const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || process.env.FLUX_ROOT || (process.env.NODE_ENV === 'production' && !process.env.WORKSPACE_ROOT ? process.cwd() : (isInsideApp ? path.resolve(process.cwd(), '..') : process.cwd()));
const PROJECTS_DIR = process.env.PROJECTS_DIR || path.join(WORKSPACE_ROOT, '03-projetos');
const SKILLS_DIR = process.env.SKILLS_DIR || path.join(WORKSPACE_ROOT, '02-skills');

export interface ProjectSummary {
  slug: string;
  name: string;
  niche: string;
  gestorName: string;
  hasBrief: boolean;
  hasBacklog: boolean;
  hasPrompt: boolean;
  hasUpdates?: boolean;
  pendingUpdatesCount?: number;
  totalTasks: number;
  completedTasks: number;
  lastModified: string;
}

export interface SkillItem {
  id: string;
  name: string;
  description: string;
  content: string;
}

const DEFAULT_SKILLS: SkillItem[] = [
  { id: 'pesquisa-mercado', name: 'Pesquisa de Mercado & Concorrência', description: 'Análise de concorrentes, dores, personas e palavras-chave', content: '' },
  { id: 'copy-posicionamento', name: 'Copywriting & Posicionamento', description: 'Linha editorial, artigos de conversão e pautas', content: '' },
  { id: 'design-identidade', name: 'Design & Identidade Visual', description: 'Design tokens, paleta de cores e identidade', content: '' },
  { id: 'engenharia-fullstack', name: 'Engenharia Fullstack Next.js', description: 'Estruturação de componentes, templates e banco', content: '' },
  { id: 'trafego-growth', name: 'Tráfego & Growth', description: 'SEO técnico, indexação e distribuição', content: '' },
  { id: 'qa-auditoria', name: 'QA & Compliance Editorial', description: 'Auditoria de claims, segurança e compliance', content: '' }
];

export async function listSkills(): Promise<SkillItem[]> {
  try {
    try {
      await ensureDefaultProjectsSeeded(PROJECTS_DIR, SKILLS_DIR, WORKSPACE_ROOT);
    } catch {}

    const skills: SkillItem[] = [];
    try {
      const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const skillPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
          try {
            const content = await fs.readFile(skillPath, 'utf-8');
            let name = entry.name;
            let description = 'Habilidade modular da FBR Agency';
            
            const nameMatch = content.match(/name:\s*(.+)/);
            if (nameMatch) name = nameMatch[1].trim();

            const descMatch = content.match(/description:\s*(.+)/);
            if (descMatch) description = descMatch[1].trim();

            skills.push({
              id: entry.name,
              name,
              description,
              content
            });
          } catch {}
        }
      }
    } catch {}

    return skills.length > 0 ? skills : DEFAULT_SKILLS;
  } catch (err) {
    console.error('Erro ao listar skills:', err);
    return DEFAULT_SKILLS;
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  try {
    const projectsMap = new Map<string, ProjectSummary>();

    // 1. Tenta carregar do banco PostgreSQL VPS primeiro (Single Source of Truth)
    const dbProjects = await fetchProjectsFromDatabase();
    for (const dbp of dbProjects) {
      const pDir = path.join(PROJECTS_DIR, dbp.slug);
      
      const briefContent = dbp.brief_content || (dbp.metadata?.briefingText ? generateInitialBrief({
        name: dbp.name,
        slug: dbp.slug,
        niche: dbp.niche,
        targetAudience: dbp.target_audience,
        language: dbp.language,
        domain: dbp.domain,
        gestorName: dbp.gestor_name,
        personaTone: dbp.metadata?.personaTone || 'Editorial sofisticado',
        briefingText: dbp.metadata?.briefingText || '',
        monetization: dbp.metadata?.monetization || ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
        selectedSkills: dbp.metadata?.selectedSkills || ['pesquisa-mercado', 'copy-posicionamento']
      }) : '');

      const backlogContent = dbp.backlog_content || '';
      const promptContent = dbp.prompt_content || '';
      const updatesContent = dbp.updates_content || '';

      // Sincroniza em disco para navegação local se necessário
      try {
        await fs.mkdir(pDir, { recursive: true });
        if (briefContent) {
          const bp = path.join(pDir, 'brief.md');
          try { await fs.access(bp); } catch { await fs.writeFile(bp, briefContent, 'utf-8'); }
        }
        if (backlogContent) {
          const blp = path.join(pDir, 'backlog.md');
          try { await fs.access(blp); } catch { await fs.writeFile(blp, backlogContent, 'utf-8'); }
        }
        if (promptContent) {
          const pp = path.join(pDir, 'GESTOR-HERMES-PROMPT.md');
          try { await fs.access(pp); } catch { await fs.writeFile(pp, promptContent, 'utf-8'); }
        }
        if (updatesContent) {
          const up = path.join(pDir, 'updates.md');
          try { await fs.access(up); } catch { await fs.writeFile(up, updatesContent, 'utf-8'); }
        }
      } catch {}

      const completedMatches = backlogContent.match(/- \[x\]/gi);
      const pendingMatches = backlogContent.match(/- \[ \]/gi);
      const completedTasks = completedMatches ? completedMatches.length : 0;
      const totalTasks = completedTasks + (pendingMatches ? pendingMatches.length : 0);

      const pendingUpdatesMatches = updatesContent ? updatesContent.match(/^- \[ \] \*\*\[.+/gm) : null;
      const pendingUpdatesCount = pendingUpdatesMatches ? pendingUpdatesMatches.length : 0;

      projectsMap.set(dbp.slug, {
        slug: dbp.slug,
        name: dbp.name,
        niche: dbp.niche || 'Nicho não especificado',
        gestorName: dbp.gestor_name || 'Gestor Hermes',
        hasBrief: !!briefContent,
        hasBacklog: !!backlogContent,
        hasPrompt: !!promptContent,
        hasUpdates: !!updatesContent,
        pendingUpdatesCount,
        totalTasks,
        completedTasks,
        lastModified: dbp.updated_at ? new Date(dbp.updated_at).toISOString() : new Date().toISOString()
      });
    }

    // 2. Garante o seed padrão e lê pastas locais que não existam no banco
    await ensureDefaultProjectsSeeded(PROJECTS_DIR, SKILLS_DIR, WORKSPACE_ROOT);
    try {
      const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !projectsMap.has(entry.name)) {
          const projectDir = path.join(PROJECTS_DIR, entry.name);
          const briefPath = path.join(projectDir, 'brief.md');
          const backlogPath = path.join(projectDir, 'backlog.md');
          const promptPath = path.join(projectDir, 'GESTOR-HERMES-PROMPT.md');
          const updatesPath = path.join(projectDir, 'updates.md');

          let hasBrief = false;
          let hasBacklog = false;
          let hasPrompt = false;
          let hasUpdates = false;
          let projectName = entry.name;
          let niche = 'Nicho não especificado';
          let gestorName = 'Gestor Hermes';
          let totalTasks = 0;
          let completedTasks = 0;
          let pendingUpdatesCount = 0;

          try {
            const briefContent = await fs.readFile(briefPath, 'utf-8');
            hasBrief = true;
            const nameMatch = briefContent.match(/#\s*(?:Briefing do Projeto:\s*)?(.+)/i);
            if (nameMatch) projectName = nameMatch[1].replace(/⚡|🌿/g, '').trim();

            const nicheMatch = briefContent.match(/Nicho Principal\*\*:\s*(.+)/i) || briefContent.match(/Nicho & Mercado\*\*:\s*(.+)/i);
            if (nicheMatch) niche = nicheMatch[1].trim();

            const gestorMatch = briefContent.match(/Gestor Hermes Responsável\*\*:\s*(.+)/i);
            if (gestorMatch) gestorName = gestorMatch[1].trim();
          } catch {}

          try {
            const backlogContent = await fs.readFile(backlogPath, 'utf-8');
            hasBacklog = true;
            const completedMatches = backlogContent.match(/- \[x\]/gi);
            const pendingMatches = backlogContent.match(/- \[ \]/gi);
            completedTasks = completedMatches ? completedMatches.length : 0;
            totalTasks = completedTasks + (pendingMatches ? pendingMatches.length : 0);
          } catch {}

          try {
            await fs.access(promptPath);
            hasPrompt = true;
          } catch {}

          try {
            const updatesContent = await fs.readFile(updatesPath, 'utf-8');
            hasUpdates = true;
            const pendingUpdatesMatches = updatesContent.match(/^- \[ \] \*\*\[.+/gm);
            pendingUpdatesCount = pendingUpdatesMatches ? pendingUpdatesMatches.length : 0;
          } catch {}

          const stat = await fs.stat(projectDir);

          projectsMap.set(entry.name, {
            slug: entry.name,
            name: projectName,
            niche,
            gestorName,
            hasBrief,
            hasBacklog,
            hasPrompt,
            hasUpdates,
            pendingUpdatesCount,
            totalTasks,
            completedTasks,
            lastModified: stat.mtime.toISOString()
          });
        }
      }
    } catch {}

    return Array.from(projectsMap.values());
  } catch (err) {
    console.error('Erro ao listar projetos:', err);
    return [];
  }
}

export async function getProjectDetail(slug: string) {
  const projectDir = path.join(PROJECTS_DIR, slug);
  
  let brief = '';
  let backlog = '';
  let prompt = '';
  let updates = '';
  let dbRow: any = null;

  // 1. Tenta carregar direto do PostgreSQL VPS
  try {
    dbRow = await fetchProjectDetailFromDatabase(slug);
    if (dbRow) {
      brief = dbRow.brief_content || '';
      backlog = dbRow.backlog_content || '';
      prompt = dbRow.prompt_content || '';
      updates = dbRow.updates_content || '';
    }
  } catch {}

  // 2. Fallback / complementar do filesystem local
  if (!brief) {
    try { brief = await fs.readFile(path.join(projectDir, 'brief.md'), 'utf-8'); } catch {}
  }
  if (!backlog) {
    try { backlog = await fs.readFile(path.join(projectDir, 'backlog.md'), 'utf-8'); } catch {}
  }
  if (!prompt) {
    try { prompt = await fs.readFile(path.join(projectDir, 'GESTOR-HERMES-PROMPT.md'), 'utf-8'); } catch {}
  }
  if (!updates) {
    try { updates = await fs.readFile(path.join(projectDir, 'updates.md'), 'utf-8'); } catch {}
  }

  // 3. Scan de arquivos locais (se existirem)
  const files: { path: string; isDir: boolean; size?: number }[] = [];
  async function scanFiles(dir: string, base: string = '') {
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const relPath = path.join(base, item.name).replace(/\\/g, '/');
        if (item.isDirectory()) {
          files.push({ path: relPath, isDir: true });
          await scanFiles(path.join(dir, item.name), relPath);
        } else {
          const s = await fs.stat(path.join(dir, item.name));
          files.push({ path: relPath, isDir: false, size: s.size });
        }
      }
    } catch {}
  }
  await scanFiles(projectDir);

  // 4. Se arquivos não existirem no disco, salvar a partir do banco para manter coerência
  try {
    await fs.mkdir(projectDir, { recursive: true });
    if (brief) {
      const bp = path.join(projectDir, 'brief.md');
      try { await fs.access(bp); } catch { await fs.writeFile(bp, brief, 'utf-8'); }
    }
    if (backlog) {
      const blp = path.join(projectDir, 'backlog.md');
      try { await fs.access(blp); } catch { await fs.writeFile(blp, backlog, 'utf-8'); }
    }
    if (prompt) {
      const pp = path.join(projectDir, 'GESTOR-HERMES-PROMPT.md');
      try { await fs.access(pp); } catch { await fs.writeFile(pp, prompt, 'utf-8'); }
    }
    if (updates) {
      const up = path.join(projectDir, 'updates.md');
      try { await fs.access(up); } catch { await fs.writeFile(up, updates, 'utf-8'); }
    }
  } catch {}

  let projectName = dbRow?.name || slug;
  let niche = dbRow?.niche || '';
  let targetAudience = dbRow?.target_audience || '';
  let language = dbRow?.language || 'EN-US (Global)';
  let gestorName = dbRow?.gestor_name || 'Gestor Hermes';
  let personaTone = dbRow?.metadata?.personaTone || 'Editorial sofisticado, transparente, baseado em evidências científicas e sem falsas promessas.';
  let domain = dbRow?.domain || '';
  let briefingText = dbRow?.metadata?.briefingText || '';
  const selectedSkills: string[] = dbRow?.metadata?.selectedSkills || [];

  if (brief) {
    const nameMatch = brief.match(/#\s*(?:Briefing do Projeto:\s*)?(.+)/i);
    if (nameMatch) projectName = nameMatch[1].replace(/⚡|🌿/g, '').trim();

    const nicheMatch = brief.match(/Nicho Principal\*\*:\s*(.+)/i) || brief.match(/Nicho & Mercado\*\*:\s*(.+)/i);
    if (nicheMatch) niche = nicheMatch[1].trim();

    const audMatch = brief.match(/Público-Alvo\*\*:\s*(.+)/i);
    if (audMatch) targetAudience = audMatch[1].trim();

    const langMatch = brief.match(/Idioma \/ Mercado\*\*:\s*(.+)/i) || brief.match(/Idioma Principal\*\*:\s*(.+)/i);
    if (langMatch) language = langMatch[1].trim();

    const domMatch = brief.match(/Domínio Previsto\*\*:\s*(.+)/i);
    if (domMatch) domain = domMatch[1].replace(/`|https?:\/\//g, '').trim();

    const gestorMatch = brief.match(/Gestor Hermes Responsável\*\*:\s*(.+)/i);
    if (gestorMatch) gestorName = gestorMatch[1].trim();

    const toneMatch = brief.match(/Posicionamento\*\*:\s*(.+)/i);
    if (toneMatch) personaTone = toneMatch[1].trim();

    const briefTextMatch = brief.match(/## 📖 Briefing Global & Visão Detalhada\s*([\s\S]*?)(?=\n---\n|$)/i);
    if (briefTextMatch) {
      briefingText = briefTextMatch[1].trim();
    } else {
      const genericBriefMatch = brief.match(/## 📌 Identidade & Visão Geral\s*([\s\S]*?)(?=\n---\n|$)/i);
      if (genericBriefMatch) {
        briefingText = genericBriefMatch[1].trim();
      }
    }
  }

  if (prompt) {
    const gestorMatch = prompt.match(/Você é o \*\*([^*]+)\*\*/i);
    if (gestorMatch) gestorName = gestorMatch[1].trim();

    const skillMatches = prompt.matchAll(/Skill:\s*`([^`]+)`/g);
    for (const sm of skillMatches) {
      if (sm[1] && !selectedSkills.includes(sm[1])) {
        selectedSkills.push(sm[1]);
      }
    }

    if (!briefingText) {
      const promptBriefMatch = prompt.match(/## 📖 Contexto & Briefing Global do Projeto\s*([\s\S]*?)(?=\n---\n|$)/i);
      if (promptBriefMatch) briefingText = promptBriefMatch[1].trim();
    }
  }

  // Se não existir updates.md, mas o projeto existe, cria o inicial
  if (!updates && (brief || prompt)) {
    const defaultData: ProjectCreationData = {
      name: projectName,
      slug,
      niche,
      targetAudience,
      language,
      domain,
      monetization: dbRow?.metadata?.monetization || ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
      gestorName,
      personaTone,
      selectedSkills: selectedSkills.length > 0 ? selectedSkills : ['pesquisa-mercado', 'copy-posicionamento']
    };
    updates = generateInitialUpdates(defaultData);
    try {
      await fs.writeFile(path.join(projectDir, 'updates.md'), updates, 'utf-8');
      await updateProjectFieldInDatabase(slug, 'updates_content', updates);
    } catch {}
  }

  // Contagem de cobranças pendentes
  const pendingUpdatesMatches = updates ? updates.match(/^- \[ \] \*\*\[.+/gm) : null;
  const pendingUpdatesCount = pendingUpdatesMatches ? pendingUpdatesMatches.length : 0;

  return {
    slug,
    brief,
    backlog,
    prompt,
    updates,
    pendingUpdatesCount,
    files,
    metadata: {
      name: projectName,
      slug,
      niche,
      targetAudience,
      language,
      domain,
      gestorName,
      personaTone,
      briefingText,
      selectedSkills: selectedSkills.length > 0 ? selectedSkills : ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria'],
      monetization: dbRow?.metadata?.monetization || ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads']
    }
  };
}

export async function createProject(data: ProjectCreationData) {
  const projectDir = path.join(PROJECTS_DIR, data.slug);
  await fs.mkdir(projectDir, { recursive: true });

  // Criar subdiretórios padrão de artefatos
  await fs.mkdir(path.join(projectDir, '01-pesquisa'), { recursive: true });
  await fs.mkdir(path.join(projectDir, '02-conteudo'), { recursive: true });
  await fs.mkdir(path.join(projectDir, '03-design-ui'), { recursive: true });
  await fs.mkdir(path.join(projectDir, '04-site'), { recursive: true });

  // 1. Gerar brief.md
  const briefContent = generateInitialBrief(data);
  await fs.writeFile(path.join(projectDir, 'brief.md'), briefContent, 'utf-8');

  // 2. Gerar backlog.md
  const backlogContent = generateInitialBacklog(data);
  await fs.writeFile(path.join(projectDir, 'backlog.md'), backlogContent, 'utf-8');

  // 3. Gerar updates.md inicial
  const updatesContent = generateInitialUpdates(data);
  await fs.writeFile(path.join(projectDir, 'updates.md'), updatesContent, 'utf-8');

  // 4. Gerar GESTOR-HERMES-PROMPT.md
  const hermesPrompt = generateHermesGestorPrompt(data, WORKSPACE_ROOT.replace(/\\/g, '/'));
  await fs.writeFile(path.join(projectDir, 'GESTOR-HERMES-PROMPT.md'), hermesPrompt, 'utf-8');

  // 5. Salvar 100% dos dados no banco PostgreSQL VPS e integrações
  try {
    await syncProjectToDatabase({
      ...data,
      briefContent,
      backlogContent,
      promptContent: hermesPrompt,
      updatesContent
    });
    registerProjectInControlTower(data).catch(() => {});
    triggerN8nWorkflow('project_created', { slug: data.slug, name: data.name, gestor: data.gestorName }).catch(() => {});
  } catch {}

  return {
    slug: data.slug,
    success: true,
    prompt: hermesPrompt
  };
}

export async function updateProjectMetadata(slug: string, data: ProjectCreationData) {
  const projectDir = path.join(PROJECTS_DIR, slug);
  await fs.mkdir(projectDir, { recursive: true });

  // 1. Atualizar brief.md
  const briefContent = generateInitialBrief(data);
  await fs.writeFile(path.join(projectDir, 'brief.md'), briefContent, 'utf-8');

  // 2. Regenerar GESTOR-HERMES-PROMPT.md com as novas skills e diretrizes
  const hermesPrompt = generateHermesGestorPrompt(data, WORKSPACE_ROOT.replace(/\\/g, '/'));
  await fs.writeFile(path.join(projectDir, 'GESTOR-HERMES-PROMPT.md'), hermesPrompt, 'utf-8');

  // 3. Persistir no PostgreSQL VPS e integrações
  try {
    await syncProjectToDatabase({
      ...data,
      slug,
      briefContent,
      promptContent: hermesPrompt
    });
    registerProjectInControlTower(data).catch(() => {});
    triggerN8nWorkflow('project_updated', { slug: data.slug, name: data.name, gestor: data.gestorName }).catch(() => {});
  } catch {}

  return {
    slug,
    success: true,
    prompt: hermesPrompt
  };
}

export async function updateProjectFile(slug: string, fileName: string, content: string) {
  const filePath = path.join(PROJECTS_DIR, slug, fileName);
  await fs.writeFile(filePath, content, 'utf-8');

  // Persistir diretamente na coluna correspondente do PostgreSQL VPS
  if (fileName === 'brief.md') {
    await updateProjectFieldInDatabase(slug, 'brief_content', content);
  } else if (fileName === 'backlog.md') {
    await updateProjectFieldInDatabase(slug, 'backlog_content', content);
  } else if (fileName === 'GESTOR-HERMES-PROMPT.md') {
    await updateProjectFieldInDatabase(slug, 'prompt_content', content);
  } else if (fileName === 'updates.md') {
    await updateProjectFieldInDatabase(slug, 'updates_content', content);
  }

  // Notificar n8n sobre alteração de arquivo
  try {
    triggerN8nWorkflow('project_file_updated', { slug, fileName, timestamp: new Date().toISOString() }).catch(() => {});
  } catch {}

  return { success: true };
}

export async function addProjectUpdate(slug: string, updateData: {
  author?: string;
  type?: string;
  instruction: string;
  deliverable?: string;
  priority?: string;
}) {
  const projectDir = path.join(PROJECTS_DIR, slug);
  const updatesPath = path.join(projectDir, 'updates.md');
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

  let currentContent = '';
  try {
    const dbRow = await fetchProjectDetailFromDatabase(slug);
    if (dbRow?.updates_content) {
      currentContent = dbRow.updates_content;
    } else {
      currentContent = await fs.readFile(updatesPath, 'utf-8');
    }
  } catch {
    const detail = await getProjectDetail(slug);
    currentContent = generateInitialUpdates({
      name: detail.metadata.name,
      slug,
      niche: detail.metadata.niche,
      targetAudience: detail.metadata.targetAudience,
      language: detail.metadata.language,
      gestorName: detail.metadata.gestorName,
      personaTone: detail.metadata.personaTone,
      monetization: detail.metadata.monetization,
      selectedSkills: detail.metadata.selectedSkills
    });
  }

  const author = updateData.author || 'Sergio Castro (Publisher)';
  const type = updateData.type || '⚡ Cobrança / Diretriz';
  const priority = updateData.priority || 'Alta';
  const deliverable = updateData.deliverable ? `\n  - **Entregável Relacionado**: \`${updateData.deliverable}\`` : '';

  const newEntry = `- [ ] **[${dateStr} - ${type}]**
  - **Autor**: ${author}
  - **Instrução**: ${updateData.instruction}${deliverable}
  - **Prioridade**: ${priority}
  - **Status**: Pendente de Resposta do Hermes\n`;

  let updatedContent = '';
  if (currentContent.includes('## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)')) {
    updatedContent = currentContent.replace(
      '## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)',
      `## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)\n${newEntry}`
    );
  } else {
    updatedContent = `${currentContent}\n\n## 📥 Observações e Cobranças Ativas (Aguardando Ação do Agente)\n${newEntry}`;
  }

  // Grava em disco e atualiza no PostgreSQL VPS
  await fs.writeFile(updatesPath, updatedContent, 'utf-8');
  await updateProjectFieldInDatabase(slug, 'updates_content', updatedContent);

  // Notificar n8n e registrar log
  try {
    triggerN8nWorkflow('hermes_update_posted', {
      slug,
      author,
      type,
      instruction: updateData.instruction,
      priority,
      timestamp: new Date().toISOString()
    }).catch(() => {});
  } catch {}

  return { success: true, updates: updatedContent };
}

export async function toggleProjectUpdate(slug: string, updateLine: string, currentlyChecked: boolean) {
  const projectDir = path.join(PROJECTS_DIR, slug);
  const updatesPath = path.join(projectDir, 'updates.md');

  try {
    let currentContent = '';
    const dbRow = await fetchProjectDetailFromDatabase(slug);
    if (dbRow?.updates_content) {
      currentContent = dbRow.updates_content;
    } else {
      currentContent = await fs.readFile(updatesPath, 'utf-8');
    }

    const oldPattern = currentlyChecked ? `- [x] ${updateLine}` : `- [ ] ${updateLine}`;
    const newPattern = currentlyChecked ? `- [ ] ${updateLine}` : `- [x] ${updateLine}`;

    const newContent = currentContent.replace(oldPattern, newPattern);
    await fs.writeFile(updatesPath, newContent, 'utf-8');
    await updateProjectFieldInDatabase(slug, 'updates_content', newContent);

    return { success: true, updates: newContent };
  } catch (err: any) {
    throw new Error('Falha ao alternar status do update: ' + err.message);
  }
}




