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
  if (pgPool) {
    try {
      const client = await pgPool.connect();
      const schemaName = process.env.CONTROL_TOWER_SCHEMA_NAME || 'custom_agency';
      
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
          status VARCHAR(50) DEFAULT 'active',
          brief_content TEXT,
          backlog_content TEXT,
          prompt_content TEXT,
          updates_content TEXT,
          metadata JSONB,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        ALTER TABLE ${schemaName}.agency_projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
        ALTER TABLE ${schemaName}.agency_projects ADD COLUMN IF NOT EXISTS brief_content TEXT;
        ALTER TABLE ${schemaName}.agency_projects ADD COLUMN IF NOT EXISTS backlog_content TEXT;
        ALTER TABLE ${schemaName}.agency_projects ADD COLUMN IF NOT EXISTS prompt_content TEXT;
        ALTER TABLE ${schemaName}.agency_projects ADD COLUMN IF NOT EXISTS updates_content TEXT;
      `);

      await client.query(`
        INSERT INTO ${schemaName}.agency_projects (
          slug, name, niche, gestor_name, target_audience, language, domain, status, brief_content, backlog_content, prompt_content, updates_content, metadata, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          niche = EXCLUDED.niche,
          gestor_name = EXCLUDED.gestor_name,
          target_audience = EXCLUDED.target_audience,
          language = EXCLUDED.language,
          domain = EXCLUDED.domain,
          status = COALESCE(EXCLUDED.status, ${schemaName}.agency_projects.status),
          brief_content = COALESCE(EXCLUDED.brief_content, ${schemaName}.agency_projects.brief_content),
          backlog_content = COALESCE(EXCLUDED.backlog_content, ${schemaName}.agency_projects.backlog_content),
          prompt_content = COALESCE(EXCLUDED.prompt_content, ${schemaName}.agency_projects.prompt_content),
          updates_content = COALESCE(EXCLUDED.updates_content, ${schemaName}.agency_projects.updates_content),
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
        projectData.status || 'active',
        projectData.briefContent || null,
        projectData.backlogContent || null,
        projectData.promptContent || null,
        projectData.updatesContent || null,
        JSON.stringify(projectData)
      ]);

      client.release();
      return { success: true, syncedTo: 'PostgreSQL VPS' };
    } catch (err: any) {
      console.warn('Aviso: Sincronização com banco PostgreSQL VPS falhou:', err.message);
    }
  }

  return { success: true, syncedTo: 'File-First Local' };
}

export async function updateProjectFieldInDatabase(slug: string, field: 'brief_content' | 'backlog_content' | 'prompt_content' | 'updates_content', value: string) {
  if (!pgPool) return false;
  try {
    const client = await pgPool.connect();
    const schemaName = process.env.CONTROL_TOWER_SCHEMA_NAME || 'custom_agency';
    await client.query(`
      UPDATE ${schemaName}.agency_projects
      SET ${field} = $1, updated_at = NOW()
      WHERE slug = $2
    `, [value, slug]);
    client.release();
    return true;
  } catch (err: any) {
    console.warn(`Falha ao atualizar coluna ${field} do projeto ${slug} no Postgres VPS:`, err.message);
    return false;
  }
}

export async function fetchProjectsFromDatabase(): Promise<any[]> {
  if (!pgPool) return [];

  try {
    const client = await pgPool.connect();
    const schemaName = process.env.CONTROL_TOWER_SCHEMA_NAME || 'custom_agency';

    let rows: any[] = [];
    try {
      const res = await client.query(`
        SELECT slug, name, niche, gestor_name, target_audience, language, domain, status, brief_content, backlog_content, prompt_content, updates_content, metadata, updated_at 
        FROM ${schemaName}.agency_projects 
        ORDER BY updated_at DESC
      `);
      rows = res.rows;
    } catch {
      try {
        const res = await client.query(`
          SELECT slug, name, niche, gestor_name, target_audience, language, domain, status, brief_content, backlog_content, prompt_content, updates_content, metadata, updated_at 
          FROM custom_agency.agency_projects 
          ORDER BY updated_at DESC
        `);
        rows = res.rows;
      } catch {}
    }

    client.release();
    return rows;
  } catch (err: any) {
    console.warn('Falha ao buscar projetos do PostgreSQL VPS:', err.message);
    return [];
  }
}

export async function fetchProjectDetailFromDatabase(slug: string): Promise<any | null> {
  if (!pgPool) return null;

  try {
    const client = await pgPool.connect();
    const schemaName = process.env.CONTROL_TOWER_SCHEMA_NAME || 'custom_agency';

    let row = null;
    try {
      const res = await client.query(`
        SELECT slug, name, niche, gestor_name, target_audience, language, domain, status, brief_content, backlog_content, prompt_content, updates_content, metadata, updated_at 
        FROM ${schemaName}.agency_projects 
        WHERE slug = $1
      `, [slug]);
      if (res.rows.length > 0) row = res.rows[0];
    } catch {
      try {
        const res = await client.query(`
          SELECT slug, name, niche, gestor_name, target_audience, language, domain, status, brief_content, backlog_content, prompt_content, updates_content, metadata, updated_at 
          FROM custom_agency.agency_projects 
          WHERE slug = $1
        `, [slug]);
        if (res.rows.length > 0) row = res.rows[0];
      } catch {}
    }

    client.release();
    return row;
  } catch (err: any) {
    console.warn(`Falha ao buscar projeto ${slug} do PostgreSQL VPS:`, err.message);
    return null;
  }
}


