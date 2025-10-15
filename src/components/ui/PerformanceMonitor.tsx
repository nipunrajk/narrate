'use client';

import { useEffect } from 'react';
import {
  initPerformanceMonitoring,
  bundleAnalysis,
  memoryUtils,
} from '@/lib/utils/performance';

/**
 * Performance monitoring component that initializes Web Vitals tracking
 * and other performance monitoring utilities
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Log bundle information in development
    if (process.env.NODE_ENV === 'development') {
      // Delay to ensure resources are loaded
      setTimeout(() => {
        bundleAnalysis.logBundleInfo();
        memoryUtils.logMemoryUsage();
      }, 2000);

      // Start memory monitoring in development
      memoryUtils.startMemoryMonitoring();
    }
  }, []);

  // This component doesn't render anything
  return null;
}
