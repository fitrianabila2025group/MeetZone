import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const siteUrl = await getSiteUrl();
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
  return new NextResponse(robotsTxt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
