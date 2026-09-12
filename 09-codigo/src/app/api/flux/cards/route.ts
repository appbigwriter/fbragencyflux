import { NextResponse } from 'next/server'
import { getState } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'

export async function GET() { try { return NextResponse.json((await getState()).cards) } catch (error) { return jsonError(error) } }
