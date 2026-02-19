import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const post = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.excerpt !== undefined && { excerpt: body.excerpt }),
      ...(body.contentHtml !== undefined && { contentHtml: body.contentHtml }),
      ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle }),
      ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription }),
      ...(body.tags !== undefined && { tags: body.tags }),
      ...(body.readingTimeMinutes !== undefined && { readingTimeMinutes: body.readingTimeMinutes }),
      ...(body.isPublished !== undefined && {
        isPublished: body.isPublished,
        publishedAt: body.isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
      }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'UPDATE',
      entityType: 'BlogPost',
      entityId: post.id,
      details: `Updated post: ${post.title}`,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const post = await prisma.blogPost.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'DELETE',
      entityType: 'BlogPost',
      entityId: params.id,
      details: `Deleted post: ${post.title}`,
    },
  });

  return NextResponse.json({ success: true });
}
