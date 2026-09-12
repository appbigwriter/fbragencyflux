import { NextResponse } from 'next/server'
import { FluxError } from '@/lib/flux-repository'

export function jsonError(error: unknown) {
  const problem = error instanceof FluxError ? error : new FluxError('INTERNAL_ERROR', 'Unable to update local Flux state', 500)
  return NextResponse.json({ error: problem.code, message: problem.message }, { status: problem.status })
}
