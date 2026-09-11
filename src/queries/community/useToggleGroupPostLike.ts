import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeGroupPost, unlikeGroupPost, type GroupPostsResponse } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { GroupPost, ToggleGroupPostLikeParams } from '@/types/community/community';
import type { InfiniteData, QueryFilters } from '@tanstack/react-query';
import type { GroupBookmarksResponse } from '@/api/mypage.api';

const getGroupListFilters = (userId: string): QueryFilters => ({
  queryKey: communityQueryKeys.groupLists(),
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

export function useToggleGroupPostLike() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ groupId, isLiked }: ToggleGroupPostLikeParams) => {
      if (!currentUser) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      const request = { groupId, userId: currentUser.id };

      await (isLiked ? unlikeGroupPost(request) : likeGroupPost(request));

      return { isLiked: !isLiked, userId: currentUser.id };
    },

    onMutate: async (variables) => {
      if (!currentUser) return;

      const listFilters = getGroupListFilters(currentUser.id);

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.groupDetail(variables.groupId, currentUser.id),
          exact: true,
        }),
        queryClient.cancelQueries(listFilters),
        queryClient.cancelQueries({
          queryKey: mypageQueryKeys.bookmarks(currentUser.id, 'groups'),
        }),
      ]);
    },

    onSuccess: async (response, variables) => {
      const listFilters = getGroupListFilters(response.userId);

      const updateLike = (post: GroupPost): GroupPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(
          0,
          post.likeCount + (post.isLiked === response.isLiked ? 0 : response.isLiked ? 1 : -1),
        ),
      });

      queryClient.setQueryData<GroupPost>(
        communityQueryKeys.groupDetail(variables.groupId, response.userId),
        (current) => (current ? updateLike(current) : current),
      );

      queryClient.setQueriesData<InfiniteData<GroupPostsResponse>>(listFilters, (current) => {
        if (!current) return current;

        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((post) =>
              post.id === variables.groupId ? updateLike(post) : post,
            ),
          })),
        };
      });
      queryClient.setQueriesData<InfiniteData<GroupBookmarksResponse>>(
        { queryKey: mypageQueryKeys.bookmarks(response.userId, 'groups') },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === variables.groupId ? updateLike(post) : post,
              ),
            })),
          };
        },
      );

      await queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.groupApplications(response.userId),
      });
    },
  });
}
