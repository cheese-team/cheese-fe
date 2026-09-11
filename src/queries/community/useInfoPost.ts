import { useQuery } from '@tanstack/react-query';

import { getInfoPost } from '@/api/community.api';
import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import { communityQueryKeys } from './communityQueryKeys';

export function useInfoPost(infoId: string) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  return useQuery({
    queryKey: communityQueryKeys.infoDetail(infoId, userId),

    queryFn: ({ signal }) => getInfoPost({ infoId, userId, signal }),

    enabled: Boolean(infoId) && Boolean(userId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
