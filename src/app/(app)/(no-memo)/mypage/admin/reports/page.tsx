import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCachedMeFromServer } from '@/api/auth.api';
import { ApiError } from '@/api/client';

import AdminReportList from './_components/AdminReportList';

export default async function AdminReportsPage() {
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

  if (user.account.isAdmin !== true) {
    redirect('/mypage');
  }

  return <AdminReportList />;
}
