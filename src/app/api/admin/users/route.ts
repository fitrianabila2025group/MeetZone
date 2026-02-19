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

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const { email, password, name, role, isActive } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash: hash, name: name || null, role: role || 'EDITOR', isActive: isActive ?? true },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'User',
      entityId: user.id,
      details: `Created user: ${email}`,
    },
  });

  return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
}
