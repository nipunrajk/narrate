import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { getUser } from '@/lib/supabase/auth-server';
import { getUserEntries } from '@/lib/actions/entries';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';
import { Suspense } from 'react';
import type { JournalEntry } from '@/lib/types/database';

// Loading component for the dashboard page
function DashboardPageLoading() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Header skeleton */}
      <Header />

      {/* Main content skeleton */}
      <main className='container-responsive py-6 sm:py-8 lg:py-12'>
        <div className='max-w-6xl mx-auto'>
          <div className='mb-8 lg:mb-12 space-y-fluid'>
            <div className='h-8 w-80 bg-muted rounded animate-pulse'></div>
            <div className='h-4 w-96 bg-muted rounded animate-pulse'></div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
            <div className='lg:col-span-2 bg-card rounded-xl border border-border p-6 sm:p-8'>
              <div className='h-6 w-32 bg-muted rounded animate-pulse mb-4'></div>
              <div className='h-32 bg-muted rounded animate-pulse'></div>
            </div>
            <div className='space-y-6'>
              <div className='bg-card rounded-xl border border-border p-6'>
                <div className='h-5 w-24 bg-muted rounded animate-pulse mb-4'></div>
                <div className='space-y-3'>
                  <div className='h-4 bg-muted rounded animate-pulse'></div>
                  <div className='h-4 bg-muted rounded animate-pulse'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default async function DashboardPage() {
  try {
    const user = await getUser();

    if (!user) {
      redirect('/login');
    }

    // Fetch user's entries with error handling
    let initialEntries: JournalEntry[] = [];
    try {
      const entriesResult = await getUserEntries();
      initialEntries = entriesResult.success ? entriesResult.data || [] : [];
    } catch (error) {
      console.error('Failed to fetch initial entries:', error);
      // Continue with empty entries array - the client will handle the error
    }

    return (
      <ProtectedRoute>
        <ErrorBoundary
          fallback={({ resetError }) => (
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
                    We encountered an issue loading your journal dashboard.
                    Please try refreshing the page.
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
          )}
        >
          <div className='min-h-screen bg-background'>
            <Header user={user} />
            <Suspense fallback={<DashboardPageLoading />}>
              <DashboardClient user={user} initialEntries={initialEntries} />
            </Suspense>
          </div>
        </ErrorBoundary>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Dashboard page error:', error);
    redirect('/login');
  }
}
