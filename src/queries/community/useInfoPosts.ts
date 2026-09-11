import { useInfiniteQuery } from '@tanstack/react-query';

import { communityQueryKeys } from './communityQueryKeys';

import { getInfoPosts } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import type { InfoPostsListParams } from '@/types/community/query';

export function useInfoPosts(params: InfoPostsListParams) {
  const { data: currentUser } = useCurrentUser();
  const requestParams = {
    ...params,
    sort: params.sort ?? 'all',
    limit: params.limit ?? 20,
    userId: currentUser?.id,
  };

  return useInfiniteQuery({
    queryKey: communityQueryKeys.infoList(requestParams),

    queryFn: ({ pageParam, signal }) =>
      getInfoPosts({ ...requestParams, cursor: pageParam, signal }),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined;
    },

    enabled: !!currentUser,
  });
}
