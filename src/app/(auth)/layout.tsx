export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='text-center'>
            <h2 className='text-3xl font-light tracking-tight text-gray-900'>
              Narrate
            </h2>
            <p className='mt-2 text-sm text-gray-600'>
              Your personal journaling companion
            </p>
          </div>
        </div>
        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
          <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
