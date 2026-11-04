import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import AppSidebar from '@/components/layout/sidebar/AppSidebar';

import { getCachedMeFromServer } from '@/api/auth.api';
import { ApiError } from '@/api/client';
import { authQueryKeys } from '@/queries/auth/authQueryKeys';

import { CalendarStoreProvider } from './calendar/_store/CalendarStoreProvider';
import { MemoFloatingWidget } from './memo/_components/MemoFloatingWidget';
import { MemoStoreProvider } from './memo/_store/MemoStoreProvider';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookie = cookieStore.toString();

  let user;

  try {
    user = await getCachedMeFromServer(cookie);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login');
    }

    throw error;
  }

  const queryClient = new QueryClient();

  queryClient.setQueryData(authQueryKeys.me(), user);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
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
    </HydrationBoundary>
  );
}
