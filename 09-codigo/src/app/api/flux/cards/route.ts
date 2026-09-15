import { NextResponse } from 'next/server'
import { getScopedSnapshot } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'
import { readScopeFromRequest } from '@/lib/read-scope'

export async function GET(request: Request) { try { return NextResponse.json((await getScopedSnapshot(readScopeFromRequest(request), process.env.NODE_ENV === 'test' ? process.env.FLUX_DATA_FILE : undefined)).cards) } catch (error) { return jsonError(error) } }
