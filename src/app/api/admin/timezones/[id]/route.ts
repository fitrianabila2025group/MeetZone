import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const tz = await prisma.timezone.update({
    where: { id: params.id },
    data: {
      ...(body.ianaName && { ianaName: body.ianaName }),
      ...(body.abbreviation && { abbreviation: body.abbreviation }),
      ...(body.utcOffsetMinutes !== undefined && { utcOffsetMinutes: body.utcOffsetMinutes }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'Timezone',
      entityId: tz.id,
      details: `Updated timezone: ${tz.ianaName}`,
    },
  });

  return NextResponse.json({ timezone: tz });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tz = await prisma.timezone.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'DELETE',
      entityType: 'Timezone',
      entityId: params.id,
      details: `Deleted timezone: ${tz.ianaName}`,
    },
  });

  return NextResponse.json({ success: true });
}
