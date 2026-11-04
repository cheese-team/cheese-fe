import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getGroupPost } from '@/api/community.api';
import { ApiError } from '@/api/client';

import { communityQueryKeys } from './communityQueryKeys';

import { syncPostViewCount } from './syncPostViewCount';

export function useGroupPost(groupId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: communityQueryKeys.groupDetail(groupId),

    queryFn: async ({ signal }) => {
      const post = await getGroupPost({ groupId, signal });
      syncPostViewCount(
        queryClient,
        communityQueryKeys.groupLists(),
        communityQueryKeys.groupDetail(groupId),
        post,
        signal,
      );
      return post;
    },

    enabled: Boolean(groupId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
