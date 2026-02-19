import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const pairs = await prisma.popularPair.findMany({
    take: 50,
    orderBy: { priority: 'asc' },
    include: {
      fromCity: { include: { timezone: true } },
      toCity: { include: { timezone: true } },
    },
  });

  return NextResponse.json({ pairs });
}
