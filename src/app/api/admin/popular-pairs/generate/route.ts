import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Get top cities by population
  const topCities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { population: 'desc' },
    take: 20,
    select: { id: true, slug: true },
  });

  let created = 0;
  for (let i = 0; i < topCities.length; i++) {
    for (let j = i + 1; j < topCities.length; j++) {
      const slug = `${topCities[i].slug}-to-${topCities[j].slug}`;
      const exists = await prisma.popularPair.findUnique({ where: { slug } });
      if (!exists) {
        await prisma.popularPair.create({
          data: {
            fromCityId: topCities[i].id,
            toCityId: topCities[j].id,
            slug,
            priority: 20 - Math.max(i, j),
          },
        });
        created++;
      }
    }
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'PopularPair',
      entityId: 'bulk',
      details: `Bulk generated ${created} pairs`,
    },
  });

  return NextResponse.json({ created });
}
