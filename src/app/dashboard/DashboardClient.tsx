'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { JournalDashboard } from '@/components/journal/JournalDashboard';
import { Header } from '@/components/layout/Header';
import { WeeklySummaryModal } from '@/components/journal/WeeklySummaryModal';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';

import type { User } from '@supabase/supabase-js';
import type { JournalEntry } from '@/lib/types/database';

interface DashboardClientProps {
  user: User;
  initialEntries: JournalEntry[];
}

// Loading fallback for the main dashboard content
function DashboardLoadingFallback() {
  return (
    <div className='max-w-4xl mx-auto space-y-6 lg:space-y-8'>
      {/* Entry form skeleton */}
      <div className='bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm'>
        <div className='mb-6'>
          <div className='h-7 bg-slate-200 rounded w-48 mb-2 animate-pulse'></div>
          <div className='h-4 bg-slate-200 rounded w-96 animate-pulse'></div>
        </div>
        <div className='space-y-4'>
          <div className='h-32 bg-slate-200 rounded animate-pulse'></div>
          <div className='h-10 bg-slate-200 rounded w-24 animate-pulse'></div>
        </div>
      </div>

      {/* Entries list skeleton */}
      <div>
        <div className='mb-4 sm:mb-6'>
          <div className='h-6 bg-slate-200 rounded w-56 mb-2 animate-pulse'></div>
          <div className='h-4 bg-slate-200 rounded w-80 animate-pulse'></div>
        </div>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='bg-white rounded-lg border border-slate-200 p-4 shadow-sm'
            >
              <div className='h-4 bg-slate-200 rounded w-24 mb-3 animate-pulse'></div>
              <div className='space-y-2'>
                <div className='h-4 bg-slate-200 rounded animate-pulse'></div>
                <div className='h-4 bg-slate-200 rounded w-3/4 animate-pulse'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({
  user,
  initialEntries,
}: DashboardClientProps) {
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);

  const handleWeeklySummaryClick = useCallback(() => {
    setIsWeeklySummaryOpen(true);
  }, []);

  const handleWeeklySummaryClose = useCallback(() => {
    setIsWeeklySummaryOpen(false);
  }, []);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100'>
      {/* Skip to main content link for accessibility */}
      <a
        href='#main-content'
        className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-slate-900 text-white px-4 py-2 rounded-md z-50 transition-all duration-200'
      >
        Skip to main content
      </a>

      {/* Header with error boundary */}
      <ErrorBoundary
        fallback={({ resetError }) => (
          <div className='bg-red-50 border-b border-red-200 p-4'>
            <div className='max-w-7xl mx-auto flex items-center justify-between'>
              <div className='flex items-center'>
                <h1 className='text-xl font-semibold text-slate-900'>
                  Narrate
                </h1>
              </div>
              <button
                onClick={resetError}
                className='text-red-600 hover:text-red-800 text-sm font-medium'
              >
                Retry
              </button>
            </div>
          </div>
        )}
      >
        <Header user={user} onWeeklySummaryClick={handleWeeklySummaryClick} />
      </ErrorBoundary>

      {/* Main Content Container */}
      <div className='relative'>
        {/* Background decoration */}
        <div className='absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none'></div>

        {/* Main Content */}
        <main
          id='main-content'
          className='relative py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8'
        >
          <div className='max-w-7xl mx-auto'>
            {/* Welcome section */}
            <div className='mb-8 lg:mb-12'>
              <div className='text-center lg:text-left'>
                <h1 className='text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 mb-2'>
                  Welcome back to your journal
                </h1>
                <p className='text-slate-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0'>
                  Take a moment to reflect on your thoughts, experiences, and
                  personal growth.
                </p>
              </div>
            </div>

            {/* Dashboard Content with Suspense and Error Boundary */}
            <ErrorBoundary
              fallback={({ resetError }) => (
                <div className='bg-white rounded-lg border border-red-200 p-6 shadow-sm'>
                  <div className='text-center'>
                    <div className='text-red-500 mb-4'>
                      <svg
                        className='w-12 h-12 mx-auto'
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
                    <h3 className='text-lg font-medium text-slate-900 mb-2'>
                      Unable to load your journal
                    </h3>
                    <p className='text-slate-600 mb-4'>
                      We encountered an issue loading your journal content.
                      Please try again.
                    </p>
                    <button
                      onClick={resetError}
                      className='bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors'
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            >
              <Suspense fallback={<DashboardLoadingFallback />}>
                <JournalDashboard
                  initialEntries={initialEntries}
                  onWeeklySummaryClick={handleWeeklySummaryClick}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Weekly Summary Modal with Error Boundary */}
      <ErrorBoundary
        fallback={({ resetError }) => (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 max-w-md w-full'>
              <div className='text-center'>
                <h3 className='text-lg font-medium text-slate-900 mb-2'>
                  Modal Error
                </h3>
                <p className='text-slate-600 mb-4'>
                  Unable to load the weekly summary modal.
                </p>
                <button
                  onClick={() => {
                    resetError();
                    setIsWeeklySummaryOpen(false);
                  }}
                  className='bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      >
        <WeeklySummaryModal
          isOpen={isWeeklySummaryOpen}
          onClose={handleWeeklySummaryClose}
        />
      </ErrorBoundary>
    </div>
  );
}
