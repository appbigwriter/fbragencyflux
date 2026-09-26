import fs from 'fs/promises';
import path from 'path';
import { ProjectCreationData, generateHermesGestorPrompt, generateInitialBrief, generateInitialBacklog, generateInitialUpdates } from './generator';

export const DEFAULT_PROJECTS: ProjectCreationData[] = [
  {
    name: 'Talk to your crowd',
    slug: 'talk-to-your-crowd',
    niche: 'Storefront, Sinalização e Varejo',
    targetAudience: 'Empresas e Empreendedores',
    language: 'EN-US (Global)',
    domain: 'talk2yourcrowd.fbr.news',
    gestorName: 'Marcus Cole',
    personaTone: 'Editorial sofisticado, temas transversais, transparente, baseado em evidências científicas e sem falsas promessas.',
    monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
    briefingText: 'Mercado inicial: Estados Unidos e Canadá. Foco inicial de distribuição: site próprio da FBRSigns (http://fbrsigns.com); redes sociais, YouTube, Amazon Seller e Amazon Associates. Produtos de gráfica rápida (Store Signs & Displays) entram como ferramentas práticas para empreendedores.',
    selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
  },
  {
    name: 'After Forty',
    slug: 'after-forty',
    niche: 'Saúde feminina 40+, Longevidade e Nutrição',
    targetAudience: 'Mulheres 40+ anos',
    language: 'PT-BR / EN-US',
    domain: 'afterforty.fbr.news',
    gestorName: 'Dra. Beatriz Bia Matos',
    personaTone: 'Acolhedor, altamente científico, baseado em evidências médicas, empático e sem falsas promessas.',
    monetization: ['Afiliados Especializados', 'Produtos Próprios', 'FBR Ads'],
    briefingText: 'Guia definitivo de longevidade e saúde para mulheres com mais de 40 anos. Foco em equilíbrio hormonal, alimentação baseada em evidências, estilo de vida e sono reparador. Rigoroso compliance de saúde (zero promessas milagrosas).',
    selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
  },
  {
    name: 'Game Style',
    slug: 'gamestyle',
    niche: 'Universo gamer, Hardware, Periféricos e Acessórios',
    targetAudience: 'Homens e mulheres apaixonados por games',
    language: 'EN-US (Global)',
    domain: 'gamestyle.fbr.news',
    gestorName: 'Tara Lindqvist',
    personaTone: 'Curadoria sofisticada, transparente e útil: hardware, periféricos, setup e estilo gamer sem hype falso.',
    monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
    briefingText: 'Game Style organiza escolhas do universo gamer com curadoria sofisticada, transparente e útil: hardware, periféricos, setup, acessórios, estilo e cultura gamer. O produto deve entrar por adequação contextual, não por pressão.',
    selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
  },
  {
    name: 'The Thirties',
    slug: 'thethirties',
    niche: 'Saúde, Bem-estar e Vida Emocional nos 30s',
    targetAudience: 'Mulheres de 30 a 39 anos',
    language: 'EN-US (Global)',
    domain: 'thethirties.fbr.news',
    gestorName: 'Maia Mendes',
    personaTone: 'Evidence-based living in your thirties. Humor inteligente, calor humano, transparente e sem falsas promessas.',
    monetization: ['Amazon Associates', 'Afiliados Especializados', 'FBR Ads'],
    briefingText: 'Maia Mendes abordará com humor inteligente e evidências as situações da vida de mulheres 30+: saúde, relacionamentos, trabalho, maternidade, autocuidado e finanças com recomendações contextuais sutis e úteis.',
    selectedSkills: ['pesquisa-mercado', 'copy-posicionamento', 'design-identidade', 'engenharia-fullstack', 'trafego-growth', 'qa-auditoria']
  }
];

export async function ensureDefaultProjectsSeeded(projectsDir: string, skillsDir: string, workspaceRoot: string) {
  try {
    await fs.mkdir(projectsDir, { recursive: true });
    await fs.mkdir(skillsDir, { recursive: true });

    // Criar skills padrão se não existirem
    const defaultSkills = [
      { id: 'pesquisa-mercado', name: 'Pesquisa de Mercado & Concorrência', desc: 'Análise de concorrentes, dores, personas e palavras-chave' },
      { id: 'copy-posicionamento', name: 'Copywriting & Posicionamento', desc: 'Linha editorial, artigos de conversão e pautas' },
      { id: 'design-identidade', name: 'Design & Identidade Visual', desc: 'Design tokens, paleta de cores e identidade' },
      { id: 'engenharia-fullstack', name: 'Engenharia Fullstack Next.js', desc: 'Estruturação de componentes, templates e banco' },
      { id: 'trafego-growth', name: 'Tráfego & Growth', desc: 'SEO técnico, indexação e distribuição' },
      { id: 'qa-auditoria', name: 'QA & Compliance Editorial', desc: 'Auditoria de claims, segurança e compliance' }
    ];

    for (const skill of defaultSkills) {
      const sDir = path.join(skillsDir, skill.id);
      await fs.mkdir(sDir, { recursive: true });
      const skillFile = path.join(sDir, 'SKILL.md');
      try {
        await fs.access(skillFile);
      } catch {
        const skillContent = `---
name: ${skill.name}
description: ${skill.desc}
---

# Diretriz de Excelência: ${skill.name}
Regras operacionais e frameworks da FBR Agency para a disciplina de ${skill.name}.
`;
        await fs.writeFile(skillFile, skillContent, 'utf-8');
      }
    }

    // Criar projetos padrão se não existirem
    for (const project of DEFAULT_PROJECTS) {
      const pDir = path.join(projectsDir, project.slug);
      await fs.mkdir(pDir, { recursive: true });
      await fs.mkdir(path.join(pDir, '01-pesquisa'), { recursive: true });
      await fs.mkdir(path.join(pDir, '02-conteudo'), { recursive: true });
      await fs.mkdir(path.join(pDir, '03-design-ui'), { recursive: true });
      await fs.mkdir(path.join(pDir, '04-site'), { recursive: true });

      const briefPath = path.join(pDir, 'brief.md');
      const backlogPath = path.join(pDir, 'backlog.md');
      const promptPath = path.join(pDir, 'GESTOR-HERMES-PROMPT.md');
      const updatesPath = path.join(pDir, 'updates.md');

      try {
        await fs.access(briefPath);
      } catch {
        await fs.writeFile(briefPath, generateInitialBrief(project), 'utf-8');
      }

      try {
        await fs.access(backlogPath);
      } catch {
        await fs.writeFile(backlogPath, generateInitialBacklog(project), 'utf-8');
      }

      try {
        await fs.access(promptPath);
      } catch {
        await fs.writeFile(promptPath, generateHermesGestorPrompt(project, workspaceRoot.replace(/\\/g, '/')), 'utf-8');
      }

      try {
        await fs.access(updatesPath);
      } catch {
        await fs.writeFile(updatesPath, generateInitialUpdates(project), 'utf-8');
      }
    }
  } catch (err) {
    console.error('Erro ao semear projetos padrão:', err);
  }
}
