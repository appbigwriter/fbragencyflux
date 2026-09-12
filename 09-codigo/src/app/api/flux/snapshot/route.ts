import { NextResponse } from 'next/server'
import { getSnapshot } from '@/lib/flux-repository'
import { jsonError } from '@/lib/api'

export async function GET() { try { return NextResponse.json(await getSnapshot()) } catch (error) { return jsonError(error) } }
