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

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, slug: true, title: true, excerpt: true,
      isPublished: true, publishedAt: true, tags: true, readingTimeMinutes: true,
    },
  });

  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const post = await prisma.blogPost.create({
    data: {
      slug: body.slug,
      title: body.title,
      excerpt: body.excerpt || null,
      contentHtml: body.contentHtml,
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      tags: body.tags || [],
      readingTimeMinutes: body.readingTimeMinutes || null,
      isPublished: body.isPublished ?? false,
      publishedAt: body.isPublished ? new Date() : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'CREATE',
      entityType: 'BlogPost',
      entityId: post.id,
      details: `Created post: ${post.title}`,
    },
  });

  return NextResponse.json({ post }, { status: 201 });
}
