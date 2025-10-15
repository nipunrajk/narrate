/**
 * Cache utilities for optimizing database queries and API calls
 */

// Simple in-memory cache for client-side caching
class MemoryCache {
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();

  set(key: string, data: unknown, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  userEntries: (userId: string, limit?: number) =>
    `entries:${userId}${limit ? `:${limit}` : ''}`,
  weeklyEntries: (userId: string, startDate: string) =>
    `weekly:${userId}:${startDate}`,
  userProfile: (userId: string) => `profile:${userId}`,
  weeklySummary: (userId: string, weekStart: string) =>
    `summary:${userId}:${weekStart}`,
} as const;

// Cache wrapper for async functions
export function withCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttlMs: number = 5 * 60 * 1000
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);

    // Try to get from cache first
    const cached = memoryCache.get<R>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    memoryCache.set(key, result, ttlMs);

    return result;
  };
}

// Invalidate cache patterns
export const invalidateCache = {
  userEntries: (userId: string) => {
    const keysToDelete: string[] = [];
    for (const [key] of memoryCache['cache'].entries()) {
      if (
        key.startsWith(`entries:${userId}`) ||
        key.startsWith(`weekly:${userId}`)
      ) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => memoryCache.delete(key));
  },

  weeklySummary: (userId: string) => {
    const keysToDelete: string[] = [];
    for (const [key] of memoryCache['cache'].entries()) {
      if (key.startsWith(`summary:${userId}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => memoryCache.delete(key));
  },

  all: () => memoryCache.clear(),
};

// Periodic cleanup (run every 10 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    memoryCache.cleanup();
  }, 10 * 60 * 1000);
}
