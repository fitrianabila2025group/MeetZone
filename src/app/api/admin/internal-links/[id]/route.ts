import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const block = await prisma.internalLinkBlock.update({
    where: { id: params.id },
    data: {
      ...(body.blockKey !== undefined && { blockKey: body.blockKey }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.linksJson !== undefined && { linksJson: body.linksJson }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  });

  return NextResponse.json({ block });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.internalLinkBlock.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
