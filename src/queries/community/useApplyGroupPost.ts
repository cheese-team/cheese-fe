import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyGroupPost, type GroupPostsResponse } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { GroupPost } from '@/types/community/community';
import type { InfiniteData, QueryFilters } from '@tanstack/react-query';

export function useApplyGroupPost() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: async (groupId: string) => {
      if (!currentUser) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      const userId = currentUser.id;
      const response = await applyGroupPost({ groupId, userId });

      return { ...response, userId };
    },
    onSuccess: async (response, groupId) => {
      const queryKey = communityQueryKeys.groupDetail(groupId, response.userId);
      const listFilters: QueryFilters = {
        queryKey: communityQueryKeys.groupLists(),
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

      const updateApplied = (post: GroupPost): GroupPost => ({
        ...post,
        isApplied: response.isApplied,
        applicantCount: post.applicantCount + (!post.isApplied && response.isApplied ? 1 : 0),
      });

      queryClient.setQueryData<GroupPost>(queryKey, (current) =>
        current ? updateApplied(current) : current,
      );

      queryClient.setQueriesData<InfiniteData<GroupPostsResponse>>(listFilters, (current) => {
        if (!current) return current;

        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((post) => (post.id === groupId ? updateApplied(post) : post)),
          })),
        };
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey, exact: true }),
        queryClient.invalidateQueries(listFilters),
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.groupApplications(response.userId),
        }),
      ]);
    },
  });
}
