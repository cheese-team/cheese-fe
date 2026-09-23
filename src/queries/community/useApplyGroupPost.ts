import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyGroupPost, type GroupPostsResponse } from '@/api/community.api';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { GroupPost } from '@/types/community/community';
import type { InfiniteData } from '@tanstack/react-query';

export function useApplyGroupPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => applyGroupPost({ groupId }),

    onSuccess: async (response, groupId) => {
      const queryKey = communityQueryKeys.groupDetail(groupId);
      const listQueryKey = communityQueryKeys.groupLists();

      await Promise.all([
        queryClient.cancelQueries({ queryKey, exact: true }),
        queryClient.cancelQueries({ queryKey: listQueryKey }),
      ]);

      const updateApplied = (post: GroupPost): GroupPost => ({
        ...post,
        isApplied: response.isApplied,
        applicantCount: post.applicantCount + (!post.isApplied && response.isApplied ? 1 : 0),
      });

      queryClient.setQueryData<GroupPost>(queryKey, (current) =>
        current ? updateApplied(current) : current,
      );

      queryClient.setQueriesData<InfiniteData<GroupPostsResponse>>(
        { queryKey: listQueryKey },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((post) => (post.id === groupId ? updateApplied(post) : post)),
            })),
          };
        },
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey, exact: true }),
        queryClient.invalidateQueries({ queryKey: listQueryKey }),
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.bookmarks('groups'),
        }),
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.groupApplications(),
        }),
      ]);
    },
  });
}
