import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { csv, dryRun } = await req.json();
  if (!csv) return NextResponse.json({ error: 'No CSV data' }, { status: 400 });

  const lines = csv.trim().split('\n').filter((l: string) => l.trim());
  const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

  // Load all timezones for lookup
  const allTimezones = await prisma.timezone.findMany();
  const tzMap = new Map<string, string>();
  for (const tz of allTimezones) {
    tzMap.set(tz.ianaName, tz.id);
  }

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(',').map((s: string) => s.trim());
    if (parts.length < 8) {
      results.errors.push(`Line ${i + 1}: Expected 8 columns, got ${parts.length}`);
      results.skipped++;
      continue;
    }

    const [name, slug, countryCode, countryName, lat, lng, population, ianaTimezone] = parts as string[];
    const timezoneId: string | undefined = tzMap.get(ianaTimezone);
    if (!timezoneId) {
      results.errors.push(`Line ${i + 1}: Unknown timezone "${ianaTimezone}"`);
      results.skipped++;
      continue;
    }

    if (!dryRun) {
      const existing = await prisma.city.findUnique({ where: { slug } });
      if (existing) {
        await prisma.city.update({
          where: { slug },
          data: { name, countryCode, countryName, lat: parseFloat(lat), lng: parseFloat(lng), population: parseInt(population), timezoneId },
        });
        results.updated++;
      } else {
        await prisma.city.create({
          data: { name, slug, countryCode, countryName, lat: parseFloat(lat), lng: parseFloat(lng), population: parseInt(population), timezoneId },
        });
        results.created++;
      }
    } else {
      const existing = await prisma.city.findUnique({ where: { slug } });
      if (existing) results.updated++;
      else results.created++;
    }
  }

  if (!dryRun) {
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'CREATE',
        entityType: 'City',
        entityId: 'bulk',
        details: `CSV import: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
      },
    });
  }

  return NextResponse.json(results);
}
