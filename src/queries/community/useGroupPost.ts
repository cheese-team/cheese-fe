import { useQuery } from '@tanstack/react-query';

import { getGroupPost } from '@/api/community.api';
import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import { communityQueryKeys } from './communityQueryKeys';

export function useGroupPost(groupId: string) {
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.account.userId; // TODO: JWT 인증 방식 전환 시 userId 제거

  return useQuery({
    queryKey: communityQueryKeys.groupDetail(groupId, userId),

    queryFn: ({ signal }) => getGroupPost({ groupId, userId, signal }),

    enabled: Boolean(groupId) && Boolean(userId),

    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
