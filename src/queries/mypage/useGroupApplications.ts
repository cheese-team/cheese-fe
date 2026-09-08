import { useInfiniteQuery } from '@tanstack/react-query';

import { getGroupApplications, type ApplicationsParams } from '@/api/mypage.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { mypageQueryKeys } from './mypageQueryKeys';

export function useGroupApplications(params: Omit<ApplicationsParams, 'userId' | 'cursor'>) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  return useInfiniteQuery({
    queryKey: mypageQueryKeys.groupApplicationList(userId, params),
    queryFn: ({ pageParam, signal }) => {
      if (!userId) throw new Error('로그인 사용자 정보가 필요합니다.');
      return getGroupApplications({ ...params, userId, cursor: pageParam }, signal);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: Boolean(userId),
  });
}
