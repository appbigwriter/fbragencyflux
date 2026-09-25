import { NextResponse } from 'next/server'
import { getGates } from '../../../../lib/flux-repository'
import { jsonError } from '../../../../lib/api'

export async function GET() {
  try { return NextResponse.json({ gates: await getGates() }) } catch (error) { return jsonError(error) }
}
