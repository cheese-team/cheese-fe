import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getInfoPost } from '@/api/community.api';
import { ApiError } from '@/api/client';

import { communityQueryKeys } from './communityQueryKeys';

import { syncPostViewCount } from './syncPostViewCount';

export function useInfoPost(infoId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: communityQueryKeys.infoDetail(infoId),

    queryFn: async ({ signal }) => {
      const post = await getInfoPost({ infoId, signal });
      syncPostViewCount(
        queryClient,
        communityQueryKeys.infoLists(),
        communityQueryKeys.infoDetail(infoId),
        post,
        signal,
      );
      return post;
    },

    enabled: Boolean(infoId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
