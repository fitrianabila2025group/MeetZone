import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allSettings = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};
  for (const s of allSettings) {
    settings[s.key] = s.value;
  }

  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { settings } = await req.json();
  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'Invalid settings' }, { status: 400 });
  }

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'SiteSetting',
      entityId: 'bulk',
      details: `Updated ${Object.keys(settings).length} settings`,
    },
  });

  return NextResponse.json({ success: true });
}
