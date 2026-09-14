import { NextResponse } from 'next/server'
import { dispatchIncoming, verifyDispatcherToken, type FluxDispatchEvent } from '@/lib/dispatcher'
import { jsonError } from '@/lib/api'

export async function POST(request: Request) {
  try { verifyDispatcherToken(request); const event = await request.json() as FluxDispatchEvent; return NextResponse.json(await dispatchIncoming(event, { actor: 'Hermes', scope: 'local' })) }
  catch (error) { return jsonError(error) }
}
