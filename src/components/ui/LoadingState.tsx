'use client';

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  message?: string;
  overlay?: boolean;
}

export function LoadingState({
  isLoading,
  children,
  fallback,
  className,
  spinnerSize = 'md',
  message,
  overlay = false,
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const loadingContent = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 p-8',
        className
      )}
    >
      <LoadingSpinner size={spinnerSize} />
      {message && (
        <p className='text-muted-foreground text-sm animate-pulse'>{message}</p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className='relative'>
        {children}
        <div className='absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10'>
          {loadingContent}
        </div>
      </div>
    );
  }

  return loadingContent;
}

interface AsyncContentProps {
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
  className?: string;
}

/**
 * Comprehensive component that handles loading, error, and success states
 */
export function AsyncContent({
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage,
  className,
}: AsyncContentProps) {
  if (error) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className='text-destructive mb-4'>
          <svg
            className='w-12 h-12 mx-auto mb-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>
        <p className='text-destructive mb-4'>{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className='px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors'
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <LoadingState
      isLoading={isLoading}
      message={loadingMessage}
      className={className}
    >
      {children}
    </LoadingState>
  );
}
