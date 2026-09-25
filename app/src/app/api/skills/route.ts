import { NextResponse } from 'next/server';
import { listSkills } from '@/lib/projects';

export async function GET() {
  try {
    const skills = await listSkills();
    return NextResponse.json({ success: true, skills });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
