import { useInfiniteQuery } from '@tanstack/react-query';

import { getGroupApplications, type ApplicationsParams } from '@/api/mypage.api';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import { mypageQueryKeys } from './mypageQueryKeys';

export function useGroupApplications(params: Omit<ApplicationsParams, 'cursor'>) {
  const { data: user, isSuccess } = useCurrentUser();

  return useInfiniteQuery({
    queryKey: mypageQueryKeys.groupApplicationList(params),
    enabled: isSuccess && user.account.profileType === 'personal',

    queryFn: ({ pageParam, signal }) => {
      return getGroupApplications({ ...params, cursor: pageParam }, signal);
    },

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}
