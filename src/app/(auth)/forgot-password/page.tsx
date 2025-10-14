'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(
    'forgot-password'
  );
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push('/dashboard');
      }
    };

    checkAuth();
  }, [router]);

  const handleSuccess = () => {
    // Success message is shown in the AuthForm component
    // User will receive email with reset link
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <AuthForm mode={mode} onSuccess={handleSuccess} onModeChange={setMode} />
    </div>
  );
}
