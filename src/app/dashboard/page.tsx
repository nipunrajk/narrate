import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { getUser } from '@/lib/supabase/auth-server';
import { getUserEntries } from '@/lib/actions/entries';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';
import { Suspense } from 'react';
import type { JournalEntry } from '@/lib/types/database';

// Loading component for the dashboard page
function DashboardPageLoading() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      {/* Header skeleton */}
      <div className='bg-white border-b border-slate-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16 lg:h-18'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-slate-200 rounded-lg animate-pulse'></div>
              <div className='h-6 w-20 bg-slate-200 rounded animate-pulse'></div>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='h-9 w-32 bg-slate-200 rounded animate-pulse'></div>
              <div className='w-9 h-9 bg-slate-200 rounded-full animate-pulse'></div>
              <div className='h-9 w-20 bg-slate-200 rounded animate-pulse'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className='py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-8 lg:mb-12'>
            <div className='h-8 w-80 bg-slate-200 rounded animate-pulse mb-2'></div>
            <div className='h-4 w-96 bg-slate-200 rounded animate-pulse'></div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
            <div className='lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 sm:p-8'>
              <div className='h-6 w-32 bg-slate-200 rounded animate-pulse mb-4'></div>
              <div className='h-32 bg-slate-200 rounded animate-pulse'></div>
            </div>
            <div className='space-y-6'>
              <div className='bg-white rounded-xl border border-slate-200 p-6'>
                <div className='h-5 w-24 bg-slate-200 rounded animate-pulse mb-4'></div>
                <div className='space-y-3'>
                  <div className='h-4 bg-slate-200 rounded animate-pulse'></div>
                  <div className='h-4 bg-slate-200 rounded animate-pulse'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
            <div className='min-h-screen bg-slate-50 flex items-center justify-center p-4'>
              <div className='bg-white rounded-lg border border-slate-200 p-8 max-w-md w-full text-center shadow-sm'>
                <div className='text-red-500 mb-4'>
                  <svg
                    className='w-16 h-16 mx-auto'
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
                  Unable to load dashboard
                </h2>
                <p className='text-slate-600 mb-6'>
                  We encountered an issue loading your journal dashboard. Please
                  try refreshing the page.
                </p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                  <button
                    onClick={resetError}
                    className='bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors'
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className='border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition-colors'
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          )}
        >
          <Suspense fallback={<DashboardPageLoading />}>
            <DashboardClient user={user} initialEntries={initialEntries} />
          </Suspense>
        </ErrorBoundary>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Dashboard page error:', error);
    redirect('/login');
  }
}
