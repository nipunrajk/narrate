'use client';

import React, { useState, useCallback } from 'react';
import { EntryForm } from './EntryForm';
import { EntryList } from './EntryList';
import { useOptimisticEntries } from '@/hooks/useOptimisticEntries';
import type { JournalEntry } from '@/lib/types/database';

interface JournalDashboardProps {
  initialEntries: JournalEntry[];
  className?: string;
}

export function JournalDashboard({
  initialEntries,
  className = '',
}: JournalDashboardProps) {
  const [error, setError] = useState<string>('');
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

  return (
    <div className={`max-w-4xl mx-auto space-y-8 ${className}`}>
      {/* Error display */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <svg
              className='w-5 h-5 text-red-400 mr-3'
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
            <p className='text-red-800 text-sm'>{error}</p>
          </div>
        </div>
      )}

      {/* Entry form */}
      <section className='bg-white rounded-lg border border-slate-200 p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-semibold text-slate-900 mb-2'>
            Write Your Entry
          </h1>
          <p className='text-slate-600'>
            Take a moment to reflect on your day, thoughts, or experiences.
          </p>
        </div>

        <EntryForm
          onSave={handleEntrySaved}
          onOptimisticAdd={handleOptimisticAdd}
          onError={handleError}
        />
      </section>

      {/* Entries list */}
      <section>
        <EntryList
          entries={entries}
          emptyStateTitle='Start your journaling journey'
          emptyStateDescription='Write your first entry above to begin documenting your thoughts and experiences. Your entries will appear here, with the most recent ones first.'
        />
      </section>
    </div>
  );
}
