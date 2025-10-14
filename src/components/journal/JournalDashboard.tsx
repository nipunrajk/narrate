'use client';

import React, { useState, useCallback } from 'react';
import { EntryForm } from './EntryForm';
import { EntryList } from './EntryList';
import { WeeklySummaryModal } from './WeeklySummaryModal';
import { useOptimisticEntries } from '@/hooks/useOptimisticEntries';
import type { JournalEntry } from '@/lib/types/database';

interface JournalDashboardProps {
  initialEntries: JournalEntry[];
  className?: string;
  onWeeklySummaryClick?: () => void;
}

export function JournalDashboard({
  initialEntries,
  className = '',
  onWeeklySummaryClick,
}: JournalDashboardProps) {
  const [error, setError] = useState<string>('');
  const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
  const { entries, addEntry, updateEntry } =
    useOptimisticEntries(initialEntries);

  // Handle successful entry save
  const handleEntrySaved = useCallback(
    (savedEntry: JournalEntry) => {
      updateEntry(savedEntry);
      setError(''); // Clear any previous errors
    },
    [updateEntry]
  );

  // Handle optimistic entry addition
  const handleOptimisticAdd = useCallback(
    (content: string) => {
      addEntry({ content });
      setError(''); // Clear any previous errors
    },
    [addEntry]
  );

  // Handle errors
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // Handle weekly summary modal
  const handleWeeklySummaryClick = useCallback(() => {
    if (onWeeklySummaryClick) {
      onWeeklySummaryClick();
    } else {
      setIsWeeklySummaryOpen(true);
    }
  }, [onWeeklySummaryClick]);

  const handleWeeklySummaryClose = useCallback(() => {
    setIsWeeklySummaryOpen(false);
  }, []);

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Error display */}
      {error && (
        <div className='mb-6 lg:mb-8 bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm animate-fade-in'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 text-red-400 mr-3 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <div className='flex-1'>
              <p className='text-red-800 text-sm font-medium'>Error</p>
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className='ml-4 text-red-400 hover:text-red-600 transition-colors'
              aria-label='Dismiss error'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main dashboard grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>
        {/* Entry form - takes up 2 columns on large screens */}
        <section
          className='lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-200'
          aria-labelledby='entry-form-heading'
        >
          <div className='mb-8'>
            <h1
              id='entry-form-heading'
              className='text-2xl sm:text-3xl font-light text-slate-900 mb-3'
            >
              Today&apos;s Entry
            </h1>
            <p className='text-slate-600 text-base leading-relaxed'>
              What&apos;s on your mind today? Take a moment to capture your
              thoughts, feelings, and experiences.
            </p>
          </div>

          <EntryForm
            onSave={handleEntrySaved}
            onOptimisticAdd={handleOptimisticAdd}
            onError={handleError}
          />
        </section>

        {/* Quick stats and actions sidebar */}
        <aside className='lg:col-span-1 space-y-6'>
          {/* Stats card */}
          <div className='bg-white rounded-xl border border-slate-200 p-6 shadow-sm'>
            <h3 className='text-lg font-medium text-slate-900 mb-4'>
              Your Progress
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 text-sm'>Total Entries</span>
                <span className='text-slate-900 font-semibold'>
                  {entries.length}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-600 text-sm'>This Week</span>
                <span className='text-slate-900 font-semibold'>
                  {
                    entries.filter((entry) => {
                      const entryDate = new Date(entry.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return entryDate >= weekAgo;
                    }).length
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Weekly summary card */}
          <div className='bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-sm'>
            <div className='flex items-center mb-4'>
              <svg
                className='w-6 h-6 mr-3'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                />
              </svg>
              <h3 className='text-lg font-medium'>Weekly Insights</h3>
            </div>
            <p className='text-slate-300 text-sm mb-6 leading-relaxed'>
              Discover patterns and themes in your journal entries with
              AI-powered weekly summaries.
            </p>
            <button
              onClick={handleWeeklySummaryClick}
              className='w-full bg-white text-slate-900 py-3 px-4 rounded-lg font-medium hover:bg-slate-100 transition-colors duration-200'
            >
              Generate Summary
            </button>
          </div>
        </aside>
      </div>

      {/* Entries list section */}
      <section className='mt-12' aria-labelledby='entries-list-heading'>
        <div className='mb-6 lg:mb-8'>
          <h2
            id='entries-list-heading'
            className='text-2xl sm:text-3xl font-light text-slate-900 mb-3'
          >
            Your Journal History
          </h2>
          <p className='text-slate-600 text-base leading-relaxed'>
            Reflect on your past thoughts and track your personal growth over
            time.
          </p>
        </div>

        <EntryList
          entries={entries}
          emptyStateTitle='Your journal awaits'
          emptyStateDescription='Start documenting your thoughts and experiences. Your entries will appear here, creating a timeline of your personal journey.'
        />
      </section>

      {/* Weekly Summary Modal */}
      <WeeklySummaryModal
        isOpen={isWeeklySummaryOpen}
        onClose={handleWeeklySummaryClose}
      />
    </div>
  );
}
