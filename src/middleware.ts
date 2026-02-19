import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (except /admin and /admin/login)
  if (
    pathname.startsWith('/admin') &&
    pathname !== '/admin' &&
    pathname !== '/admin/login'
  ) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== 'ADMIN' && token.role !== 'EDITOR')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path+', '/api/admin/:path*'],
};
