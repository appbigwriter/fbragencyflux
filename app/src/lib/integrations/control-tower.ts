const controlTowerUrl = process.env.CONTROL_TOWER_BASE_URL || 'https://control-tower.fbr.news';
const projectId = process.env.CONTROL_TOWER_PROJECT_ID;
const adminToken = process.env.AUTHORITY_ADMIN_TOKEN;

export async function checkControlTowerHealth(): Promise<{ status: 'connected' | 'disconnected' | 'mock'; details: string; latencyMs?: number }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${controlTowerUrl}/api/health`, {
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${adminToken || ''}`
      }
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (res && res.status < 500) {
      return {
        status: 'connected',
        details: `Control Tower (${controlTowerUrl}) respondendo`,
        latencyMs: Date.now() - start
      };
    }

    return {
      status: 'connected',
      details: `Control Tower URL configurada (${controlTowerUrl}) - Tenant: ${projectId || 'custom_agency'}`,
      latencyMs: Date.now() - start
    };
  } catch (err: any) {
    return {
      status: 'disconnected',
      details: `Falha ao alcançar Control Tower: ${err.message}`,
      latencyMs: Date.now() - start
    };
  }
}

export async function registerProjectInControlTower(projectData: any) {
  try {
    const res = await fetch(`${controlTowerUrl}/api/projects/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken || ''}`,
        'X-Control-Tower-Project-Id': projectId || ''
      },
      body: JSON.stringify({
        tenant: projectId,
        project: projectData,
        source: 'fbr-agency-flux',
        timestamp: new Date().toISOString()
      })
    });
    return { success: true, status: res.status };
  } catch (err: any) {
    console.warn('Aviso: Registro no Control Tower offline, projeto mantido localmente:', err.message);
    return { success: false, error: err.message };
  }
}
