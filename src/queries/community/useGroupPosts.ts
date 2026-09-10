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
    userId: currentUser?.id,
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
