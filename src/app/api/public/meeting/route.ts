import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from '@/lib/nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cityIds, baseCityId, dateTimeISO } = body;

    if (!cityIds || !Array.isArray(cityIds) || cityIds.length < 2) {
      return NextResponse.json({ error: 'At least 2 cities required' }, { status: 400 });
    }

    const slug = nanoid(10);
    const meeting = await prisma.meetingShare.create({
      data: {
        slug,
        cityIds: JSON.stringify(cityIds),
        baseCityId: baseCityId || cityIds[0],
        dateTimeISO: dateTimeISO || new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return NextResponse.json({ slug: meeting.slug });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
