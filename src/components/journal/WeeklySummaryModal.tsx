import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  generateWeeklySummaryAction,
  canGenerateWeeklySummary,
} from '@/lib/actions/entries';
import type { WeeklySummary } from '@/lib/types/database';

interface WeeklySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<{
    canGenerate: boolean;
    entryCount: number;
  } | null>(null);

  // Check eligibility when modal opens
  React.useEffect(() => {
    if (isOpen && !eligibility) {
      checkEligibility();
    }
  }, [isOpen, eligibility]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSummary(null);
      setError(null);
      setEligibility(null);
    }
  }, [isOpen]);

  const checkEligibility = async () => {
    try {
      const result = await canGenerateWeeklySummary();
      if (result.success && result.data) {
        setEligibility(result.data);
      } else {
        setError(result.error || 'Failed to check eligibility');
      }
    } catch {
      setError('Failed to check if you can generate a summary');
    }
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateWeeklySummaryAction();

      if (result.success && result.data) {
        setSummary(result.data);
      } else {
        setError(result.error || 'Failed to generate summary');
      }
    } catch {
      setError('An unexpected error occurred while generating your summary');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    // Loading state for eligibility check
    if (!eligibility && !error) {
      return (
        <div className='flex items-center justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600'></div>
          <span className='ml-3 text-slate-600'>Checking your entries...</span>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className='text-center py-8'>
          <div className='text-red-600 mb-4'>
            <svg
              className='w-12 h-12 mx-auto mb-2'
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
          <p className='text-slate-700 mb-4'>{error}</p>
          <Button
            onClick={() => {
              setError(null);
              checkEligibility();
            }}
            variant='outline'
          >
            Try Again
          </Button>
        </div>
      );
    }

    // Not eligible state
    if (eligibility && !eligibility.canGenerate) {
      return (
        <div className='text-center py-8'>
          <div className='text-slate-400 mb-4'>
            <svg
              className='w-12 h-12 mx-auto mb-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-slate-900 mb-2'>
            Not Enough Entries
          </h3>
          <p className='text-slate-600 mb-4'>
            You need at least 5 journal entries from the last 7 days to generate
            a weekly summary.
          </p>
          <p className='text-sm text-slate-500 mb-6'>
            You currently have {eligibility.entryCount}{' '}
            {eligibility.entryCount === 1 ? 'entry' : 'entries'}. Keep writing
            to unlock your weekly insights!
          </p>
          <Button onClick={onClose} variant='outline'>
            Continue Writing
          </Button>
        </div>
      );
    }

    // Summary generated state
    if (summary) {
      return (
        <div className='space-y-6'>
          <div className='text-center border-b border-slate-200 pb-4'>
            <h3 className='text-lg font-medium text-slate-900 mb-1'>
              Your Weekly Reflection
            </h3>
            <p className='text-sm text-slate-500'>
              {summary.period.start} - {summary.period.end}
            </p>
          </div>

          <div className='space-y-6'>
            <div>
              <h4 className='font-medium text-slate-900 mb-3 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-slate-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                Weekly Summary
              </h4>
              <div className='prose prose-slate max-w-none'>
                {summary.summary.split('\n').map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p
                        key={index}
                        className='text-slate-700 leading-relaxed mb-3'
                      >
                        {paragraph.trim()}
                      </p>
                    )
                )}
              </div>
            </div>

            <div>
              <h4 className='font-medium text-slate-900 mb-3 flex items-center'>
                <svg
                  className='w-5 h-5 mr-2 text-slate-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                  />
                </svg>
                Key Theme
              </h4>
              <p className='text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg'>
                {summary.theme}
              </p>
            </div>

            {summary.insights && summary.insights.length > 0 && (
              <div>
                <h4 className='font-medium text-slate-900 mb-3 flex items-center'>
                  <svg
                    className='w-5 h-5 mr-2 text-slate-600'
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
                  Insights & Reflections
                </h4>
                <ul className='space-y-3'>
                  {summary.insights.map((insight, index) => (
                    <li key={index} className='flex items-start'>
                      <div className='flex-shrink-0 w-2 h-2 bg-slate-400 rounded-full mt-2 mr-3'></div>
                      <p className='text-slate-700 leading-relaxed'>
                        {insight}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className='flex justify-end pt-4 border-t border-slate-200'>
            <Button onClick={onClose} variant='outline'>
              Close
            </Button>
          </div>
        </div>
      );
    }

    // Ready to generate state
    return (
      <div className='text-center py-8'>
        <div className='text-slate-600 mb-4'>
          <svg
            className='w-12 h-12 mx-auto mb-2'
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
        </div>
        <h3 className='text-lg font-medium text-slate-900 mb-2'>
          Generate Your Weekly Summary
        </h3>
        <p className='text-slate-600 mb-6'>
          You have {eligibility?.entryCount} entries from the last 7 days. Ready
          to discover insights from your week?
        </p>
        <div className='flex justify-center space-x-3'>
          <Button onClick={onClose} variant='outline'>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateSummary}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Summary'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Weekly Reflection'
      size='lg'
    >
      {renderContent()}
    </Modal>
  );
};

export { WeeklySummaryModal };
