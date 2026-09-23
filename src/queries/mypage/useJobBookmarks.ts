import { useInfiniteQuery } from '@tanstack/react-query';

import { getJobBookmarks, type BookmarkListParams } from '@/api/mypage.api';

import { mypageQueryKeys } from './mypageQueryKeys';

export function useJobBookmarks({ limit = 20 }: Omit<BookmarkListParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: mypageQueryKeys.bookmarkList('jobs', { limit }),

    queryFn: ({ pageParam, signal }) => {
      return getJobBookmarks({ cursor: pageParam, limit }, signal);
    },

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,

    refetchOnMount: 'always',
  });
}
