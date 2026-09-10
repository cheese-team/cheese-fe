'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * 현재 URL의 search params를 수정하고 라우팅합니다.
 */
export function useUpdateSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateSearchParams(key: string, value: string): void;
  function updateSearchParams(updates: Record<string, string | null>): void;
  function updateSearchParams(
    keyOrUpdates: string | Record<string, string | null>,
    value?: string,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    const updates = typeof keyOrUpdates === 'string' ? { [keyOrUpdates]: value } : keyOrUpdates;

    for (const [key, nextValue] of Object.entries(updates)) {
      if (nextValue == null || nextValue.trim() === '') {
        params.delete(key);
      } else {
        params.set(key, nextValue);
      }
    }

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return updateSearchParams;
}
