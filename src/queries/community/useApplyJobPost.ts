import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyJobPost, type JobPostsResponse } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { JobPost } from '@/types/community/community';
import type { InfiniteData, QueryFilters } from '@tanstack/react-query';

export function useApplyJobPost() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!currentUser) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      const userId = currentUser.account.userId; // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인
      const response = await applyJobPost({ jobId, userId });

      return { ...response, userId };
    },
    onSuccess: async (response, jobId) => {
      const queryKey = communityQueryKeys.jobDetail(jobId, response.userId);
      const listFilters: QueryFilters = {
        queryKey: communityQueryKeys.jobLists(),
        predicate: (query) => {
          const params = query.queryKey[3];

          return (
            typeof params === 'object' &&
            params !== null &&
            'userId' in params &&
            params.userId === response.userId
          );
        },
      };

      await Promise.all([
        queryClient.cancelQueries({ queryKey, exact: true }),
        queryClient.cancelQueries(listFilters),
      ]);
      queryClient.setQueryData<JobPost>(queryKey, (current) =>
        current ? { ...current, isApplied: response.isApplied } : current,
      );
      queryClient.setQueriesData<InfiniteData<JobPostsResponse>>(listFilters, (current) => {
        if (!current) return current;

        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((post) =>
              post.id === jobId ? { ...post, isApplied: response.isApplied } : post,
            ),
          })),
        };
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey, exact: true }),
        queryClient.invalidateQueries(listFilters),
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.bookmarks('jobs'), // TODO: JWT 인증 방식 전환 시 확인
        }),
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.jobApplications(), // TODO: JWT 인증 방식 전환 시 확인
        }),
      ]);
    },
  });
}
