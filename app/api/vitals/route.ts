import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // 实际项目中可写入数据库或转发至 Sentry
  console.log('[Web Vital]', body);
  return NextResponse.json({ ok: true });
}
