/**
 * Core timezone conversion logic using date-fns-tz.
 * All functions handle DST correctly by using IANA timezone identifiers.
 */

import { formatInTimeZone, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { format, addHours, startOfDay, setHours, setMinutes } from 'date-fns';

/** Get the current date/time in a given IANA zone */
export function getNowInZone(zone: string): Date {
  return toZonedTime(new Date(), zone);
}

/** Convert a zoned datetime from one zone to another */
export function convertZonedDateTime(
  inputDateTime: Date,
  fromZone: string,
  toZone: string
): Date {
  // inputDateTime represents wall-clock time in fromZone
  const utc = fromZonedTime(inputDateTime, fromZone);
  return toZonedTime(utc, toZone);
}

/** Get the UTC offset in minutes for a zone at a given instant */
export function getOffsetMinutes(date: Date, zone: string): number {
  const utcStr = formatInTimeZone(date, 'UTC', "yyyy-MM-dd'T'HH:mm:ssXXX");
  const zoneStr = formatInTimeZone(date, zone, "yyyy-MM-dd'T'HH:mm:ssXXX");
  const utcD = new Date(utcStr);
  const zoneD = new Date(zoneStr);
  // Difference in minutes (zone time - UTC)
  return Math.round((zoneD.getTime() - utcD.getTime()) / 60000);
}

/** Format a date in a given zone */
export function formatInZone(
  date: Date,
  zone: string,
  fmt: string = 'h:mm a'
): string {
  return formatInTimeZone(date, zone, fmt);
}

/** Format date in 24h */
export function formatInZone24(date: Date, zone: string): string {
  return formatInTimeZone(date, zone, 'HH:mm');
}

/** Get timezone abbreviation */
export function getZoneAbbr(date: Date, zone: string): string {
  return formatInTimeZone(date, zone, 'zzz');
}

/** Get UTC offset string like UTC+5:30 */
export function getUtcOffsetString(date: Date, zone: string): string {
  return formatInTimeZone(date, zone, 'OOOO');
}

/** Calculate offset difference between two zones in hours */
export function getOffsetDiffHours(
  date: Date,
  fromZone: string,
  toZone: string
): number {
  const fromOff = getOffsetMinutes(date, fromZone);
  const toOff = getOffsetMinutes(date, toZone);
  return (toOff - fromOff) / 60;
}

/** Check if a given zone observes DST */
export function observesDST(zone: string): boolean {
  const jan = new Date(2024, 0, 15);
  const jul = new Date(2024, 6, 15);
  return getOffsetMinutes(jan, zone) !== getOffsetMinutes(jul, zone);
}

/** Check if a date falls in DST for a zone */
export function isInDST(date: Date, zone: string): boolean {
  if (!observesDST(zone)) return false;
  const jan = new Date(date.getFullYear(), 0, 15);
  const janOff = getOffsetMinutes(jan, zone);
  const currentOff = getOffsetMinutes(date, zone);
  // DST is when offset is larger (further from UTC in positive direction)
  return currentOff !== janOff && currentOff > janOff;
}

interface WorkHoursRange {
  start: number; // 0-23
  end: number;   // 0-23
}

/**
 * Find overlap window of work hours across multiple timezones.
 * Returns array of UTC hours that fall within work hours for all zones.
 */
export function getOverlapWindow(
  date: Date,
  zones: string[],
  workHours: WorkHoursRange = { start: 9, end: 17 }
): number[] {
  const overlapHours: number[] = [];

  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const testDate = setMinutes(setHours(startOfDay(date), utcHour), 0);
    let allInRange = true;

    for (const zone of zones) {
      const zoned = toZonedTime(testDate, zone);
      const hour = zoned.getHours();
      if (hour < workHours.start || hour >= workHours.end) {
        allInRange = false;
        break;
      }
    }

    if (allInRange) {
      overlapHours.push(utcHour);
    }
  }

  return overlapHours;
}

/**
 * Generate example conversions for a pair page.
 * Returns 6 examples: morning, mid-morning, noon, afternoon, evening, night.
 */
export function generateExampleConversions(
  date: Date,
  fromZone: string,
  toZone: string
): Array<{ fromTime: string; toTime: string; label: string }> {
  const examples = [
    { hour: 6, label: 'Early Morning' },
    { hour: 9, label: 'Morning' },
    { hour: 12, label: 'Noon' },
    { hour: 15, label: 'Afternoon' },
    { hour: 18, label: 'Evening' },
    { hour: 21, label: 'Night' },
  ];

  return examples.map(({ hour, label }) => {
    const fromDate = setMinutes(setHours(startOfDay(date), hour), 0);
    const utc = fromZonedTime(fromDate, fromZone);
    const toDate = toZonedTime(utc, toZone);

    return {
      fromTime: formatInTimeZone(fromDate, fromZone, 'h:mm a'),
      toTime: formatInTimeZone(utc, toZone, 'h:mm a'),
      label,
    };
  });
}

/**
 * Find best meeting times between zones based on overlap scoring.
 */
export function findBestMeetingTimes(
  date: Date,
  zones: string[],
  workHours: WorkHoursRange = { start: 9, end: 17 }
): Array<{ utcHour: number; score: number; times: Record<string, string> }> {
  const results: Array<{
    utcHour: number;
    score: number;
    times: Record<string, string>;
  }> = [];

  for (let utcHour = 0; utcHour < 24; utcHour++) {
    const testDate = setMinutes(setHours(startOfDay(date), utcHour), 0);
    let score = 0;
    const times: Record<string, string> = {};

    for (const zone of zones) {
      const zoned = toZonedTime(testDate, zone);
      const hour = zoned.getHours();
      times[zone] = formatInTimeZone(testDate, zone, 'h:mm a');

      if (hour >= workHours.start && hour < workHours.end) {
        // Perfect work hours: higher score for "core" 10-16
        score += hour >= 10 && hour < 16 ? 3 : 2;
      } else if (hour >= 7 && hour < workHours.start) {
        score += 1; // Early but acceptable
      } else if (hour >= workHours.end && hour <= 19) {
        score += 1; // Late but acceptable
      }
      // Outside 7-19: score 0
    }

    results.push({ utcHour, score, times });
  }

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}
