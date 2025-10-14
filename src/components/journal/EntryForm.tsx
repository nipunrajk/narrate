'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { saveEntry } from '@/lib/actions/entries';
import { validateEntryContent } from '@/lib/utils/validation';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@/lib/types/database';

interface EntryFormProps {
  onSave?: (entry: JournalEntry) => void;
  onOptimisticAdd?: (content: string) => void;
  onError?: (error: string) => void;
  className?: string;
  placeholder?: string;
  autoSaveDelay?: number;
}

export function EntryForm({
  onSave,
  onOptimisticAdd,
  onError,
  className,
  placeholder = "What's on your mind today? Write about your thoughts, experiences, or anything that feels meaningful to you...",
  autoSaveDelay = 3000, // 3 seconds
}: EntryFormProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');

  // Refs for auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef('');
  const isManualSaveRef = useRef(false);

  // Clear auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleAutoSave = useCallback(async () => {
    if (!content.trim() || content === lastContentRef.current) {
      return;
    }

    // Validate content before auto-saving
    const validation = validateEntryContent(content);
    if (!validation.isValid) {
      return; // Don't auto-save invalid content
    }

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const result = await saveEntry(content);

      if (result.success && result.data) {
        lastContentRef.current = content;
        setLastSaved(new Date());
        setSaveStatus('saved');
        onSave?.(result.data);

        // Clear the form after successful save
        setContent('');
        lastContentRef.current = '';
      } else {
        setSaveStatus('error');
        onError?.(result.error || 'Failed to auto-save entry');
      }
    } catch {
      setSaveStatus('error');
      onError?.('An unexpected error occurred during auto-save');
    } finally {
      setIsSaving(false);

      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  }, [content, onSave, onError]);

  // Auto-save functionality
  useEffect(() => {
    // Don't auto-save if content hasn't changed or is empty
    if (content === lastContentRef.current || !content.trim()) {
      return;
    }

    // Don't auto-save if a manual save is in progress
    if (isManualSaveRef.current) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, autoSaveDelay, handleAutoSave]);

  const handleManualSave = useCallback(async () => {
    if (!content.trim()) {
      setValidationError('Please write something before saving');
      return;
    }

    // Validate content
    const validation = validateEntryContent(content);
    if (!validation.isValid) {
      setValidationError(validation.errors[0]);
      return;
    }

    setValidationError('');
    setIsLoading(true);
    setSaveStatus('saving');
    isManualSaveRef.current = true;

    // Clear auto-save timeout since we're manually saving
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    try {
      // Optimistic update - add entry immediately to UI
      onOptimisticAdd?.(content);

      const result = await saveEntry(content);

      if (result.success && result.data) {
        lastContentRef.current = content;
        setLastSaved(new Date());
        setSaveStatus('saved');
        onSave?.(result.data);

        // Clear the form after successful save
        setContent('');
        lastContentRef.current = '';
      } else {
        setSaveStatus('error');
        setValidationError(result.error || 'Failed to save entry');
        onError?.(result.error || 'Failed to save entry');
      }
    } catch {
      setSaveStatus('error');
      setValidationError('An unexpected error occurred');
      onError?.('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      isManualSaveRef.current = false;

      // Reset status after a delay
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  }, [content, onSave, onError, onOptimisticAdd]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);

      // Clear validation error when user starts typing
      if (validationError) {
        setValidationError('');
      }
    },
    [validationError]
  );

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return isSaving ? 'Auto-saving...' : 'Saving...';
      case 'saved':
        return lastSaved
          ? `Saved at ${lastSaved.toLocaleTimeString()}`
          : 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return '';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-primary';
      case 'saved':
        return 'text-success-600';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={className}>
      <div className='space-y-6'>
        <div>
          <TextArea
            value={content}
            onChange={handleContentChange}
            placeholder={placeholder}
            autoResize
            rows={8}
            className={cn(
              'min-h-[200px] sm:min-h-[240px]',
              'text-base sm:text-lg leading-relaxed',
              'focus:min-h-[300px] transition-all duration-300'
            )}
            error={validationError}
            disabled={isLoading}
          />
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            <Button
              onClick={handleManualSave}
              isLoading={isLoading}
              disabled={!content.trim() || isLoading}
              size='md'
              className='w-full sm:w-auto'
            >
              Save Entry
            </Button>

            {content.trim() && (
              <span className='text-caption text-muted-foreground text-center sm:text-left'>
                {content.length} characters
              </span>
            )}
          </div>

          {/* Save status indicator */}
          {saveStatus !== 'idle' && (
            <div
              className={cn(
                'text-caption text-center sm:text-right',
                getSaveStatusColor()
              )}
            >
              {getSaveStatusText()}
            </div>
          )}
        </div>

        {/* Auto-save info */}
        <div className='text-xs text-muted-foreground text-center sm:text-left'>
          Your entry will be automatically saved as you write.
        </div>
      </div>
    </div>
  );
}
