'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(
    'signup'
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
    // For signup, we don't redirect immediately since email confirmation is required
    // The success message is shown in the AuthForm component
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <AuthForm mode={mode} onSuccess={handleSuccess} onModeChange={setMode} />
    </div>
  );
}
