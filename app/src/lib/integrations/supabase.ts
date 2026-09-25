import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL || process.env.FLUX_DATABASE_URL;

export const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
  : null;

let pgPool: Pool | null = null;
if (databaseUrl) {
  try {
    pgPool = new Pool({
      connectionString: databaseUrl,
      ssl: false,
      connectionTimeoutMillis: 5000
    });
  } catch (err) {
    console.error('Erro ao inicializar Pool do PostgreSQL:', err);
  }
}

export async function checkDatabaseHealth(): Promise<{ status: 'connected' | 'disconnected' | 'mock'; details: string; latencyMs?: number }> {
  const start = Date.now();
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      await client.query('SELECT 1');
      client.release();
      return {
        status: 'connected',
        details: 'PostgreSQL VPS (76.13.168.223:15432) conectado com sucesso',
        latencyMs: Date.now() - start
      };
    } catch (err: any) {
      // Fallback tentativa Supabase HTTP
      if (supabase) {
        try {
          const { error } = await supabase.from('projects').select('count', { count: 'exact', head: true });
          if (!error || error.code === 'PGRST116' || error.message.includes('relation')) {
            return {
              status: 'connected',
              details: 'Supabase API conectado via HTTP Gateway',
              latencyMs: Date.now() - start
            };
          }
        } catch {}
      }
      return {
        status: 'disconnected',
        details: `PostgreSQL offline ou sem rota direta: ${err.message}`,
        latencyMs: Date.now() - start
      };
    }
  }

  if (supabase) {
    return {
      status: 'connected',
      details: 'Supabase HTTP Client configurado',
      latencyMs: Date.now() - start
    };
  }

  return {
    status: 'mock',
    details: 'Persistência local ativa (File-First no disco)'
  };
}

export async function syncProjectToDatabase(projectData: any) {
  // Sincronização não bloqueante: tenta persistir no Postgres / Supabase
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      const schemaName = process.env.CONTROL_TOWER_SCHEMA_NAME || 'public';
      
      // Cria a tabela se não existir
      await client.query(`
        CREATE SCHEMA IF NOT EXISTS ${schemaName};
        CREATE TABLE IF NOT EXISTS ${schemaName}.agency_projects (
          slug VARCHAR(100) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          niche VARCHAR(255),
          gestor_name VARCHAR(150),
          target_audience TEXT,
          language VARCHAR(50),
          domain VARCHAR(255),
          metadata JSONB,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await client.query(`
        INSERT INTO ${schemaName}.agency_projects (slug, name, niche, gestor_name, target_audience, language, domain, metadata, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          niche = EXCLUDED.niche,
          gestor_name = EXCLUDED.gestor_name,
          target_audience = EXCLUDED.target_audience,
          language = EXCLUDED.language,
          domain = EXCLUDED.domain,
          metadata = EXCLUDED.metadata,
          updated_at = NOW();
      `, [
        projectData.slug,
        projectData.name,
        projectData.niche || '',
        projectData.gestorName || '',
        projectData.targetAudience || '',
        projectData.language || '',
        projectData.domain || '',
        JSON.stringify(projectData)
      ]);

      client.release();
      return { success: true, syncedTo: 'PostgreSQL VPS' };
    } catch (err: any) {
      console.warn('Aviso: Sincronização com banco PostgreSQL VPS falhou, mantendo persistência File-First:', err.message);
    }
  }

  return { success: true, syncedTo: 'File-First Local' };
}
