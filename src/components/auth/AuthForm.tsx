'use client';

import { useState } from 'react';
import { signIn, signUp, resetPassword } from '@/lib/supabase/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'signup' | 'forgot-password';
  onSuccess?: () => void;
  onModeChange?: (mode: 'login' | 'signup' | 'forgot-password') => void;
}

export default function AuthForm({
  mode,
  onSuccess,
  onModeChange,
}: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onSuccess?.();
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          setError(error.message);
        } else {
          setMessage('Check your email for the password reset link!');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Welcome back';
      case 'signup':
        return 'Create your account';
      case 'forgot-password':
        return 'Reset your password';
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    switch (mode) {
      case 'login':
        return 'Sign in';
      case 'signup':
        return 'Create account';
      case 'forgot-password':
        return 'Send reset link';
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-8 space-y-fluid'>
        <h1 className='text-heading font-light text-card-foreground'>
          {getTitle()}
        </h1>
        <p className='text-body text-muted-foreground'>
          {mode === 'login' && 'Sign in to continue your journaling journey'}
          {mode === 'signup' && 'Start your personal journaling journey'}
          {mode === 'forgot-password' &&
            'Enter your email to reset your password'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <Input
          id='email'
          type='email'
          label='Email address'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder='Enter your email'
          disabled={isLoading}
          error={
            error && error.toLowerCase().includes('email') ? error : undefined
          }
        />

        {mode !== 'forgot-password' && (
          <Input
            id='password'
            type='password'
            label='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder='Enter your password'
            disabled={isLoading}
            error={
              error && error.toLowerCase().includes('password')
                ? error
                : undefined
            }
            helperText={
              mode === 'signup'
                ? 'Password must be at least 6 characters'
                : undefined
            }
          />
        )}

        {error &&
          !error.toLowerCase().includes('email') &&
          !error.toLowerCase().includes('password') && (
            <div
              className={cn(
                'p-3 text-sm rounded-lg border animate-slide-down',
                'bg-destructive/10 text-destructive border-destructive/20'
              )}
            >
              {error}
            </div>
          )}

        {message && (
          <div
            className={cn(
              'p-3 text-sm rounded-lg border animate-slide-down',
              'bg-success-50 text-success-700 border-success-200'
            )}
          >
            {message}
          </div>
        )}

        <Button
          type='submit'
          disabled={isLoading}
          isLoading={isLoading}
          className='w-full'
          size='lg'
        >
          {getButtonText()}
        </Button>
      </form>

      <div className='mt-6 text-center space-y-3'>
        {mode === 'login' && (
          <>
            <button
              type='button'
              onClick={() => onModeChange?.('forgot-password')}
              className='text-caption text-primary hover:text-primary/80 transition-colors-smooth'
            >
              Forgot your password?
            </button>
            <div className='text-caption text-muted-foreground'>
              Don&apos;t have an account?{' '}
              <button
                type='button'
                onClick={() => onModeChange?.('signup')}
                className='text-primary hover:text-primary/80 font-medium transition-colors-smooth'
              >
                Sign up
              </button>
            </div>
          </>
        )}

        {mode === 'signup' && (
          <div className='text-caption text-muted-foreground'>
            Already have an account?{' '}
            <button
              type='button'
              onClick={() => onModeChange?.('login')}
              className='text-primary hover:text-primary/80 font-medium transition-colors-smooth'
            >
              Sign in
            </button>
          </div>
        )}

        {mode === 'forgot-password' && (
          <div className='text-caption text-muted-foreground'>
            Remember your password?{' '}
            <button
              type='button'
              onClick={() => onModeChange?.('login')}
              className='text-primary hover:text-primary/80 font-medium transition-colors-smooth'
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
