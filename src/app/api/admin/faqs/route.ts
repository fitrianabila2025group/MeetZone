import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const faqs = await prisma.fAQ.findMany({ orderBy: [{ pairSlug: 'asc' }, { sortOrder: 'asc' }] });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const faq = await prisma.fAQ.create({
    data: {
      scope: body.scope || 'global',
      question: body.question,
      answer: body.answer,
      pairSlug: body.pairSlug || null,
      sortOrder: body.sortOrder || 0,
      published: body.isPublished ?? true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'FAQ',
      entityId: faq.id,
      details: `Created FAQ: ${faq.question.slice(0, 50)}`,
    },
  });

  return NextResponse.json({ faq }, { status: 201 });
}
