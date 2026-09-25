import { NextResponse } from 'next/server'
import { jsonError } from '@/lib/api'
import { getSnapshot } from '@/lib/flux-repository'

export async function GET() {
  try {
    const snapshot = await getSnapshot()
    return NextResponse.json({ lastCoordinatorRun: snapshot.coordinator?.lastCoordinatorRun || null, waitingReasons: snapshot.coordinator?.waitingReasons || [], holds: (snapshot.requiredActions || []).filter((item) => item.status === 'hold'), requiredActions: snapshot.requiredActions || [] })
  } catch (error) { return jsonError(error) }
}
