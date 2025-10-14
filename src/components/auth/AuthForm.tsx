'use client';

import { useState } from 'react';
import { signIn, signUp, resetPassword } from '@/lib/supabase/auth';

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
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-light text-gray-900 mb-2'>{getTitle()}</h1>
        <p className='text-gray-600'>
          {mode === 'login' && 'Sign in to continue your journaling journey'}
          {mode === 'signup' && 'Start your personal journaling journey'}
          {mode === 'forgot-password' &&
            'Enter your email to reset your password'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Email address
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='Enter your email'
            disabled={isLoading}
          />
        </div>

        {mode !== 'forgot-password' && (
          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Enter your password'
              disabled={isLoading}
            />
          </div>
        )}

        {error && (
          <div className='p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
            {error}
          </div>
        )}

        {message && (
          <div className='p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md'>
            {message}
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading}
          className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {getButtonText()}
        </button>
      </form>

      <div className='mt-6 text-center space-y-2'>
        {mode === 'login' && (
          <>
            <button
              type='button'
              onClick={() => onModeChange?.('forgot-password')}
              className='text-sm text-blue-600 hover:text-blue-500'
            >
              Forgot your password?
            </button>
            <div className='text-sm text-gray-600'>
              Don&apos;t have an account?{' '}
              <button
                type='button'
                onClick={() => onModeChange?.('signup')}
                className='text-blue-600 hover:text-blue-500 font-medium'
              >
                Sign up
              </button>
            </div>
          </>
        )}

        {mode === 'signup' && (
          <div className='text-sm text-gray-600'>
            Already have an account?{' '}
            <button
              type='button'
              onClick={() => onModeChange?.('login')}
              className='text-blue-600 hover:text-blue-500 font-medium'
            >
              Sign in
            </button>
          </div>
        )}

        {mode === 'forgot-password' && (
          <div className='text-sm text-gray-600'>
            Remember your password?{' '}
            <button
              type='button'
              onClick={() => onModeChange?.('login')}
              className='text-blue-600 hover:text-blue-500 font-medium'
            >
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
