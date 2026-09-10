import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Project Command Center',
  description: 'Personal project roadmap and execution board.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
