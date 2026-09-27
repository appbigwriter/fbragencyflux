import fs from 'fs/promises';
import path from 'path';

async function copyDir(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (err) {
    // Ignora se diretório de origem não existir
  }
}

async function main() {
  console.log('📦 Preparando assets para execução Standalone...');
  
  const staticSrc = path.resolve('.next', 'static');
  const staticDest = path.resolve('.next', 'standalone', '.next', 'static');
  
  const publicSrc = path.resolve('public');
  const publicDest = path.resolve('.next', 'standalone', 'public');

  await copyDir(staticSrc, staticDest);
  await copyDir(publicSrc, publicDest);
  
  console.log('✅ Assets estáticos copiados com sucesso para .next/standalone/');
}

main().catch(console.error);
