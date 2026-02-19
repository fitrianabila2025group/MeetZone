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
  const faq = await prisma.fAQ.update({
    where: { id: params.id },
    data: {
      ...(body.question !== undefined && { question: body.question }),
      ...(body.answer !== undefined && { answer: body.answer }),
      ...(body.pairSlug !== undefined && { pairSlug: body.pairSlug }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
    },
  });

  return NextResponse.json({ faq });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.fAQ.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'DELETE',
      entityType: 'FAQ',
      entityId: params.id,
      details: 'Deleted FAQ',
    },
  });

  return NextResponse.json({ success: true });
}
