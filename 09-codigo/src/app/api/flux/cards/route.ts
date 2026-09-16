import { NextResponse } from 'next/server'
import { getScopedSnapshot } from '@/lib/flux-repository'
import { getSession } from '@/lib/auth'
import { jsonError } from '@/lib/api'
import { readScopeFromRequest } from '@/lib/read-scope'

export async function GET(request: Request) { try { const scope = readScopeFromRequest(request); if (scope.visibility === 'private') getSession(request); return NextResponse.json((await getScopedSnapshot(scope, process.env.NODE_ENV === 'test' ? process.env.FLUX_DATA_FILE : undefined)).cards) } catch (error) { return jsonError(error) } }
