import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import './globals.css';

export const metadata: Metadata = {
  title: 'Narrate - Your Digital Journal',
  description:
    'A modern journaling app with AI-powered weekly insights to help you discover your personal story.',
  keywords: ['journal', 'diary', 'reflection', 'AI', 'personal growth'],
  authors: [{ name: 'Narrate Team' }],
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='h-full' suppressHydrationWarning>
      <body className='h-full antialiased'>
        <ThemeProvider defaultTheme='system' storageKey='narrate-ui-theme'>
          <OfflineIndicator />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
