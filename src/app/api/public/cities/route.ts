import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || '';
  if (q.length < 2) {
    return NextResponse.json({ cities: [] });
  }

  const cities = await prisma.city.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q.toLowerCase() } },
        { countryName: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: { timezone: true },
    take: 15,
    orderBy: { population: 'desc' },
  });

  return NextResponse.json({ cities });
}
