import { useInfiniteQuery } from '@tanstack/react-query';

import { getGroupBookmarks, type BookmarkListParams } from '@/api/mypage.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { mypageQueryKeys } from './mypageQueryKeys';

export function useGroupBookmarks({
  limit = 20,
}: Omit<BookmarkListParams, 'userId' | 'cursor'> = {}) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  return useInfiniteQuery({
    queryKey: mypageQueryKeys.bookmarkList(userId, 'groups', { limit }),
    queryFn: ({ pageParam, signal }) => {
      if (!userId) throw new Error('로그인 사용자 정보가 필요합니다.');
      return getGroupBookmarks({ userId, cursor: pageParam, limit }, signal);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(userId),
    refetchOnMount: 'always',
  });
}
