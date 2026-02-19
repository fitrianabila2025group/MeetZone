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

  const timezones = await prisma.timezone.findMany({
    include: { _count: { select: { cities: true } } },
    orderBy: { utcOffsetMinutes: 'asc' },
  });

  return NextResponse.json({ timezones });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { ianaName, abbreviation, utcOffsetMinutes } = body;

  if (!ianaName || !abbreviation) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const tz = await prisma.timezone.create({
    data: { ianaName, label: body.label || ianaName.split('/').pop() || ianaName, region: body.region || ianaName.split('/')[0] || 'Other', abbreviation, utcOffsetMinutes: utcOffsetMinutes || 0 },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'Timezone',
      entityId: tz.id,
      details: `Created timezone: ${ianaName}`,
    },
  });

  return NextResponse.json({ timezone: tz }, { status: 201 });
}
