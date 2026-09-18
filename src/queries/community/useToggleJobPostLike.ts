import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeJobPost, unlikeJobPost, type JobPostsResponse } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { JobPost, ToggleJobPostLikeParams } from '@/types/community/community';
import type { InfiniteData, QueryFilters } from '@tanstack/react-query';
import type { JobBookmarksResponse } from '@/api/mypage.api';

const getJobListFilters = (userId: string): QueryFilters => ({
  queryKey: communityQueryKeys.jobLists(),
  predicate: (query) => {
    const params = query.queryKey[3];

    return (
      typeof params === 'object' &&
      params !== null &&
      'userId' in params &&
      params.userId === userId
    );
  },
});

export function useToggleJobPostLike() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: ({ jobId, isLiked }: ToggleJobPostLikeParams) => {
      if (!currentUser) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      const request = { jobId, userId: currentUser.account.userId }; // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,

      return isLiked ? unlikeJobPost(request) : likeJobPost(request);
    },

    onMutate: async (variables) => {
      if (!currentUser) return;

      const listFilters = getJobListFilters(currentUser.account.userId); // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.jobDetail(variables.jobId, currentUser.account.userId), // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,
          exact: true,
        }),
        queryClient.cancelQueries(listFilters),
        queryClient.cancelQueries({
          queryKey: mypageQueryKeys.bookmarks('jobs'), // TODO: JWT 인증 방식 전환 시 확인
        }),
      ]);
    },

    onSuccess: (response, variables) => {
      if (!currentUser) return;

      const listFilters = getJobListFilters(currentUser.account.userId); // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,

      void queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.jobApplications(), // TODO: JWT 인증 방식 전환 시 확인
      });

      const likeCountDelta = response.isLiked === variables.isLiked ? 0 : response.isLiked ? 1 : -1;
      const updateLike = (post: JobPost): JobPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(0, post.likeCount + likeCountDelta),
      });

      queryClient.setQueryData<JobPost>(
        communityQueryKeys.jobDetail(variables.jobId, currentUser.account.userId), // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,
        (current) => (current ? updateLike(current) : current),
      );

      queryClient.setQueriesData<InfiniteData<JobPostsResponse>>(listFilters, (current) => {
        if (!current) return current;

        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((post) =>
              post.id === variables.jobId ? updateLike(post) : post,
            ),
          })),
        };
      });

      queryClient.setQueriesData<InfiniteData<JobBookmarksResponse>>(
        { queryKey: mypageQueryKeys.bookmarks('jobs') }, // TODO: JWT 인증 방식 전환 시 확인
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === variables.jobId ? updateLike(post) : post,
              ),
            })),
          };
        },
      );
    },
  });
}
