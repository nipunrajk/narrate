import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { getUser } from '@/lib/supabase/auth-server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
          <div className='bg-white shadow rounded-lg p-6'>
            <h1 className='text-2xl font-light text-gray-900 mb-4'>
              Welcome to your journal
            </h1>
            <p className='text-gray-600 mb-4'>
              Hello {user.email}! This is your dashboard where you&apos;ll be
              able to write and view your journal entries.
            </p>
            <div className='text-sm text-gray-500'>User ID: {user.id}</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
