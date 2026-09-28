import fs from 'fs/promises';
import path from 'path';

const projectsDir = path.resolve('..', '03-projetos');

async function debugAutoDetect(slug) {
  const pDir = path.join(projectsDir, slug);
  const blp = path.join(pDir, 'backlog.md');
  const backlog = await fs.readFile(blp, 'utf-8');
  const lines = backlog.split('\n');

  console.log(`\n=== DEBUG: ${slug} ===`);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('- [ ]')) {
      const fileMatch = line.match(/`((?:01-pesquisa|02-conteudo|03-design-ui|04-site|brief|updates|GESTOR)[^`]+)`/);
      if (fileMatch) {
        const relPath = fileMatch[1].trim();
        const fullPath = path.join(pDir, relPath);
        try {
          const stat = await fs.stat(fullPath);
          console.log(`Linha ${i}: [${relPath}] => isFile: ${stat.isFile()}, size: ${stat.size}, isDir: ${stat.isDirectory()}`);
          if (stat.isDirectory()) {
            const files = await fs.readdir(fullPath);
            console.log(`   Arquivos dentro do DIR: ${files.join(', ')}`);
          }
        } catch (e) {
          console.log(`Linha ${i}: [${relPath}] => NÃO EXISTE NO DISCO`);
        }
      }
    }
  }
}

async function main() {
  for (const s of ['after-forty', 'gameraesthetic', 'sharpeye', 'talk-to-your-crowd', 'thethirties']) {
    await debugAutoDetect(s);
  }
}

main().catch(console.error);
