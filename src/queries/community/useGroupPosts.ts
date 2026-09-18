import { useInfiniteQuery } from '@tanstack/react-query';

import { communityQueryKeys } from './communityQueryKeys';

import { getGroupPosts } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import type { GroupPostsListParams } from '@/types/community/query';

export function useGroupPosts(params: GroupPostsListParams) {
  const { data: currentUser } = useCurrentUser();
  const requestParams = {
    ...params,
    sort: params.sort ?? 'latest',
    limit: params.limit ?? 20,
    userId: currentUser?.account.userId, // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,
  };

  return useInfiniteQuery({
    queryKey: communityQueryKeys.groupList(requestParams),

    queryFn: ({ pageParam, signal }) =>
      getGroupPosts({ ...requestParams, cursor: pageParam, signal }),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined;
    },

    enabled: !!currentUser,
  });
}
