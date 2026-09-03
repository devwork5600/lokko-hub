import { NextResponse } from 'next/server';

import { prisma } from '@lokko-hub/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', database: 'up' });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({ status: 'error', database: 'down' }, { status: 503 });
  }
}
