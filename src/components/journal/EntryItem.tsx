'use client';

import React, { useState } from 'react';
import {
  formatDate,
  formatRelativeDate,
  isToday,
  isYesterday,
} from '@/lib/utils/date';
import { cn } from '@/lib/utils';
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
      className={cn(
        'bg-card rounded-xl border border-border p-6 space-y-4 shadow-soft',
        'transition-all duration-200 hover:shadow-medium',
        'animate-fade-in',
        isPending && 'opacity-60 animate-pulse',
        className
      )}
    >
      {/* Header with date information */}
      <header className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <h3 className='text-subheading font-medium text-card-foreground'>
            {getDateDisplay()}
          </h3>
          {!isToday(entry.created_at) && !isYesterday(entry.created_at) && (
            <span className='text-caption text-muted-foreground'>
              {relativeDate}
            </span>
          )}
        </div>

        {/* Pending indicator */}
        {isPending && (
          <div className='flex items-center space-x-2 text-caption text-primary'>
            <div className='w-2 h-2 bg-primary rounded-full animate-pulse'></div>
            <span>Saving...</span>
          </div>
        )}
      </header>

      {/* Entry content */}
      <div className='journal-content'>
        <p className='text-card-foreground leading-relaxed whitespace-pre-wrap'>
          {displayContent}
        </p>
      </div>

      {/* Expand/collapse button for long entries */}
      {entry.content.length > maxPreviewLength && (
        <div className='pt-2'>
          <button
            onClick={handleToggleExpand}
            className={cn(
              'text-caption text-muted-foreground hover:text-foreground',
              'transition-colors-smooth touch-target',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            disabled={isPending}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        </div>
      )}

      {/* Entry metadata */}
      <footer className='flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border'>
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
