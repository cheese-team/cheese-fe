import { useInfiniteQuery } from '@tanstack/react-query';

import { communityQueryKeys } from './communityQueryKeys';

import { getJobPosts } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import type { JobPostsListParams } from '@/types/community/query';

export function useJobPosts(params: JobPostsListParams) {
  const { data: currentUser } = useCurrentUser();
  const requestParams = { ...params, userId: currentUser?.account.userId }; // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,

  return useInfiniteQuery({
    queryKey: communityQueryKeys.jobList(requestParams),

    queryFn: ({ pageParam, signal }) =>
      getJobPosts({ ...requestParams, cursor: pageParam, signal }),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined;
    },

    enabled: !!currentUser,
  });
}
