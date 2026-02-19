import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await prisma.adsSetting.findFirst();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  let settings = await prisma.adsSetting.findFirst();

  const data: any = {};
  if (body.provider !== undefined) data.provider = body.provider;
  if (body.isEnabled !== undefined) data.isEnabled = body.isEnabled;
  if (body.adsensePublisherId !== undefined) data.adsensePublisherId = body.adsensePublisherId || null;
  if (body.adsenseVerificationMeta !== undefined) data.adsenseVerificationMeta = body.adsenseVerificationMeta || null;
  if (body.adsTxtContent !== undefined) data.adsTxtContent = body.adsTxtContent || null;
  if (body.headerSlotId !== undefined) data.headerSlotId = body.headerSlotId || null;
  if (body.sidebarSlotId !== undefined) data.sidebarSlotId = body.sidebarSlotId || null;
  if (body.inContentSlotId !== undefined) data.inContentSlotId = body.inContentSlotId || null;
  if (body.footerSlotId !== undefined) data.footerSlotId = body.footerSlotId || null;
  if (body.customHeadHtml !== undefined) data.customHeadHtml = body.customHeadHtml || null;
  if (body.customBodyHtml !== undefined) data.customBodyHtml = body.customBodyHtml || null;

  if (settings) {
    settings = await prisma.adsSetting.update({ where: { id: settings.id }, data });
  } else {
    settings = await prisma.adsSetting.create({ data });
  }

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'AdsSetting',
      entityId: settings.id,
      details: 'Updated ads settings',
    },
  });

  return NextResponse.json({ settings });
}
