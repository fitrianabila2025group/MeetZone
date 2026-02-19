import { describe, it, expect } from 'vitest';
import {
  getNowInZone,
  convertZonedDateTime,
  getOffsetDiffHours,
  getUtcOffsetString,
  observesDST,
  getZoneAbbr,
  generateExampleConversions,
  findBestMeetingTimes,
} from '../lib/timezone';

function makeDate(year: number, month: number, day: number, hour: number = 0, minute: number = 0): Date {
  return new Date(year, month, day, hour, minute, 0, 0);
}

describe('Timezone Core Functions', () => {
  describe('getNowInZone', () => {
    it('returns a valid date for a known timezone', () => {
      const result = getNowInZone('America/New_York');
      expect(result).toBeInstanceOf(Date);
    });

    it('returns a valid date for UTC', () => {
      const result = getNowInZone('UTC');
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('convertZonedDateTime', () => {
    it('converts noon EST to 5pm GMT (winter)', () => {
      // January 15, 2024 — no DST
      const input = makeDate(2024, 0, 15, 12, 0);
      const result = convertZonedDateTime(input, 'America/New_York', 'Europe/London');
      // EST is UTC-5, GMT is UTC+0, so 12:00 EST = 17:00 GMT
      expect(result.getHours()).toBe(17);
      expect(result.getMinutes()).toBe(0);
    });

    it('converts noon EDT to 5pm BST (summer)', () => {
      // July 15, 2024 — DST active in both zones
      const input = makeDate(2024, 6, 15, 12, 0);
      const result = convertZonedDateTime(input, 'America/New_York', 'Europe/London');
      // EDT is UTC-4, BST is UTC+1, so 12:00 EDT = 17:00 BST
      expect(result.getHours()).toBe(17);
      expect(result.getMinutes()).toBe(0);
    });

    it('handles DST transition day correctly (spring forward)', () => {
      // March 10, 2024 — US spring forward (clocks jump 2:00 -> 3:00 AM)
      const input = makeDate(2024, 2, 10, 1, 0);
      const result = convertZonedDateTime(input, 'America/New_York', 'Europe/London');
      expect(result.getHours()).toBe(6);
    });

    it('handles DST transition day correctly (fall back)', () => {
      // Nov 3, 2024 — US fall back
      const input = makeDate(2024, 10, 3, 3, 0);
      const result = convertZonedDateTime(input, 'America/New_York', 'Europe/London');
      expect(result.getHours()).toBe(8);
    });

    it('converts between non-US timezones', () => {
      // Tokyo (JST UTC+9) to Sydney (AEDT UTC+11 in summer)
      const input = makeDate(2024, 0, 15, 12, 0);
      const result = convertZonedDateTime(input, 'Asia/Tokyo', 'Australia/Sydney');
      expect(result.getHours()).toBe(14);
    });

    it('handles India half-hour offset', () => {
      // IST is UTC+5:30, London GMT UTC+0
      const input = makeDate(2024, 0, 15, 12, 0);
      const result = convertZonedDateTime(input, 'Europe/London', 'Asia/Kolkata');
      expect(result.getHours()).toBe(17);
      expect(result.getMinutes()).toBe(30);
    });
  });

  describe('getOffsetDiffHours', () => {
    it('calculates correct difference between EST and GMT in winter', () => {
      const diff = getOffsetDiffHours(
        new Date(2024, 0, 15),
        'America/New_York',
        'Europe/London'
      );
      expect(diff).toBe(5);
    });

    it('calculates correct difference in summer with DST', () => {
      const diff = getOffsetDiffHours(
        new Date(2024, 6, 15),
        'America/New_York',
        'Europe/London'
      );
      expect(diff).toBe(5);
    });
  });

  describe('getUtcOffsetString', () => {
    it('returns correct offset for UTC', () => {
      const offset = getUtcOffsetString(new Date(), 'UTC');
      expect(offset).toMatch(/GMT/);
    });
  });

  describe('observesDST', () => {
    it('returns true for New York', () => {
      expect(observesDST('America/New_York')).toBe(true);
    });

    it('returns false for Asia/Tokyo', () => {
      expect(observesDST('Asia/Tokyo')).toBe(false);
    });

    it('returns true for London', () => {
      expect(observesDST('Europe/London')).toBe(true);
    });

    it('returns false for Asia/Kolkata', () => {
      expect(observesDST('Asia/Kolkata')).toBe(false);
    });
  });

  describe('generateExampleConversions', () => {
    it('generates 6 examples by default', () => {
      const examples = generateExampleConversions(new Date(2024, 0, 15), 'America/New_York', 'Europe/London');
      expect(examples).toHaveLength(6);
    });

    it('each example has required fields', () => {
      const examples = generateExampleConversions(new Date(2024, 0, 15), 'America/New_York', 'Europe/London');
      for (const ex of examples) {
        expect(ex).toHaveProperty('fromTime');
        expect(ex).toHaveProperty('toTime');
      }
    });
  });

  describe('findBestMeetingTimes', () => {
    it('returns meeting times for two cities', () => {
      const times = findBestMeetingTimes(new Date(2024, 0, 15), ['America/New_York', 'Europe/London']);
      expect(times.length).toBeGreaterThan(0);
      for (const t of times) {
        expect(t).toHaveProperty('utcHour');
        expect(typeof t.utcHour).toBe('number');
      }
    });
  });
});
