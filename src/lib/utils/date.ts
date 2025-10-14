// Date utility functions for the Narrate application

import type { DateRange } from '../types/database';

/**
 * Format date for display in the application
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date for relative display (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for ISO string (database storage)
 */
export function formatDateForDB(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Get date range for the last N days
 */
export function getLastNDaysRange(days: number): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get the start and end of the current week (Sunday to Saturday)
 */
export function getCurrentWeekRange(): DateRange {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  // Get the start of the week (Sunday)
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);

  // Get the end of the week (Saturday)
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/**
 * Get the start and end of the last 7 days from today
 */
export function getLastWeekRange(): DateRange {
  return getLastNDaysRange(7);
}

/**
 * Check if a date is within the last N days
 */
export function isWithinLastNDays(date: string | Date, days: number): boolean {
  const targetDate = new Date(date);
  const { start } = getLastNDaysRange(days);
  return targetDate >= start;
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
  const targetDate = new Date(date);
  const today = new Date();

  return (
    targetDate.getDate() === today.getDate() &&
    targetDate.getMonth() === today.getMonth() &&
    targetDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(date: string | Date): boolean {
  const targetDate = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    targetDate.getDate() === yesterday.getDate() &&
    targetDate.getMonth() === yesterday.getMonth() &&
    targetDate.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Parse and validate date string
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Get the number of days between two dates
 */
export function getDaysBetween(
  startDate: string | Date,
  endDate: string | Date
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInMs = end.getTime() - start.getTime();
  return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Sort dates in descending order (most recent first)
 */
export function sortDateDescending(dates: (string | Date)[]): Date[] {
  return dates
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());
}

/**
 * Group dates by day
 */
export function groupDatesByDay(dates: (string | Date)[]): Map<string, Date[]> {
  const groups = new Map<string, Date[]>();

  dates.forEach((date) => {
    const d = new Date(date);
    const dayKey = d.toDateString();

    if (!groups.has(dayKey)) {
      groups.set(dayKey, []);
    }
    groups.get(dayKey)!.push(d);
  });

  return groups;
}

/**
 * Check if date is valid
 */
export function isValidDate(date: string | Date): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * Get start of day for a given date
 */
export function getStartOfDay(date: string | Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day for a given date
 */
export function getEndOfDay(date: string | Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
