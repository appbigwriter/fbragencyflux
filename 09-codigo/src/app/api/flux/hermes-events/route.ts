import { NextResponse } from 'next/server'
import { dispatchIncoming, type FluxDispatchEvent } from '@/lib/dispatcher'
import { getJob, upsertJob } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { translateHermesEvent, verifyHermesSignature, type HermesWebhookEnvelope } from '@/lib/hermes-webhook'

export async function POST(request: Request) {
  try {
    const raw = await request.text()
    verifyHermesSignature(raw, request.headers.get('x-hermes-signature-256'), process.env.HERMES_FLUX_WEBHOOK_SECRET)
    const translated = translateHermesEvent(JSON.parse(raw) as HermesWebhookEnvelope)
    if (!translated) return NextResponse.json({ ignored: true, reason: 'unsupported-or-missing-task-id' })
    try {
      await getJob(translated.jobId)
    } catch {
      await upsertJob({ ...translated.payload, jobId: translated.jobId, status: 'planned', correlationId: translated.correlationId, updatedAt: translated.sentAt }, { actor: 'Hermes', scope: 'local' })
    }
    return NextResponse.json(await dispatchIncoming(translated as FluxDispatchEvent, { actor: 'Hermes', scope: 'local' }))
  } catch (error) {
    return jsonError(error)
  }
}
