import fs from 'fs/promises';
import path from 'path';
import { ProjectCreationData, generateHermesGestorPrompt, generateInitialBrief, generateInitialBacklog } from './generator';
import { syncProjectToDatabase } from './integrations/supabase';
import { registerProjectInControlTower } from './integrations/control-tower';
import { triggerN8nWorkflow } from './integrations/n8n';

// Caminho para a raiz do repositório
const WORKSPACE_ROOT = path.resolve(process.cwd(), '..');
const PROJECTS_DIR = path.join(WORKSPACE_ROOT, '03-projetos');
const SKILLS_DIR = path.join(WORKSPACE_ROOT, '02-skills');

export interface ProjectSummary {
  slug: string;
  name: string;
  niche: string;
  gestorName: string;
  hasBrief: boolean;
  hasBacklog: boolean;
  hasPrompt: boolean;
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

export async function listSkills(): Promise<SkillItem[]> {
  try {
    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
    const skills: SkillItem[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(SKILLS_DIR, entry.name, 'SKILL.md');
        try {
          const content = await fs.readFile(skillPath, 'utf-8');
          // Parse name and description from frontmatter or content
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
        } catch {
          // Skip if no SKILL.md
        }
      }
    }
    return skills;
  } catch (err) {
    console.error('Erro ao listar skills:', err);
    return [];
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  try {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: ProjectSummary[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectDir = path.join(PROJECTS_DIR, entry.name);
        const briefPath = path.join(projectDir, 'brief.md');
        const backlogPath = path.join(projectDir, 'backlog.md');
        const promptPath = path.join(projectDir, 'GESTOR-HERMES-PROMPT.md');

        let hasBrief = false;
        let hasBacklog = false;
        let hasPrompt = false;
        let projectName = entry.name;
        let niche = 'Nicho não especificado';
        let gestorName = 'Gestor Hermes';
        let totalTasks = 0;
        let completedTasks = 0;

        try {
          const briefContent = await fs.readFile(briefPath, 'utf-8');
          hasBrief = true;
          const nameMatch = briefContent.match(/#\s*(?:Briefing do Projeto:\s*)?(.+)/i);
          if (nameMatch) projectName = nameMatch[1].replace(/⚡|🌿/g, '').trim();

          const nicheMatch = briefContent.match(/Nicho Principal\*\*:\s*(.+)/i) || briefContent.match(/Nicho & Mercado\*\*:\s*(.+)/i);
          if (nicheMatch) niche = nicheMatch[1].trim();

          const gestorMatch = briefContent.match(/Gestor Hermes Responsável\*\*:\s*(.+)/i);
          if (gestorMatch) gestorName = gestorMatch[1].trim();
        } catch {
          // No brief
        }

        try {
          const backlogContent = await fs.readFile(backlogPath, 'utf-8');
          hasBacklog = true;
          const completedMatches = backlogContent.match(/- \[x\]/gi);
          const pendingMatches = backlogContent.match(/- \[ \]/gi);
          completedTasks = completedMatches ? completedMatches.length : 0;
          totalTasks = completedTasks + (pendingMatches ? pendingMatches.length : 0);
        } catch {
          // No backlog
        }

        try {
          await fs.access(promptPath);
          hasPrompt = true;
        } catch {
          // No prompt
        }

        const stat = await fs.stat(projectDir);

        projects.push({
          slug: entry.name,
          name: projectName,
          niche,
          gestorName,
          hasBrief,
          hasBacklog,
          hasPrompt,
          totalTasks,
          completedTasks,
          lastModified: stat.mtime.toISOString()
        });
      }
    }

    return projects;
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
  const files: { path: string; isDir: boolean; size?: number }[] = [];

  try {
    brief = await fs.readFile(path.join(projectDir, 'brief.md'), 'utf-8');
  } catch {}

  try {
    backlog = await fs.readFile(path.join(projectDir, 'backlog.md'), 'utf-8');
  } catch {}

  try {
    prompt = await fs.readFile(path.join(projectDir, 'GESTOR-HERMES-PROMPT.md'), 'utf-8');
  } catch {}

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

  let projectName = slug;
  let niche = '';
  let targetAudience = '';
  let language = 'EN-US (Global)';
  let gestorName = 'Gestor Hermes';
  let personaTone = 'Editorial sofisticado, transparente, baseado em evidências científicas e sem falsas promessas.';
  let domain = '';
  let briefingText = '';
  const selectedSkills: string[] = [];

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
    if (briefTextMatch) briefingText = briefTextMatch[1].trim();
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

  return {
    slug,
    brief,
    backlog,
    prompt,
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
      monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads']
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

  // 3. Gerar GESTOR-HERMES-PROMPT.md
  const hermesPrompt = generateHermesGestorPrompt(data, WORKSPACE_ROOT.replace(/\\/g, '/'));
  await fs.writeFile(path.join(projectDir, 'GESTOR-HERMES-PROMPT.md'), hermesPrompt, 'utf-8');

  // 4. Integrações Assíncronas (Supabase/Postgres VPS, Control Tower, n8n)
  try {
    syncProjectToDatabase(data).catch(() => {});
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

  // 3. Integrações Assíncronas (Supabase/Postgres VPS, Control Tower, n8n)
  try {
    syncProjectToDatabase(data).catch(() => {});
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

  // Notificar n8n sobre alteração de arquivo
  try {
    triggerN8nWorkflow('project_file_updated', { slug, fileName, timestamp: new Date().toISOString() }).catch(() => {});
  } catch {}

  return { success: true };
}


