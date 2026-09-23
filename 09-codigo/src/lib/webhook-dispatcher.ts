/**
 * Webhook Dispatcher para integração entre FBR Agency Flux e N8N / Hermes
 */

export interface FluxEventPayload {
  event: string
  timestamp: string
  project?: string
  stage?: 'authority_engine' | 'audience' | 'sales_engine' | 'control_tower'
  cardId?: string
  jobId?: string
  gateId?: string
  agent?: string
  data: Record<string, unknown>
}

export async function dispatchWebhook(payload: FluxEventPayload): Promise<{ success: boolean; status?: number; error?: string }> {
  const webhookUrl = process.env.FLUX_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL
  const webhookSecret = process.env.FLUX_WEBHOOK_SECRET || process.env.N8N_WEBHOOK_SECRET || 'flux-n8n-secret-token'

  if (!webhookUrl) {
    console.log('[WEBHOOK DISPATCHER] Nenhum webhook configurado (FLUX_WEBHOOK_URL / N8N_WEBHOOK_URL ausente). Pulando disparo.')
    return { success: true }
  }

  try {
    console.log(`[WEBHOOK DISPATCHER] Enviando evento "${payload.event}" para ${webhookUrl}...`)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-flux-signature': webhookSecret,
        'user-agent': 'FBR-Agency-Flux-Dispatcher/1.0',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.warn(`[WEBHOOK DISPATCHER] Resposta com status ${response.status} de ${webhookUrl}`)
      return { success: false, status: response.status, error: `HTTP ${response.status}` }
    }

    console.log(`[WEBHOOK DISPATCHER] Evento "${payload.event}" entregue com sucesso!`)
    return { success: true, status: response.status }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[WEBHOOK DISPATCHER ERRO] Falha ao enviar evento:`, msg)
    return { success: false, error: msg }
  }
}
