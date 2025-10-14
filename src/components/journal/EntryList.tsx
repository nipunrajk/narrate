'use client';

import React from 'react';
import { EntryItem } from './EntryItem';
import { Skeleton } from '@/components/ui/Skeleton';
import type { JournalEntry } from '@/lib/types/database';
import type { OptimisticEntry } from '@/hooks/useOptimisticEntries';

interface EntryListProps {
  entries: (JournalEntry | OptimisticEntry)[];
  isLoading?: boolean;
  className?: string;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  showLoadingSkeleton?: boolean;
}

export function EntryList({
  entries,
  isLoading = false,
  className = '',
  emptyStateTitle = 'No entries yet',
  emptyStateDescription = 'Start writing your first journal entry to begin your journey of self-reflection and discovery.',
  showLoadingSkeleton = true,
}: EntryListProps) {
  // Loading state
  if (isLoading && showLoadingSkeleton) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-slate-900'>Your Entries</h2>
          <Skeleton className='h-4 w-20' />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <EntryItemSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!isLoading && entries.length === 0) {
    return (
      <div className={`${className}`}>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-slate-900'>Your Entries</h2>
        </div>

        <div className='text-center py-12 px-6'>
          <div className='mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6'>
            <svg
              className='w-12 h-12 text-slate-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
              />
            </svg>
          </div>

          <h3 className='text-lg font-medium text-slate-900 mb-2'>
            {emptyStateTitle}
          </h3>

          <p className='text-slate-600 max-w-md mx-auto leading-relaxed'>
            {emptyStateDescription}
          </p>
        </div>
      </div>
    );
  }

  // Entries list
  return (
    <div className={`${className}`}>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-xl font-semibold text-slate-900'>Your Entries</h2>
        <span className='text-sm text-slate-500'>
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div className='space-y-6'>
        {entries.map((entry) => (
          <EntryItem key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Load more indicator (for future pagination) */}
      {entries.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-sm text-slate-500'>
            {entries.length >= 50
              ? 'Showing recent 50 entries'
              : 'All entries loaded'}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton component for loading state
 */
function EntryItemSkeleton() {
  return (
    <div className='bg-white rounded-lg border border-slate-200 p-6 space-y-4'>
      {/* Header skeleton */}
      <div className='flex items-center justify-between'>
        <Skeleton className='h-6 w-24' />
        <Skeleton className='h-4 w-16' />
      </div>

      {/* Content skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>

      {/* Footer skeleton */}
      <div className='flex items-center justify-between pt-2 border-t border-slate-100'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-3 w-16' />
      </div>
    </div>
  );
}
