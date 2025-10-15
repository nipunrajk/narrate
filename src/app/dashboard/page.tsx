import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { getUser } from '@/lib/supabase/auth-server';
import { getUserEntries } from '@/lib/actions/entries';
import { redirect } from 'next/navigation';
import { DashboardClient } from './DashboardClient';
import { Suspense } from 'react';
import type { JournalEntry } from '@/lib/types/database';
import DashboardErrorBoundary from './DashboardErrorBoundary'; // <-- Import the new component

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
    let databaseError: string | null = null;

    try {
      const entriesResult = await getUserEntries();
      if (entriesResult.success) {
        initialEntries = entriesResult.data || [];
      } else {
        databaseError = entriesResult.error || 'Unknown database error';
        console.warn('Database not ready:', entriesResult.error);
      }
    } catch (error) {
      console.error('Failed to fetch initial entries:', error);
      databaseError = 'Unable to connect to database';
    }

    return (
      <ProtectedRoute>
        {/* Use the new Client Component wrapper here */}
        <DashboardErrorBoundary user={user}>
          <div className='min-h-screen bg-background'>
            <Header user={user} />
            <Suspense fallback={<DashboardPageLoading />}>
              <DashboardClient
                user={user}
                initialEntries={initialEntries}
                databaseError={databaseError}
              />
            </Suspense>
          </div>
        </DashboardErrorBoundary>
      </ProtectedRoute>
    );
  } catch (error) {
    console.error('Dashboard page error:', error);
    redirect('/login');
  }
}
