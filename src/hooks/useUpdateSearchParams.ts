'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * 현재 URL의 search params를 수정하고 라우팅합니다.
 */
export function useUpdateSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim() === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return updateSearchParams;
}
