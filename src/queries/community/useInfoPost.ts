import { useQuery } from '@tanstack/react-query';

import { getInfoPost } from '@/api/community.api';
import { ApiError } from '@/api/client';

import { communityQueryKeys } from './communityQueryKeys';

export function useInfoPost(infoId: string) {
  return useQuery({
    queryKey: communityQueryKeys.infoDetail(infoId),

    queryFn: ({ signal }) => getInfoPost({ infoId, signal }),

    enabled: Boolean(infoId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
