'use client';

import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import type { User } from '@supabase/supabase-js';

// This is the same error display component you already wrote.
// We keep it separate so it's easy to read and manage.
function DashboardPageErrorFallback({
  resetError,
  user,
}: {
  resetError: () => void;
  user: User;
}) {
  return (
    <div className='min-h-screen bg-background'>
      <Header user={user} />
      <main className='flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]'>
        <div className='bg-card rounded-lg border border-border p-8 max-w-md w-full text-center shadow-soft'>
          <div className='text-destructive mb-4'>
            <svg
              className='w-16 h-16 mx-auto'
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
          <h2 className='text-xl font-semibold text-card-foreground mb-2'>
            Unable to load dashboard
          </h2>
          <p className='text-muted-foreground mb-6'>
            We encountered an issue loading your journal dashboard. Please try
            refreshing the page.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <button
              onClick={resetError}
              className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors-smooth'
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className='border border-input text-foreground px-4 py-2 rounded-md hover:bg-accent transition-colors-smooth'
            >
              Refresh Page
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

// This is our new Client Component that wraps the ErrorBoundary
export default function DashboardErrorBoundary({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  // Because this is a Client Component, we can define a fallback
  // component here that uses the 'user' prop without any issues.
  const ErrorFallbackWithUser = ({
    resetError,
  }: {
    resetError: () => void;
  }) => <DashboardPageErrorFallback resetError={resetError} user={user} />;

  return (
    <ErrorBoundary fallback={ErrorFallbackWithUser}>{children}</ErrorBoundary>
  );
}
