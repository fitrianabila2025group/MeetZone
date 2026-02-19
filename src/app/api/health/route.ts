import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const startTime = Date.now();

export async function GET() {
  let dbStatus = 'ok';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'down';
  }

  return NextResponse.json({
    ok: dbStatus === 'ok',
    db: dbStatus,
    version: '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
  });
}
