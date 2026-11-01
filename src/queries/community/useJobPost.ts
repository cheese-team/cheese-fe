import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getJobPost } from '@/api/community.api';
import { ApiError } from '@/api/client';

import { communityQueryKeys } from './communityQueryKeys';

import { syncPostViewCount } from './syncPostViewCount';

export function useJobPost(jobId: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: communityQueryKeys.jobDetail(jobId),

    queryFn: async ({ signal }) => {
      const post = await getJobPost({ jobId, signal });
      syncPostViewCount(
        queryClient,
        communityQueryKeys.jobLists(),
        communityQueryKeys.jobDetail(jobId),
        post,
        signal,
      );
      return post;
    },

    enabled: Boolean(jobId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
