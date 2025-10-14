'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { signOut } from '@/lib/supabase/auth';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  user?: User | null;
  className?: string;
}

export function Header({ user, className }: HeaderProps) {
  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-border',
        'bg-background/80 backdrop-blur-adaptive',
        'supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className='container-responsive'>
        <div className='flex h-14 sm:h-16 items-center justify-between'>
          {/* Logo and brand */}
          <div className='flex items-center space-x-3'>
            <div className='flex items-center space-x-2'>
              <div
                className={cn(
                  'w-8 h-8 rounded-lg bg-primary flex items-center justify-center',
                  'shadow-sm'
                )}
              >
                <svg
                  className='w-5 h-5 text-primary-foreground'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                  />
                </svg>
              </div>
              <h1 className='text-xl font-light text-foreground hidden sm:block'>
                Narrate
              </h1>
            </div>
          </div>

          {/* Navigation and user actions */}
          <div className='flex items-center space-x-2 sm:space-x-4'>
            {user && (
              <>
                {/* User info - hidden on mobile */}
                <div className='hidden md:flex items-center space-x-3'>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-foreground'>
                      {user.email?.split('@')[0]}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full bg-secondary flex items-center justify-center',
                      'text-secondary-foreground text-sm font-medium'
                    )}
                  >
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Mobile user avatar */}
                <div
                  className={cn(
                    'md:hidden w-8 h-8 rounded-full bg-secondary',
                    'flex items-center justify-center',
                    'text-secondary-foreground text-sm font-medium'
                  )}
                >
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </>
            )}

            {/* Theme toggle */}
            <ThemeToggle size='sm' />

            {/* Sign out button */}
            {user && (
              <Button
                variant='outline'
                size='sm'
                onClick={handleSignOut}
                className='hidden sm:inline-flex'
              >
                Sign Out
              </Button>
            )}

            {/* Mobile menu button */}
            {user && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleSignOut}
                className='sm:hidden'
                aria-label='Sign out'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
