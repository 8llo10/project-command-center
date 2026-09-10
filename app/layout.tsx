import type { Metadata, Viewport } from 'next';
import { LocaleProvider } from '@/components/LocaleProvider';
import './globals.css';
import './responsive-board.css';

export const metadata: Metadata = {
  title: 'Ghala · Project Command Center',
  description: 'A bilingual personal project operating system synced with GitHub.',
  applicationName: 'Ghala Project OS',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Project OS',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b0c0f',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body><LocaleProvider>{children}</LocaleProvider></body>
    </html>
  );
}
