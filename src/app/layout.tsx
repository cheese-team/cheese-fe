import QueryProvider from '@/providers/QueryProvider';
import './globals.css';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Cheese',
  description: 'Cheese - 취준을 위한 치즈 플랫폼',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <main className="min-h-dvh">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
