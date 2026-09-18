import { useInfiniteQuery } from '@tanstack/react-query';

import { getGroupBookmarks, type BookmarkListParams } from '@/api/mypage.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { mypageQueryKeys } from './mypageQueryKeys';

export function useGroupBookmarks({
  limit = 20,
}: Omit<BookmarkListParams, 'userId' | 'cursor'> = {}) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.account.userId; // TODO: JWT 인증 방식 전환 시 userId 제거

  return useInfiniteQuery({
    queryKey: mypageQueryKeys.bookmarkList('groups', { limit }), // TODO: JWT 인증 방식 전환 시 확인
    queryFn: ({ pageParam, signal }) => {
      if (!userId) throw new Error('로그인 사용자 정보가 필요합니다.');
      return getGroupBookmarks({ cursor: pageParam, limit }, signal); // TODO: JWT 인증 방식 전환 시 확인
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(userId),
    refetchOnMount: 'always',
  });
}
