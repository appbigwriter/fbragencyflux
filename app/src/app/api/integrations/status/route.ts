import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/integrations/supabase';
import { checkControlTowerHealth } from '@/lib/integrations/control-tower';
import { checkN8nHealth } from '@/lib/integrations/n8n';

export async function GET() {
  try {
    const [dbHealth, ctHealth, n8nHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkControlTowerHealth(),
      checkN8nHealth()
    ]);

    const integrations = [
      {
        id: 'database',
        name: 'PostgreSQL VPS / Supabase',
        target: '76.13.168.223:15432 / custom_agency',
        status: dbHealth.status,
        details: dbHealth.details,
        latencyMs: dbHealth.latencyMs
      },
      {
        id: 'control-tower',
        name: 'Control Tower API',
        target: 'https://control-tower.fbr.news',
        status: ctHealth.status,
        details: ctHealth.details,
        latencyMs: ctHealth.latencyMs
      },
      {
        id: 'n8n',
        name: 'n8n Automation Engine',
        target: 'N8N_API_KEY / Webhooks',
        status: n8nHealth.status,
        details: n8nHealth.details,
        latencyMs: n8nHealth.latencyMs
      },
      {
        id: 'hermes',
        name: 'Hermes Agent Dispatcher',
        target: 'Direct Local / Prompt Delivery',
        status: 'connected',
        details: 'Geração de prompts enriquecidos com skills ativas',
        latencyMs: 1
      }
    ];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      integrations
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
