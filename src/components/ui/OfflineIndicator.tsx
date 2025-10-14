'use client';

import React from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showOnlineMessage?: boolean;
}

export function OfflineIndicator({
  className,
  showOnlineMessage = true,
}: OfflineIndicatorProps) {
  const { isOffline, wasOffline } = useNetworkStatus();

  // Show offline indicator
  if (isOffline) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium shadow-lg',
          'animate-slide-down',
          className
        )}
      >
        <div className='flex items-center justify-center gap-2'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728'
            />
          </svg>
          You&apos;re offline. Some features may not work properly.
        </div>
      </div>
    );
  }

  // Show "back online" message briefly
  if (wasOffline && showOnlineMessage) {
    return (
      <div
        className={cn(
          'fixed top-0 left-0 right-0 z-50 bg-success text-success-foreground px-4 py-2 text-center text-sm font-medium shadow-lg',
          'animate-slide-down',
          className
        )}
      >
        <div className='flex items-center justify-center gap-2'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
          You&apos;re back online!
        </div>
      </div>
    );
  }

  return null;
}
