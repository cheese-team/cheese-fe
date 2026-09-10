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

      const request = { jobId, userId: currentUser.id };

      return isLiked ? unlikeJobPost(request) : likeJobPost(request);
    },

    onMutate: async (variables) => {
      if (!currentUser) return;

      const listFilters = getJobListFilters(currentUser.id);

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.jobDetail(variables.jobId, currentUser.id),
          exact: true,
        }),
        queryClient.cancelQueries(listFilters),
        queryClient.cancelQueries({
          queryKey: mypageQueryKeys.bookmarks(currentUser.id, 'jobs'),
        }),
      ]);
    },

    onSuccess: (response, variables) => {
      if (!currentUser) return;

      const listFilters = getJobListFilters(currentUser.id);

      void queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.jobApplications(currentUser.id),
      });

      const likeCountDelta = response.isLiked === variables.isLiked ? 0 : response.isLiked ? 1 : -1;
      const updateLike = (post: JobPost): JobPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(0, post.likeCount + likeCountDelta),
      });

      queryClient.setQueryData<JobPost>(
        communityQueryKeys.jobDetail(variables.jobId, currentUser.id),
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
        { queryKey: mypageQueryKeys.bookmarks(currentUser.id, 'jobs') },
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
