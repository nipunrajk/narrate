'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we have the necessary tokens from the URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage(
          'Password updated successfully! Redirecting to dashboard...'
        );
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-light text-gray-900 mb-2'>
          Set new password
        </h1>
        <p className='text-gray-600'>Enter your new password below</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label
            htmlFor='password'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            New password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='Enter new password'
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor='confirmPassword'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Confirm new password
          </label>
          <input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            placeholder='Confirm new password'
            disabled={isLoading}
          />
        </div>

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
          {isLoading ? 'Updating...' : 'Update password'}
        </button>
      </form>

      <div className='mt-6 text-center'>
        <button
          type='button'
          onClick={() => router.push('/login')}
          className='text-sm text-blue-600 hover:text-blue-500'
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='w-full max-w-md mx-auto'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            <p className='mt-2 text-gray-600'>Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
