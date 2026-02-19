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

  const blocks = await prisma.internalLinkBlock.findMany({ orderBy: { blockKey: 'asc' } });
  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const block = await prisma.internalLinkBlock.create({
    data: {
      blockKey: body.blockKey,
      linksJson: body.linksJson || '[]',
    },
  });

  return NextResponse.json({ block }, { status: 201 });
}
