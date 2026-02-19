import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const pairs = await prisma.popularPair.findMany({
    include: {
      fromCity: { select: { id: true, name: true, slug: true } },
      toCity: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { priority: 'desc' },
  });

  return NextResponse.json({ pairs });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { fromCityId, toCityId, priority } = body;

  if (!fromCityId || !toCityId) {
    return NextResponse.json({ error: 'Missing cities' }, { status: 400 });
  }

  const fromCity = await prisma.city.findUnique({ where: { id: fromCityId } });
  const toCity = await prisma.city.findUnique({ where: { id: toCityId } });
  if (!fromCity || !toCity) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 });
  }

  const slug = `${fromCity.slug}-to-${toCity.slug}`;

  const pair = await prisma.popularPair.create({
    data: { fromCityId, toCityId, slug, priority: priority || 0 },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'PopularPair',
      entityId: pair.id,
      details: `Created pair: ${slug}`,
    },
  });

  return NextResponse.json({ pair }, { status: 201 });
}
