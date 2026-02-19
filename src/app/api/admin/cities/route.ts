import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 999);
  const search = searchParams.get('search') || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { slug: { contains: search, mode: 'insensitive' } },
      { countryName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      include: { timezone: { select: { id: true, ianaName: true } } },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.city.count({ where }),
  ]);

  return NextResponse.json({ cities, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, slug, countryCode, countryName, lat, lng, population, timezoneId, isActive } = body;

  if (!name || !countryCode || !countryName || !timezoneId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const city = await prisma.city.create({
    data: {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      countryCode,
      countryName,
      lat: lat || 0,
      lng: lng || 0,
      population: population || 0,
      timezoneId,
      isActive: isActive ?? true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'City',
      entityId: city.id,
      details: `Created city: ${name}`,
    },
  });

  return NextResponse.json({ city }, { status: 201 });
}
