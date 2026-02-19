import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ads = await prisma.adsSetting.findFirst();
    const adsTxt = ads?.adsTxtLines || '';
    return new NextResponse(adsTxt, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch {
    return new NextResponse('', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
