import { NextResponse } from 'next/server'
import { clearCookie, getSession, logout } from '../../../../lib/auth'
import { jsonError } from '../../../../lib/api'
export async function GET(request: Request) { try { return NextResponse.json(getSession(request)) } catch (error) { return jsonError(error) } }
export async function DELETE(request: Request) { logout(request); const response = NextResponse.json({ ok: true }); response.headers.set('set-cookie', clearCookie()); return response }
