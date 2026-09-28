import fs from 'fs';
import path from 'path';
import https from 'https';

const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '..', '.env.local'),
  path.resolve(process.cwd(), 'app', '.env.local')
];

let key = '';
for (const envLocalPath of candidateEnvPaths) {
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf-8');
    for (const line of envContent.split('\n')) {
      if (line.trim().startsWith('OPENAI_API_KEY=')) {
        key = line.trim().substring('OPENAI_API_KEY='.length).trim().replace(/^['"]|['"]$/g, '');
        break;
      }
    }
  }
  if (key) break;
}

if (!key) {
  console.log('No key found in candidate paths');
  process.exit(1);
}

const req = https.request({
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/models',
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + key }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.data) {
        const all = json.data.map(m => m.id);
        console.log('Total models available:', all.length);
        console.log('Image / DALL-E models:', all.filter(id => id.includes('dall') || id.includes('image')));
        console.log('Sample models:', all.slice(0, 15));
      } else {
        console.log('API Response:', json);
      }
    } catch (e) {
      console.log('Parse error, raw:', data);
    }
  });
});
req.on('error', console.error);
req.end();
