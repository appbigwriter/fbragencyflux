import fs from 'fs';
import path from 'path';
import https from 'https';

// Carregar variáveis de .env.local se disponível
const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '..', '.env.local'),
  path.resolve(process.cwd(), 'app', '.env.local')
];

for (const envLocalPath of candidateEnvPaths) {
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        const val = v.join('=').trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[k.trim()]) {
          process.env[k.trim()] = val;
        }
      }
    }
  }
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('\n❌ ERRO: OPENAI_API_KEY não foi encontrada.');
  console.error('Por favor, adicione sua chave no arquivo .env.local ou defina a variável de ambiente OPENAI_API_KEY.');
  console.error('Exemplo no .env.local: OPENAI_API_KEY=sk-proj-...\n');
  process.exit(1);
}

const PROJECTS_DIR = path.resolve('..', '03-projetos');

// Definições de imagens por projeto
const IMAGES_CATALOG = {
  gameraesthetic: [
    {
      type: 'hero',
      destPath: '04-site/public/images/hero/hero-main.png',
      size: '1536x1024',
      prompt: 'Cinematic ultra-clean modern gaming battlestation with curved ultrawide OLED monitor, minimalist Scandinavian walnut desk, subtle cyber cyan and warm amber accent LED lighting, matte black mechanical keyboard, studio photography, 8k resolution, photorealistic, elegant atmosphere'
    },
    {
      type: 'article',
      destPath: '04-site/public/images/articles/artigo-01-gaming-monitors.png',
      size: '1536x1024',
      prompt: 'Professional side-by-side comparison of two high-end modern gaming monitors on a clean desk, one 4K OLED display showing crisp vibrant game textures and one high refresh rate esports monitor, professional tech review product photography, studio lighting'
    },
    {
      type: 'article',
      destPath: '04-site/public/images/articles/artigo-02-wired-vs-wireless-headsets.png',
      size: '1536x1024',
      prompt: 'Close-up studio product photography of sleek premium matte black wireless gaming headset resting on an aluminum and walnut headphone stand, subtle RGB accents, crisp audio gear aesthetic, soft depth of field'
    },
    {
      type: 'article',
      destPath: '04-site/public/images/articles/artigo-03-beginner-gaming-setup.png',
      size: '1536x1024',
      prompt: 'Cozy ergonomic minimalist budget-friendly gaming room setup, compact desk with single clean monitor, pastel ambient backlighting, neat cable management, plant decoration, warm cinematic lifestyle photography'
    },
    {
      type: 'author',
      destPath: '04-site/public/images/authors/tara-lindqvist.png',
      size: '1024x1024',
      prompt: 'Professional editorial headshot portrait of Tara Lindqvist, a 29-year-old Scandinavian tech and gaming journalist with a confident warm smile, modern studio backdrop, soft natural lighting, realistic portrait photography, 85mm lens'
    }
  ]
};

async function callOpenAiImage(prompt, size = '1024x1024') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      n: 1,
      size
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) {
            reject(new Error(json.error.message));
          } else if (json.data && json.data[0]) {
            if (json.data[0].b64_json) {
              resolve({ type: 'b64', data: json.data[0].b64_json });
            } else if (json.data[0].url) {
              resolve({ type: 'url', data: json.data[0].url });
            } else {
              reject(new Error('Formato desconhecido no retorno da imagem'));
            }
          } else {
            reject(new Error('Resposta inválida da OpenAI: ' + data));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  const projectSlug = process.argv[2] || 'gameraesthetic';
  const list = IMAGES_CATALOG[projectSlug];

  if (!list) {
    console.log(`Catálogo não encontrado para '${projectSlug}'. Disponíveis: ${Object.keys(IMAGES_CATALOG).join(', ')}`);
    process.exit(1);
  }

  console.log(`🎨 Iniciando geração de imagens via OpenAI gpt-image-1 para o projeto: ${projectSlug}`);
  console.log(`📋 Total de imagens a gerar: ${list.length}\n`);

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const fullDestPath = path.join(PROJECTS_DIR, projectSlug, item.destPath);
    
    console.log(`[${i + 1}/${list.length}] 🚀 Gerando (${item.type} ${item.size}): ${item.destPath}...`);
    console.log(`   📝 Prompt: "${item.prompt.substring(0, 80)}..."`);
    
    try {
      const imgResult = await callOpenAiImage(item.prompt, item.size);
      if (imgResult.type === 'b64') {
        fs.mkdirSync(path.dirname(fullDestPath), { recursive: true });
        fs.writeFileSync(fullDestPath, Buffer.from(imgResult.data, 'base64'));
        console.log(`   💾 Imagem decodificada e salva com sucesso!`);
      } else {
        console.log(`   ⬇️  Baixando imagem gerada...`);
        await downloadFile(imgResult.data, fullDestPath);
      }
      console.log(`   ✅ Salvo em: ${fullDestPath}\n`);
    } catch (err) {
      console.error(`   ❌ Falha ao gerar ${item.destPath}:`, err.message);
    }
  }

  console.log('🎉 Processo de geração e persistência de imagens concluído com sucesso!');
}

main().catch(console.error);
