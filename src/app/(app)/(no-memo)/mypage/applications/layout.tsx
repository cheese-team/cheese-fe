import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCachedMeFromServer } from '@/api/auth.api';
import { ApiError } from '@/api/client';

export default async function ApplicationsLayout({ children }: { children: ReactNode }) {
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

  if (user.account.profileType === 'company') {
    redirect('/mypage');
  }

  return children;
}
