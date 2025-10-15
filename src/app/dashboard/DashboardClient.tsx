'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { JournalDashboard } from '@/components/journal/JournalDashboard';
import { WeeklySummaryModal } from '@/components/journal/WeeklySummaryModal';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { cn } from '@/lib/utils';

import type { User } from '@supabase/supabase-js';
import type { JournalEntry } from '@/lib/types/database';

interface DashboardClientProps {
  user: User;
  initialEntries: JournalEntry[];
  databaseError?: string | null;
}

// Error fallback for the main dashboard content
function DashboardErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <div className='bg-card rounded-xl border border-destructive/20 p-6 shadow-soft'>
      <div className='text-center'>
        <div className='text-destructive mb-4'>
          <svg
            className='w-12 h-12 mx-auto'
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
        <h3 className='text-lg font-medium text-card-foreground mb-2'>
          Unable to load your journal
        </h3>
        <p className='text-muted-foreground mb-4'>
          We encountered an issue loading your journal content. Please try
          again.
        </p>
        <button
          onClick={resetError}
          className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors-smooth'
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Error fallback for the modal
function ModalErrorFallback({ resetError }: { resetError: () => void }) {
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-adaptive flex items-center justify-center p-4 z-50'>
      <div className='bg-card rounded-lg p-6 max-w-md w-full shadow-medium border border-border'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-card-foreground mb-2'>
            Modal Error
          </h3>
          <p className='text-muted-foreground mb-4'>
            Unable to load the weekly summary modal.
          </p>
          <button
            onClick={resetError}
            className='bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors-smooth'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback for the main dashboard content
function DashboardLoadingFallback() {
  return (
    <div className='max-w-6xl mx-auto space-y-section'>
      {/* Welcome section skeleton */}
      <div className='space-y-fluid'>
        <div className='h-8 sm:h-10 bg-muted rounded w-80 animate-pulse'></div>
        <div className='h-4 bg-muted rounded w-96 animate-pulse'></div>
      </div>

      {/* Main grid skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
        {/* Entry form skeleton */}
        <div className='lg:col-span-2 bg-card rounded-xl border border-border p-6 sm:p-8 shadow-soft'>
          <div className='mb-8 space-y-fluid'>
            <div className='h-7 bg-muted rounded w-48 animate-pulse'></div>
            <div className='h-4 bg-muted rounded w-96 animate-pulse'></div>
          </div>
          <div className='space-y-4'>
            <div className='h-32 bg-muted rounded-lg animate-pulse'></div>
            <div className='h-10 bg-muted rounded w-24 animate-pulse'></div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className='space-y-6'>
          <div className='bg-card rounded-xl border border-border p-6 shadow-soft'>
            <div className='h-5 bg-muted rounded w-24 mb-4 animate-pulse'></div>
            <div className='space-y-3'>
              <div className='h-4 bg-muted rounded animate-pulse'></div>
              <div className='h-4 bg-muted rounded animate-pulse'></div>
            </div>
          </div>
          <div className='bg-card rounded-xl border border-border p-6 shadow-soft'>
            <div className='h-5 bg-muted rounded w-32 mb-4 animate-pulse'></div>
            <div className='h-4 bg-muted rounded w-full mb-6 animate-pulse'></div>
            <div className='h-10 bg-muted rounded animate-pulse'></div>
          </div>
        </div>
      </div>

      {/* Entries list skeleton */}
      <div className='space-y-6'>
        <div className='space-y-fluid'>
          <div className='h-6 bg-muted rounded w-56 animate-pulse'></div>
          <div className='h-4 bg-muted rounded w-80 animate-pulse'></div>
        </div>
        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='bg-card rounded-xl border border-border p-6 shadow-soft'
            >
              <div className='h-4 bg-muted rounded w-24 mb-3 animate-pulse'></div>
              <div className='space-y-2'>
                <div className='h-4 bg-muted rounded animate-pulse'></div>
                <div className='h-4 bg-muted rounded w-3/4 animate-pulse'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardClient({
  initialEntries,
  databaseError,
}: DashboardClientProps) {
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);

  const handleWeeklySummaryClick = useCallback(() => {
    setIsWeeklySummaryOpen(true);
  }, []);

  const handleWeeklySummaryClose = useCallback(() => {
    setIsWeeklySummaryOpen(false);
  }, []);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href='#main-content'
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
          'bg-primary text-primary-foreground px-4 py-2 rounded-md z-50',
          'transition-all duration-200'
        )}
      >
        Skip to main content
      </a>

      {/* Main Content */}
      <main
        id='main-content'
        className='container-responsive py-6 sm:py-8 lg:py-12'
      >
        {/* Welcome section */}
        <div className='mb-8 lg:mb-12 space-y-fluid'>
          <div className='text-center lg:text-left'>
            <h1 className='text-display font-light text-foreground mb-2'>
              Welcome back to your journal
            </h1>
            <p className='text-body text-muted-foreground max-w-2xl mx-auto lg:mx-0'>
              Take a moment to reflect on your thoughts, experiences, and
              personal growth.
            </p>
          </div>
        </div>

        {/* Database Error Warning */}
        {databaseError && (
          <div className='mb-8 p-4 bg-warning/10 border border-warning/20 rounded-lg'>
            <div className='flex items-start gap-3'>
              <svg
                className='w-5 h-5 text-warning mt-0.5 flex-shrink-0'
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
              <div>
                <h3 className='font-medium text-warning-foreground mb-1'>
                  Database Setup Required
                </h3>
                <p className='text-sm text-warning-foreground/80'>
                  {databaseError}. You can still use the journal interface, but
                  your entries won&apos;t be saved until the database is
                  configured.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Content with Suspense and Error Boundary */}
        <ErrorBoundary fallback={DashboardErrorFallback}>
          <Suspense fallback={<DashboardLoadingFallback />}>
            <JournalDashboard
              initialEntries={initialEntries}
              onWeeklySummaryClick={handleWeeklySummaryClick}
            />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Weekly Summary Modal with Error Boundary */}
      <ErrorBoundary fallback={ModalErrorFallback}>
        <WeeklySummaryModal
          isOpen={isWeeklySummaryOpen}
          onClose={handleWeeklySummaryClose}
        />
      </ErrorBoundary>
    </>
  );
}
