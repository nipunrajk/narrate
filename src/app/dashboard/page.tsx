import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { JournalDashboard } from '@/components/journal/JournalDashboard';
import { getUser } from '@/lib/supabase/auth-server';
import { getUserEntries } from '@/lib/actions/entries';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's entries
  const entriesResult = await getUserEntries();
  const initialEntries = entriesResult.success ? entriesResult.data || [] : [];

  return (
    <ProtectedRoute>
      <div className='min-h-screen bg-slate-50'>
        <div className='py-8 px-4 sm:px-6 lg:px-8'>
          <JournalDashboard initialEntries={initialEntries} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
