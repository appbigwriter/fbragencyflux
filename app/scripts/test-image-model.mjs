import fs from 'fs';
import path from 'path';
import https from 'https';

const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '..', '.env.local'),
  path.resolve(process.cwd(), 'app', '.env.local')
];

let OPENAI_API_KEY = '';
for (const envLocalPath of candidateEnvPaths) {
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      if (line.trim().startsWith('OPENAI_API_KEY=')) {
        OPENAI_API_KEY = line.trim().substring('OPENAI_API_KEY='.length).trim().replace(/^['"]|['"]$/g, '');
        break;
      }
    }
  }
  if (OPENAI_API_KEY) break;
}

async function testModel(modelName) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: modelName,
      prompt: 'A minimalist gaming setup on a wooden desk, studio photography, clean aesthetic',
      n: 1,
      size: '1024x1024'
    });

    const req = https.request({
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ model: modelName, status: res.statusCode, json });
        } catch (e) {
          resolve({ model: modelName, status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (err) => resolve({ model: modelName, error: err.message }));
    req.write(payload);
    req.end();
  });
}

async function run() {
  const models = ['gpt-image-1', 'gpt-image-1.5', 'gpt-image-2', 'chatgpt-image-latest'];
  for (const m of models) {
    console.log(`Testing model: ${m}...`);
    const res = await testModel(m);
    if (res.json && res.json.data && res.json.data[0]) {
      console.log(`✅ Model ${m} SUCCEEDED! URL received.`);
      break;
    } else {
      console.log(`❌ Model ${m} response:`, res.json?.error?.message || res);
    }
  }
}

run();
