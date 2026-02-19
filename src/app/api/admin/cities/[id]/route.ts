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
  const city = await prisma.city.update({
    where: { id: params.id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.slug && { slug: body.slug }),
      ...(body.countryCode && { countryCode: body.countryCode }),
      ...(body.countryName && { countryName: body.countryName }),
      ...(body.lat !== undefined && { lat: body.lat }),
      ...(body.lng !== undefined && { lng: body.lng }),
      ...(body.population !== undefined && { population: body.population }),
      ...(body.timezoneId && { timezoneId: body.timezoneId }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'City',
      entityId: city.id,
      details: `Updated city: ${city.name}`,
    },
  });

  return NextResponse.json({ city });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const city = await prisma.city.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'DELETE',
      entityType: 'City',
      entityId: params.id,
      details: `Deleted city: ${city.name}`,
    },
  });

  return NextResponse.json({ success: true });
}
