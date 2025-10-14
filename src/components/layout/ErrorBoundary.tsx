'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className='min-h-[400px] flex items-center justify-center'>
      <div className='text-center max-w-md mx-auto p-6'>
        <div className='text-red-500 mb-4'>
          <svg
            className='w-16 h-16 mx-auto mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>

        <h2 className='text-xl font-semibold text-slate-900 mb-2'>
          Something went wrong
        </h2>

        <p className='text-slate-600 mb-6'>
          We encountered an unexpected error. Please try refreshing the page or
          contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className='text-left mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <summary className='cursor-pointer text-sm font-medium text-red-800 mb-2'>
              Error Details (Development)
            </summary>
            <pre className='text-xs text-red-700 overflow-auto'>
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}

        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button onClick={resetError} variant='outline'>
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary, DefaultErrorFallback };
export type { ErrorBoundaryProps, ErrorFallbackProps };
