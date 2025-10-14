'use client';

import React, { useState } from 'react';
import {
  formatDate,
  formatRelativeDate,
  isToday,
  isYesterday,
} from '@/lib/utils/date';
import type { JournalEntry } from '@/lib/types/database';
import type { OptimisticEntry } from '@/hooks/useOptimisticEntries';

interface EntryItemProps {
  entry: JournalEntry | OptimisticEntry;
  className?: string;
  showFullContent?: boolean;
  maxPreviewLength?: number;
}

export function EntryItem({
  entry,
  className = '',
  showFullContent = false,
  maxPreviewLength = 200,
}: EntryItemProps) {
  const [isExpanded, setIsExpanded] = useState(showFullContent);

  // Check if this is an optimistic entry (pending save)
  const isPending = 'isPending' in entry && entry.isPending;

  // Format the date for display
  const getDateDisplay = () => {
    if (isToday(entry.created_at)) {
      return 'Today';
    } else if (isYesterday(entry.created_at)) {
      return 'Yesterday';
    } else {
      return formatDate(entry.created_at);
    }
  };

  // Get relative date for additional context
  const relativeDate = formatRelativeDate(entry.created_at);

  // Determine if content should be truncated
  const shouldTruncate = !isExpanded && entry.content.length > maxPreviewLength;
  const displayContent = shouldTruncate
    ? entry.content.substring(0, maxPreviewLength) + '...'
    : entry.content;

  // Handle expand/collapse
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <article
      className={`
        bg-white rounded-lg border border-slate-200 p-6 space-y-4 
        transition-all duration-200 hover:shadow-sm
        ${isPending ? 'opacity-60 animate-pulse' : ''}
        ${className}
      `}
    >
      {/* Header with date information */}
      <header className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <h3 className='text-lg font-medium text-slate-900'>
            {getDateDisplay()}
          </h3>
          {!isToday(entry.created_at) && !isYesterday(entry.created_at) && (
            <span className='text-sm text-slate-500'>{relativeDate}</span>
          )}
        </div>

        {/* Pending indicator */}
        {isPending && (
          <div className='flex items-center space-x-2 text-sm text-blue-600'>
            <div className='w-2 h-2 bg-blue-600 rounded-full animate-pulse'></div>
            <span>Saving...</span>
          </div>
        )}
      </header>

      {/* Entry content */}
      <div className='prose prose-slate max-w-none'>
        <p className='text-slate-700 leading-relaxed whitespace-pre-wrap'>
          {displayContent}
        </p>
      </div>

      {/* Expand/collapse button for long entries */}
      {entry.content.length > maxPreviewLength && (
        <footer className='pt-2'>
          <button
            onClick={handleToggleExpand}
            className='text-sm text-slate-600 hover:text-slate-900 transition-colors'
            disabled={isPending}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        </footer>
      )}

      {/* Entry metadata */}
      <footer className='flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100'>
        <span>{entry.content.length} characters</span>
        <time dateTime={entry.created_at}>
          {new Date(entry.created_at).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </time>
      </footer>
    </article>
  );
}
