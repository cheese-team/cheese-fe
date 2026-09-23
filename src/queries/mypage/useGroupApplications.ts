import { useInfiniteQuery } from '@tanstack/react-query';

import { getGroupApplications, type ApplicationsParams } from '@/api/mypage.api';

import { mypageQueryKeys } from './mypageQueryKeys';

export function useGroupApplications(params: Omit<ApplicationsParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: mypageQueryKeys.groupApplicationList(params),

    queryFn: ({ pageParam, signal }) => {
      return getGroupApplications({ ...params, cursor: pageParam }, signal);
    },

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
