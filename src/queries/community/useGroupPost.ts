import { useQuery } from '@tanstack/react-query';

import { getGroupPost } from '@/api/community.api';
import { ApiError } from '@/api/client';

import { communityQueryKeys } from './communityQueryKeys';

export function useGroupPost(groupId: string) {
  return useQuery({
    queryKey: communityQueryKeys.groupDetail(groupId),

    queryFn: ({ signal }) => getGroupPost({ groupId, signal }),

    enabled: Boolean(groupId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
