import type { Metadata } from 'next';
import { Inter, Crimson_Text } from 'next/font/google';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { PerformanceMonitor } from '@/components/ui/PerformanceMonitor';
import './globals.css';

// Optimized font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const crimsonText = Crimson_Text({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-crimson',
  preload: false, // Only preload primary font
});

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
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='anonymous'
        />
      </head>
      <body
        className={`h-full antialiased ${inter.variable} ${crimsonText.variable}`}
      >
        <ThemeProvider defaultTheme='system' storageKey='narrate-ui-theme'>
          <OfflineIndicator />
          <PerformanceMonitor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
