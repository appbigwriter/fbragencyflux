import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'agency',
    projectId: process.env.CONTROL_TOWER_PROJECT_ID || '9c8ababb-7cb6-4b67-b0a4-c9c6f9e78c2f',
    domain: 'agency.fbr.news',
  }, { status: 200 })
}
