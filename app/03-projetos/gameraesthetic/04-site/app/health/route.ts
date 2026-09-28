import { NextResponse } from 'next/server';
export function GET() { return NextResponse.json({ status: 'ok', service: 'gamer-aesthetic', project: '078193b2-20ed-4ca3-aa52-ba047846edb9' }); }
