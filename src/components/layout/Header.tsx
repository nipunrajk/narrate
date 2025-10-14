'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { signOut } from '@/lib/supabase/auth';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  user: User;
  onWeeklySummaryClick: () => void;
}

export function Header({ user, onWeeklySummaryClick }: HeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = user.email?.split('@')[0] || 'User';

  return (
    <header className='bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm sticky top-0 z-40'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16 lg:h-18'>
          {/* Logo/Brand */}
          <div className='flex items-center'>
            <div className='flex items-center space-x-3'>
              {/* Logo icon */}
              <div className='w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-5 h-5 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                  />
                </svg>
              </div>
              <h1 className='text-xl sm:text-2xl font-light text-slate-900'>
                Narrate
              </h1>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className='flex items-center space-x-2 sm:space-x-3 lg:space-x-4'>
            {/* Weekly Summary Button - Desktop */}
            <Button
              onClick={onWeeklySummaryClick}
              variant='outline'
              className='hidden md:inline-flex text-sm font-medium border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200'
            >
              <svg
                className='w-4 h-4 mr-2'
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
              Weekly Summary
            </Button>

            {/* Weekly Summary Button - Mobile */}
            <Button
              onClick={onWeeklySummaryClick}
              variant='outline'
              className='md:hidden p-2.5 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200'
              aria-label='Generate weekly summary'
            >
              <svg
                className='w-5 h-5'
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
            </Button>

            {/* User Profile Section */}
            <div className='flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-200'>
              {/* User info - Desktop */}
              <div className='hidden lg:block text-right'>
                <p className='text-sm font-medium text-slate-900 truncate max-w-32'>
                  {displayName}
                </p>
                <p className='text-xs text-slate-500 truncate max-w-32'>
                  {user.email}
                </p>
              </div>

              {/* User Avatar */}
              <div className='relative'>
                <div className='w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white shadow-sm'>
                  <span className='text-sm font-semibold text-slate-700'>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online indicator */}
                <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full'></div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant='outline'
                isLoading={isLoggingOut}
                disabled={isLoggingOut}
                className='text-slate-600 hover:text-slate-900 text-sm font-medium border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-200'
              >
                {isLoggingOut ? (
                  <div className='w-4 h-4 sm:mr-2 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600'></div>
                ) : (
                  <svg
                    className='w-4 h-4 sm:mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                    />
                  </svg>
                )}
                <span className='hidden sm:inline'>
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
