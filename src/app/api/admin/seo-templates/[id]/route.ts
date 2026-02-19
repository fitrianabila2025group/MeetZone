import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const template = await prisma.seoTemplate.update({
    where: { id: params.id },
    data: {
      ...(body.titleTpl !== undefined && { titleTpl: body.titleTpl }),
      ...(body.metaTpl !== undefined && { metaTpl: body.metaTpl }),
      ...(body.introTpl !== undefined && { introTpl: body.introTpl }),
      ...(body.faqTplJson !== undefined && { faqTplJson: body.faqTplJson }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'SeoTemplate',
      entityId: template.id,
      details: `Updated template: ${template.scope}`,
    },
  });

  return NextResponse.json({ template });
}
