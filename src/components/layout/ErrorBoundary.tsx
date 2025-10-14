'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    errorInfo?: React.ErrorInfo;
    resetError: () => void;
    errorId?: string;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  isolate?: boolean; // Whether to isolate this boundary from parent boundaries
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error ID:', this.state.errorId);
    console.groupEnd();

    // Store error info in state
    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In development, also log to help with debugging
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error Boundary - Retry count:', this.retryCount);
    }
  }

  resetError = () => {
    this.retryCount++;

    // If we've exceeded max retries, don't reset
    if (this.retryCount > this.maxRetries) {
      console.warn('Error Boundary: Max retries exceeded');
      return;
    }

    console.log(
      `Error Boundary: Attempting recovery (${this.retryCount}/${this.maxRetries})`
    );

    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            errorId={this.state.errorId}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorId={this.state.errorId}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  resetError: () => void;
  errorId?: string;
  retryCount?: number;
  maxRetries?: number;
}

function DefaultErrorFallback({
  error,
  errorInfo,
  resetError,
  errorId,
  retryCount = 0,
  maxRetries = 3,
}: ErrorFallbackProps) {
  const canRetry = retryCount < maxRetries;
  return (
    <div className='min-h-[400px] flex items-center justify-center p-4'>
      <div className='text-center max-w-md mx-auto'>
        <div className='text-destructive mb-6'>
          <svg
            className='w-16 h-16 mx-auto mb-4'
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

        <h2 className='text-subheading font-semibold text-foreground mb-2'>
          Something went wrong
        </h2>

        <p className='text-body text-muted-foreground mb-6'>
          We encountered an unexpected error. Please try refreshing the page or
          contact support if the problem persists.
        </p>

        {/* Retry information */}
        {retryCount > 0 && (
          <div className='mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg'>
            <p className='text-sm text-warning-foreground'>
              Retry attempt {retryCount} of {maxRetries}
              {!canRetry && ' - Maximum retries reached'}
            </p>
          </div>
        )}

        {/* Error ID for support */}
        {errorId && (
          <div className='mb-4 p-3 bg-muted/50 border border-border rounded-lg'>
            <p className='text-xs text-muted-foreground'>
              Error ID: <code className='font-mono'>{errorId}</code>
            </p>
          </div>
        )}

        {process.env.NODE_ENV === 'development' && error && (
          <details className='text-left mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
            <summary className='cursor-pointer text-caption font-medium text-destructive mb-2'>
              Error Details (Development)
            </summary>
            <div className='space-y-3'>
              <div>
                <h4 className='text-xs font-semibold text-destructive mb-1'>
                  Error Message:
                </h4>
                <pre className='text-xs text-destructive/80 overflow-auto max-h-20 bg-destructive/5 p-2 rounded'>
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <h4 className='text-xs font-semibold text-destructive mb-1'>
                    Stack Trace:
                  </h4>
                  <pre className='text-xs text-destructive/80 overflow-auto max-h-32 bg-destructive/5 p-2 rounded'>
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <h4 className='text-xs font-semibold text-destructive mb-1'>
                    Component Stack:
                  </h4>
                  <pre className='text-xs text-destructive/80 overflow-auto max-h-32 bg-destructive/5 p-2 rounded'>
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          {canRetry && (
            <Button onClick={resetError} variant='outline'>
              Try Again ({maxRetries - retryCount} attempts left)
            </Button>
          )}
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          {errorId && (
            <Button
              variant='ghost'
              onClick={() => {
                navigator.clipboard?.writeText(`Error ID: ${errorId}`);
              }}
            >
              Copy Error ID
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary, DefaultErrorFallback };
export type { ErrorBoundaryProps, ErrorFallbackProps };
