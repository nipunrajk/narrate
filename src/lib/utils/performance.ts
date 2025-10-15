/**
 * Performance monitoring and optimization utilities
 */

// Web Vitals tracking
export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Performance observer for Core Web Vitals
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  import('web-vitals')
    .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      const reportMetric = (metric: WebVitalsMetric) => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Performance] ${metric.name}:`, {
            value: metric.value,
            rating: metric.rating,
            id: metric.id,
          });
        }

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production') {
          // You can integrate with your analytics service here
          // Example: gtag('event', metric.name, { value: metric.value });
        }
      };

      // Track Core Web Vitals (using current web-vitals v5+ API)
      onCLS(reportMetric);
      onINP(reportMetric); // INP replaces FID in web-vitals v4+
      onFCP(reportMetric);
      onLCP(reportMetric);
      onTTFB(reportMetric);
    })
    .catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });
}

// Performance timing utilities
export const performanceUtils = {
  // Measure function execution time
  measureAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name} (error): ${duration.toFixed(2)}ms`);
      }

      throw error;
    }
  },

  // Measure sync function execution time
  measure: <T>(name: string, fn: () => T): T => {
    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      const duration = end - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const end = performance.now();
      const duration = end - start;

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${name} (error): ${duration.toFixed(2)}ms`);
      }

      throw error;
    }
  },

  // Mark performance milestones
  mark: (name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
    }
  },

  // Measure between two marks
  measureBetween: (name: string, startMark: string, endMark: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[Performance] ${name}: ${measure.duration.toFixed(2)}ms`
          );
        }

        return measure.duration;
      } catch (error) {
        console.warn(`Failed to measure ${name}:`, error);
        return 0;
      }
    }
    return 0;
  },
};

// Resource loading optimization
export const resourceUtils = {
  // Preload critical resources
  preloadResource: (href: string, as: string, type?: string) => {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    if (type) link.type = type;

    document.head.appendChild(link);
  },

  // Prefetch resources for next navigation
  prefetchResource: (href: string) => {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;

    document.head.appendChild(link);
  },

  // Lazy load images with intersection observer
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            img.src = src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        });
      });

      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = src;
    }
  },
};

// Bundle size analysis (development only)
export const bundleAnalysis = {
  // Log bundle information
  logBundleInfo: () => {
    if (process.env.NODE_ENV !== 'development') return;

    // Log loaded modules
    if (typeof window !== 'undefined' && 'performance' in window) {
      const resources = performance.getEntriesByType(
        'resource'
      ) as PerformanceResourceTiming[];
      const jsResources = resources.filter((r) => r.name.includes('.js'));
      const cssResources = resources.filter((r) => r.name.includes('.css'));

      console.group('[Bundle Analysis]');
      console.log(`JavaScript files: ${jsResources.length}`);
      console.log(`CSS files: ${cssResources.length}`);
      console.log(
        'Largest JS files:',
        jsResources
          .sort((a, b) => b.transferSize - a.transferSize)
          .slice(0, 5)
          .map((r) => ({
            name: r.name.split('/').pop(),
            size: r.transferSize,
          }))
      );
      console.groupEnd();
    }
  },
};

// Memory usage monitoring
export const memoryUtils = {
  // Log memory usage (Chrome only)
  logMemoryUsage: () => {
    if (process.env.NODE_ENV !== 'development') return;

    if (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'memory' in performance
    ) {
      const memory = (
        performance as {
          memory: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          };
        }
      ).memory;
      console.log('[Memory Usage]', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
      });
    }
  },

  // Monitor memory leaks
  startMemoryMonitoring: () => {
    if (process.env.NODE_ENV !== 'development') return;

    setInterval(() => {
      memoryUtils.logMemoryUsage();
    }, 30000); // Log every 30 seconds
  },
};
