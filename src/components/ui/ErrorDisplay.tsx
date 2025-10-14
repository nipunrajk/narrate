'use client';

import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  canRetry?: boolean;
  isRetrying?: boolean;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
  variant?: 'inline' | 'card' | 'banner';
  size?: 'sm' | 'md' | 'lg';
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  canRetry = true,
  isRetrying = false,
  retryCount = 0,
  maxRetries = 3,
  className,
  variant = 'card',
  size = 'md',
}: ErrorDisplayProps) {
  if (!error) return null;

  const baseClasses = 'flex items-start gap-3 text-destructive';

  const variantClasses = {
    inline: 'p-3 bg-destructive/10 border border-destructive/20 rounded-lg',
    card: 'p-4 bg-destructive/10 border border-destructive/20 rounded-xl shadow-soft',
    banner: 'p-4 bg-destructive border-destructive text-destructive-foreground',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        'animate-fade-in',
        className
      )}
    >
      {/* Error Icon */}
      <svg
        className={cn(iconSize[size], 'flex-shrink-0 mt-0.5')}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
        aria-hidden='true'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        />
      </svg>

      {/* Error Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1'>
            <p className='font-medium mb-1'>Error</p>
            <p
              className={cn(
                'text-destructive/80 leading-relaxed',
                size === 'sm'
                  ? 'text-xs'
                  : size === 'lg'
                  ? 'text-base'
                  : 'text-sm'
              )}
            >
              {error}
            </p>

            {/* Retry count indicator */}
            {retryCount > 0 && (
              <p className='text-xs text-destructive/60 mt-2'>
                Retry attempt {retryCount} of {maxRetries}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className='flex-shrink-0 text-destructive/60 hover:text-destructive transition-colors touch-target'
              aria-label='Dismiss error'
            >
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
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>

        {/* Action buttons */}
        {(onRetry || onDismiss) && (
          <div className='flex items-center gap-2 mt-3'>
            {onRetry && canRetry && (
              <Button
                onClick={onRetry}
                variant='outline'
                size='sm'
                isLoading={isRetrying}
                disabled={isRetrying}
                className='text-destructive border-destructive/30 hover:bg-destructive/10'
              >
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}

            {onDismiss && !onRetry && (
              <Button
                onClick={onDismiss}
                variant='outline'
                size='sm'
                className='text-destructive border-destructive/30 hover:bg-destructive/10'
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
