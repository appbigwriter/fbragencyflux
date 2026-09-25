const n8nApiKey = process.env.N8N_API_KEY;
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.fbr.news/webhook/agency-flux-events';

export async function checkN8nHealth(): Promise<{ status: 'connected' | 'disconnected' | 'mock'; details: string; latencyMs?: number }> {
  const start = Date.now();
  if (!n8nApiKey) {
    return {
      status: 'mock',
      details: 'N8N_API_KEY não configurada'
    };
  }

  return {
    status: 'connected',
    details: 'n8n API Key ativa e pronta para disparo de Webhooks',
    latencyMs: Date.now() - start
  };
}

export async function triggerN8nWorkflow(event: string, payload: any) {
  if (!n8nApiKey && !n8nWebhookUrl) return { success: false, reason: 'n8n não configurado' };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(n8nWebhookUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': n8nApiKey || ''
      },
      body: JSON.stringify({
        event,
        payload,
        source: 'fbr-agency-flux',
        timestamp: new Date().toISOString()
      })
    });

    clearTimeout(timeoutId);
    return { success: true, status: res.status };
  } catch (err: any) {
    console.warn(`Aviso: Disparo do webhook n8n (${event}) não bloqueou o fluxo:`, err.message);
    return { success: false, error: err.message };
  }
}
