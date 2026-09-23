import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyJobPost, type JobPostsResponse } from '@/api/community.api';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';
import { communityQueryKeys } from './communityQueryKeys';

import type { JobPost } from '@/types/community/community';
import type { InfiniteData } from '@tanstack/react-query';

export function useApplyJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => applyJobPost({ jobId }),

    onSuccess: async (response, jobId) => {
      const queryKey = communityQueryKeys.jobDetail(jobId);
      const listQueryKey = communityQueryKeys.jobLists();

      await Promise.all([
        queryClient.cancelQueries({ queryKey, exact: true }),
        queryClient.cancelQueries({ queryKey: listQueryKey }),
      ]);

      queryClient.setQueryData<JobPost>(queryKey, (current) =>
        current ? { ...current, isApplied: response.isApplied } : current,
      );

      queryClient.setQueriesData<InfiniteData<JobPostsResponse>>(
        { queryKey: listQueryKey },
        (current) => {
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
        },
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey, exact: true }),
        queryClient.invalidateQueries({ queryKey: listQueryKey }),
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.bookmarks('jobs'),
        }),
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.jobApplications(),
        }),
      ]);
    },
  });
}
