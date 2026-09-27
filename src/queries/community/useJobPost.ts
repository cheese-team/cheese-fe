import { useQuery } from '@tanstack/react-query';

import { getJobPost } from '@/api/community.api';
import { ApiError } from '@/api/client';

import { communityQueryKeys } from './communityQueryKeys';

export function useJobPost(jobId: string) {
  return useQuery({
    queryKey: communityQueryKeys.jobDetail(jobId),

    queryFn: ({ signal }) => getJobPost({ jobId, signal }),

    enabled: Boolean(jobId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
