import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/api/client';
import { getPublicProfile } from '@/api/users.api';
import { userQueryKeys } from './userQueryKeys';

export function usePublicProfile(userId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: userQueryKeys.profile(userId),

    queryFn: ({ signal }) => {
      if (!userId) throw new Error('사용자 정보가 필요합니다.');

      return getPublicProfile(userId, signal);
    },

    enabled: enabled && Boolean(userId),

    retry: (failureCount, error) => {
      if (error.name === 'AbortError') return false;

      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
