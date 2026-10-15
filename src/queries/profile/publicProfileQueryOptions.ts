import { queryOptions, type QueryClient } from '@tanstack/react-query';
import type { CurrentUser } from '@/api/auth.api';
import { ApiError } from '@/api/client';
import { getPublicUserProfile } from '@/api/profile.api';
import { authQueryKeys } from '@/queries/auth/authQueryKeys';

export function publicProfileOptions(
  queryClient: QueryClient,
  { viewerId, userId }: { viewerId: string; userId: string },
) {
  const authQuery = queryClient.getQueryCache().find({ queryKey: authQueryKeys.me(), exact: true });
  const isCurrentViewer = () => {
    const currentQuery = queryClient
      .getQueryCache()
      .find({ queryKey: authQueryKeys.me(), exact: true });
    const state = queryClient.getQueryState<CurrentUser>(authQueryKeys.me());
    return (
      Boolean(viewerId && userId) &&
      currentQuery === authQuery &&
      state?.status === 'success' &&
      state.data?.account.userId === viewerId
    );
  };

  return queryOptions({
    queryKey: ['public-profiles', 'viewer', viewerId, 'user', userId] as const,
    enabled: isCurrentViewer(),
    queryFn: async ({ signal }) => {
      if (!isCurrentViewer()) throw new ApiError('다시 로그인해 주세요.', 401);
      const response = await getPublicUserProfile({ userId, signal });
      if (!isCurrentViewer()) throw new ApiError('다시 로그인해 주세요.', 401);
      return response;
    },
    // 모달을 다시 열 때 변경된 활성 프로필을 조회한다. 닫은 프로필은 보관하지 않는다.
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount, error) => {
      if (error.name === 'AbortError') return false;
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}
