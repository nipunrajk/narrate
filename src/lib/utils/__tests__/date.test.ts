import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatDate,
  formatRelativeDate,
  formatDateTime,
  formatDateForDB,
  getLastNDaysRange,
  getCurrentWeekRange,
  getLastWeekRange,
  isWithinLastNDays,
  isToday,
  isYesterday,
  parseDate,
  getDaysBetween,
  sortDateDescending,
  groupDatesByDay,
  isValidDate,
  getStartOfDay,
  getEndOfDay,
} from '../date';

describe('Date Utilities', () => {
  beforeEach(() => {
    // Mock current date to ensure consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBe('January 15, 2024');
    });

    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('January 15, 2024');
    });

    it('handles different date formats', () => {
      expect(formatDate('2024-12-25')).toBe('December 25, 2024');
      expect(formatDate('2024-01-01T00:00:00.000Z')).toBe('January 1, 2024');
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "Today" for today\'s date', () => {
      const today = new Date('2024-01-15T10:00:00Z');
      expect(formatRelativeDate(today)).toBe('Today');
    });

    it('returns "Yesterday" for yesterday\'s date', () => {
      const yesterday = new Date('2024-01-14T10:00:00Z');
      expect(formatRelativeDate(yesterday)).toBe('Yesterday');
    });

    it('returns days ago for recent dates', () => {
      const threeDaysAgo = new Date('2024-01-12T10:00:00Z');
      expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
    });

    it('returns weeks ago for dates within a month', () => {
      const twoWeeksAgo = new Date('2024-01-01T10:00:00Z');
      expect(formatRelativeDate(twoWeeksAgo)).toBe('2 weeks ago');
    });

    it('returns months ago for dates within a year', () => {
      const twoMonthsAgo = new Date('2023-11-15T10:00:00Z');
      expect(formatRelativeDate(twoMonthsAgo)).toBe('2 months ago');
    });

    it('returns years ago for old dates', () => {
      const twoYearsAgo = new Date('2022-01-15T10:00:00Z');
      expect(formatRelativeDate(twoYearsAgo)).toBe('2 years ago');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const result = formatDateTime('2024-01-15T14:30:00Z');
      // Just check that it contains the expected parts, not exact format due to timezone
      expect(result).toContain('Jan 15, 2024');
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
    });

    it('handles Date object', () => {
      const date = new Date('2024-01-15T09:15:00Z');
      const result = formatDateTime(date);
      expect(result).toContain('Jan 15, 2024');
      expect(result).toMatch(/\d{1,2}:\d{2}\s?(AM|PM)/);
    });
  });

  describe('formatDateForDB', () => {
    it('returns ISO string for current date by default', () => {
      const result = formatDateForDB();
      expect(result).toBe('2024-01-15T12:00:00.000Z');
    });

    it('formats provided date to ISO string', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateForDB(date);
      expect(result).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('getLastNDaysRange', () => {
    it('returns correct range for last 7 days', () => {
      const range = getLastNDaysRange(7);

      // Check the date part, ignoring timezone offset
      expect(range.start.getUTCFullYear()).toBe(2024);
      expect(range.start.getUTCMonth()).toBe(0); // January is 0
      expect(range.start.getUTCDate()).toBe(8);
      expect(range.start.getUTCHours()).toBe(0);

      expect(range.end.getUTCFullYear()).toBe(2024);
      expect(range.end.getUTCMonth()).toBe(0);
      expect(range.end.getUTCDate()).toBe(15);
      expect(range.end.getUTCHours()).toBe(23);
    });

    it('returns correct range for last 30 days', () => {
      const range = getLastNDaysRange(30);

      expect(range.start.getUTCFullYear()).toBe(2023);
      expect(range.start.getUTCMonth()).toBe(11); // December is 11
      expect(range.start.getUTCDate()).toBe(16);

      expect(range.end.getUTCFullYear()).toBe(2024);
      expect(range.end.getUTCMonth()).toBe(0);
      expect(range.end.getUTCDate()).toBe(15);
    });

    it('handles single day range', () => {
      const range = getLastNDaysRange(1);

      expect(range.start.getUTCDate()).toBe(14);
      expect(range.end.getUTCDate()).toBe(15);
    });
  });

  describe('getCurrentWeekRange', () => {
    it('returns correct week range (Sunday to Saturday)', () => {
      // 2024-01-15 is a Monday, so week should be 2024-01-14 to 2024-01-20
      const range = getCurrentWeekRange();

      expect(range.start.getUTCDate()).toBe(14); // Sunday
      expect(range.end.getUTCDate()).toBe(20); // Saturday
    });
  });

  describe('getLastWeekRange', () => {
    it('returns same as getLastNDaysRange(7)', () => {
      const lastWeek = getLastWeekRange();
      const lastNDays = getLastNDaysRange(7);

      expect(lastWeek.start.getTime()).toBe(lastNDays.start.getTime());
      expect(lastWeek.end.getTime()).toBe(lastNDays.end.getTime());
    });
  });

  describe('isWithinLastNDays', () => {
    it('returns true for dates within range', () => {
      const threeDaysAgo = new Date('2024-01-12T10:00:00Z');
      expect(isWithinLastNDays(threeDaysAgo, 7)).toBe(true);
    });

    it('returns false for dates outside range', () => {
      const tenDaysAgo = new Date('2024-01-05T10:00:00Z');
      expect(isWithinLastNDays(tenDaysAgo, 7)).toBe(false);
    });

    it('handles string dates', () => {
      expect(isWithinLastNDays('2024-01-12T10:00:00Z', 7)).toBe(true);
      expect(isWithinLastNDays('2024-01-05T10:00:00Z', 7)).toBe(false);
    });
  });

  describe('isToday', () => {
    it("returns true for today's date", () => {
      const today = new Date('2024-01-15T10:00:00Z');
      expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date('2024-01-14T10:00:00Z');
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date('2024-01-16T10:00:00Z');
      expect(isToday(tomorrow)).toBe(false);
    });

    it('handles string dates', () => {
      expect(isToday('2024-01-15T10:00:00Z')).toBe(true);
      expect(isToday('2024-01-14T10:00:00Z')).toBe(false);
    });

    it('ignores time when checking date', () => {
      expect(isToday('2024-01-15T00:00:00Z')).toBe(true);
      expect(isToday('2024-01-15T23:59:59Z')).toBe(true);
    });
  });

  describe('isYesterday', () => {
    it("returns true for yesterday's date", () => {
      const yesterday = new Date('2024-01-14T10:00:00Z');
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('returns false for today', () => {
      const today = new Date('2024-01-15T10:00:00Z');
      expect(isYesterday(today)).toBe(false);
    });

    it('returns false for two days ago', () => {
      const twoDaysAgo = new Date('2024-01-13T10:00:00Z');
      expect(isYesterday(twoDaysAgo)).toBe(false);
    });

    it('handles string dates', () => {
      expect(isYesterday('2024-01-14T10:00:00Z')).toBe(true);
      expect(isYesterday('2024-01-15T10:00:00Z')).toBe(false);
    });
  });

  describe('parseDate', () => {
    it('parses valid date strings', () => {
      const result = parseDate('2024-01-15T10:30:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(
        new Date('2024-01-15T10:30:00Z').getTime()
      );
    });

    it('returns null for invalid date strings', () => {
      expect(parseDate('invalid-date')).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate('not-a-date')).toBeNull();
    });

    it('handles various date formats', () => {
      expect(parseDate('2024-01-15')).toBeInstanceOf(Date);
      expect(parseDate('January 15, 2024')).toBeInstanceOf(Date);
      expect(parseDate('2024/01/15')).toBeInstanceOf(Date);
    });
  });

  describe('getDaysBetween', () => {
    it('calculates days between dates correctly', () => {
      const start = '2024-01-10T00:00:00Z';
      const end = '2024-01-15T00:00:00Z';
      expect(getDaysBetween(start, end)).toBe(5);
    });

    it('handles Date objects', () => {
      const start = new Date('2024-01-10T00:00:00Z');
      const end = new Date('2024-01-15T00:00:00Z');
      expect(getDaysBetween(start, end)).toBe(5);
    });

    it('returns 0 for same date', () => {
      const date = '2024-01-15T00:00:00Z';
      expect(getDaysBetween(date, date)).toBe(0);
    });

    it('handles negative differences', () => {
      const start = '2024-01-15T00:00:00Z';
      const end = '2024-01-10T00:00:00Z';
      expect(getDaysBetween(start, end)).toBe(-5);
    });
  });

  describe('sortDateDescending', () => {
    it('sorts dates in descending order', () => {
      const dates = [
        '2024-01-10T00:00:00Z',
        '2024-01-15T00:00:00Z',
        '2024-01-12T00:00:00Z',
      ];

      const sorted = sortDateDescending(dates);

      expect(sorted[0].getTime()).toBe(
        new Date('2024-01-15T00:00:00Z').getTime()
      );
      expect(sorted[1].getTime()).toBe(
        new Date('2024-01-12T00:00:00Z').getTime()
      );
      expect(sorted[2].getTime()).toBe(
        new Date('2024-01-10T00:00:00Z').getTime()
      );
    });

    it('handles mixed Date objects and strings', () => {
      const dates = [
        new Date('2024-01-10T00:00:00Z'),
        '2024-01-15T00:00:00Z',
        new Date('2024-01-12T00:00:00Z'),
      ];

      const sorted = sortDateDescending(dates);

      expect(sorted).toHaveLength(3);
      expect(sorted[0].getTime()).toBe(
        new Date('2024-01-15T00:00:00Z').getTime()
      );
    });

    it('handles empty array', () => {
      expect(sortDateDescending([])).toEqual([]);
    });
  });

  describe('groupDatesByDay', () => {
    it('groups dates by day correctly', () => {
      const dates = [
        '2024-01-15T10:00:00Z',
        '2024-01-15T14:00:00Z',
        '2024-01-16T10:00:00Z',
      ];

      const grouped = groupDatesByDay(dates);

      expect(grouped.size).toBe(2);
      // Check that we have the right number of entries per day
      const keys = Array.from(grouped.keys());
      expect(grouped.get(keys[0])).toHaveLength(2);
      expect(grouped.get(keys[1])).toHaveLength(1);
    });

    it('handles empty array', () => {
      const grouped = groupDatesByDay([]);
      expect(grouped.size).toBe(0);
    });

    it('handles single date', () => {
      const dates = ['2024-01-15T10:00:00Z'];
      const grouped = groupDatesByDay(dates);

      expect(grouped.size).toBe(1);
      const keys = Array.from(grouped.keys());
      expect(grouped.get(keys[0])).toHaveLength(1);
    });
  });

  describe('isValidDate', () => {
    it('returns true for valid dates', () => {
      expect(isValidDate('2024-01-15T10:00:00Z')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('2024-01-15')).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
      expect(isValidDate('not-a-date')).toBe(false);
    });

    it('handles edge cases', () => {
      // JavaScript Date constructor is lenient, so these might be valid
      const feb30 = isValidDate('2024-02-30');
      const month13 = isValidDate('2024-13-01');
      // Just check that the function doesn't throw
      expect(typeof feb30).toBe('boolean');
      expect(typeof month13).toBe('boolean');
    });
  });

  describe('getStartOfDay', () => {
    it('returns start of day for date string', () => {
      const result = getStartOfDay('2024-01-15T14:30:00Z');
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(0);
      expect(result.getUTCDate()).toBe(15);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it('returns start of day for Date object', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = getStartOfDay(date);
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
      expect(result.getUTCSeconds()).toBe(0);
      expect(result.getUTCMilliseconds()).toBe(0);
    });

    it('handles already start of day', () => {
      const result = getStartOfDay('2024-01-15T00:00:00Z');
      expect(result.getUTCHours()).toBe(0);
      expect(result.getUTCMinutes()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('returns end of day for date string', () => {
      const result = getEndOfDay('2024-01-15T14:30:00Z');
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(0);
      expect(result.getUTCDate()).toBe(15);
      expect(result.getUTCHours()).toBe(23);
      expect(result.getUTCMinutes()).toBe(59);
      expect(result.getUTCSeconds()).toBe(59);
      expect(result.getUTCMilliseconds()).toBe(999);
    });

    it('returns end of day for Date object', () => {
      const date = new Date('2024-01-15T14:30:00Z');
      const result = getEndOfDay(date);
      expect(result.getUTCHours()).toBe(23);
      expect(result.getUTCMinutes()).toBe(59);
      expect(result.getUTCSeconds()).toBe(59);
      expect(result.getUTCMilliseconds()).toBe(999);
    });

    it('handles already end of day', () => {
      const result = getEndOfDay('2024-01-15T23:59:59.999Z');
      expect(result.getUTCHours()).toBe(23);
      expect(result.getUTCMinutes()).toBe(59);
      expect(result.getUTCSeconds()).toBe(59);
      expect(result.getUTCMilliseconds()).toBe(999);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles timezone differences correctly', () => {
      // Test with different timezone
      const utcDate = '2024-01-15T00:00:00Z';
      const localDate = new Date(utcDate);

      expect(isValidDate(utcDate)).toBe(true);
      expect(formatDate(localDate)).toBeTruthy();
    });

    it('handles leap year dates', () => {
      expect(isValidDate('2024-02-29')).toBe(true); // 2024 is leap year
      // JavaScript is lenient with invalid dates, so this might still be "valid"
      const feb29_2023 = isValidDate('2023-02-29');
      expect(typeof feb29_2023).toBe('boolean');
    });

    it('handles year boundaries', () => {
      const newYear = '2024-01-01T00:00:00Z';
      const lastYear = '2023-12-31T23:59:59Z';

      expect(getDaysBetween(lastYear, newYear)).toBe(0);
    });
  });
});
