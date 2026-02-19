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
  const pair = await prisma.popularPair.update({
    where: { id: params.id },
    data: {
      ...(body.fromCityId && { fromCityId: body.fromCityId }),
      ...(body.toCityId && { toCityId: body.toCityId }),
      ...(body.priority !== undefined && { priority: body.priority }),
    },
  });

  return NextResponse.json({ pair });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.popularPair.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'DELETE',
      entityType: 'PopularPair',
      entityId: params.id,
      details: 'Deleted pair',
    },
  });

  return NextResponse.json({ success: true });
}
