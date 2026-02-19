import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const meeting = await prisma.meetingShare.findUnique({
    where: { slug: params.slug },
  });
  if (!meeting) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const cityIds = JSON.parse(meeting.cityIds) as string[];
  const cities = await prisma.city.findMany({
    where: { id: { in: cityIds } },
  });

  const meetingDate = new Date(meeting.dateTimeISO);
  const endDate = new Date(meetingDate.getTime() + 60 * 60 * 1000); // 1 hour

  function formatICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//TimeWise//Meeting Planner//EN
BEGIN:VEVENT
DTSTART:${formatICSDate(meetingDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Meeting - ${cities.map((c: any) => c.name).join(', ')}
DESCRIPTION:Meeting across ${cities.length} cities: ${cities.map((c: any) => c.name).join(', ')}
UID:${meeting.slug}@timewise.online
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="meeting-${meeting.slug}.ics"`,
    },
  });
}
