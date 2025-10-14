import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Narrate - Your Digital Journal',
  description:
    'A modern journaling app with AI-powered weekly insights to help you discover your personal story.',
  keywords: ['journal', 'diary', 'reflection', 'AI', 'personal growth'],
  authors: [{ name: 'Narrate Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className='h-full'>
      <body className='h-full antialiased'>{children}</body>
    </html>
  );
}
