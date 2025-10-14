import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Theme toggle in top right */}
      <div className='absolute top-4 right-4 z-10'>
        <ThemeToggle />
      </div>

      <div className='flex min-h-full flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='text-center space-y-fluid'>
            <div className='flex items-center justify-center space-x-2'>
              <div className='w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-soft'>
                <svg
                  className='w-6 h-6 text-primary-foreground'
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
              <h1 className='text-display font-light tracking-tight text-foreground'>
                Narrate
              </h1>
            </div>
            <p className='text-body text-muted-foreground'>
              Your personal journaling companion
            </p>
          </div>
        </div>
        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-card py-8 px-4 shadow-soft border border-border sm:rounded-xl sm:px-10'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
