import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const data: any = {};
  if (body.email) data.email = body.email;
  if (body.name !== undefined) data.name = body.name;
  if (body.role) data.role = body.role;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.update({ where: { id: params.id }, data });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user.id,
      details: `Updated user: ${user.email}`,
    },
  });

  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Don't allow self-deletion
  if ((session.user as any).id === params.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  const user = await prisma.user.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'DELETE',
      entityType: 'User',
      entityId: params.id,
      details: `Deleted user: ${user.email}`,
    },
  });

  return NextResponse.json({ success: true });
}
