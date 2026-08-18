import type { ReactNode } from 'react';

import AppSidebar from '@/components/layout/sidebar/AppSidebar';
import { CalendarStoreProvider } from './calendar/_store/CalendarStoreProvider';
import { MemoFloatingWidget } from './memo/_components/MemoFloatingWidget';
import { MemoStoreProvider } from './memo/_store/MemoStoreProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <MemoStoreProvider>
      <CalendarStoreProvider>
        <div className="flex min-h-dvh">
          <AppSidebar />

          <main id="app-main" className="relative min-w-0 flex-1">
            {children}
          </main>

          <MemoFloatingWidget />
        </div>
      </CalendarStoreProvider>
    </MemoStoreProvider>
  );
}
