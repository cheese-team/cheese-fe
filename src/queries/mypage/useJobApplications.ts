import { useInfiniteQuery } from '@tanstack/react-query';

import { getJobApplications, type ApplicationsParams } from '@/api/mypage.api';

import { mypageQueryKeys } from './mypageQueryKeys';

export function useJobApplications(params: Omit<ApplicationsParams, 'cursor'>) {
  return useInfiniteQuery({
    queryKey: mypageQueryKeys.jobApplicationList(params),

    queryFn: ({ pageParam, signal }) => {
      return getJobApplications({ ...params, cursor: pageParam }, signal);
    },

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
