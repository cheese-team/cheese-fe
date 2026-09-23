import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeJobPost, unlikeJobPost, type JobPostsResponse } from '@/api/community.api';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { JobPost, ToggleJobPostLikeParams } from '@/types/community/community';
import type { InfiniteData } from '@tanstack/react-query';
import type { JobBookmarksResponse } from '@/api/mypage.api';

export function useToggleJobPostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, isLiked }: ToggleJobPostLikeParams) => {
      const request = { jobId };

      return isLiked ? unlikeJobPost(request) : likeJobPost(request);
    },

    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.jobDetail(variables.jobId),
          exact: true,
        }),
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.jobLists(),
        }),
        queryClient.cancelQueries({
          queryKey: mypageQueryKeys.bookmarks('jobs'),
        }),
      ]);
    },

    onSuccess: (response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.jobApplications(),
      });

      const updateLike = (post: JobPost): JobPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(
          0,
          post.likeCount + (post.isLiked === response.isLiked ? 0 : response.isLiked ? 1 : -1),
        ),
      });

      queryClient.setQueryData<JobPost>(communityQueryKeys.jobDetail(variables.jobId), (current) =>
        current ? updateLike(current) : current,
      );

      queryClient.setQueriesData<InfiniteData<JobPostsResponse>>(
        { queryKey: communityQueryKeys.jobLists() },
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

      queryClient.setQueriesData<InfiniteData<JobBookmarksResponse>>(
        { queryKey: mypageQueryKeys.bookmarks('jobs') },
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
