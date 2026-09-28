// Wrapper de inicialização segura para o Next.js Standalone na porta 3400
process.env.PORT = process.env.PORT || '3400';
process.env.HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log(`🚀 Iniciando FBR Agency Flux Standalone em http://${process.env.HOSTNAME}:${process.env.PORT}...`);

import('./.next/standalone/server.js');
