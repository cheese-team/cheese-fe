import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeGroupPost, unlikeGroupPost, type GroupPostsResponse } from '@/api/community.api';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { GroupPost, ToggleGroupPostLikeParams } from '@/types/community/community';
import type { InfiniteData } from '@tanstack/react-query';
import type { GroupBookmarksResponse } from '@/api/mypage.api';

export function useToggleGroupPostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: ToggleGroupPostLikeParams) => {
      const request = { groupId: postId };

      return isLiked ? unlikeGroupPost(request) : likeGroupPost(request);
    },

    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.groupDetail(variables.postId),
          exact: true,
        }),
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.groupLists(),
        }),
        queryClient.cancelQueries({
          queryKey: mypageQueryKeys.bookmarks('groups'),
        }),
      ]);
    },

    onSuccess: async (response, variables) => {
      const updateLike = (post: GroupPost): GroupPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(
          0,
          post.likeCount + (post.isLiked === response.isLiked ? 0 : response.isLiked ? 1 : -1),
        ),
      });

      queryClient.setQueryData<GroupPost>(
        communityQueryKeys.groupDetail(variables.postId),
        (current) => (current ? updateLike(current) : current),
      );

      queryClient.setQueriesData<InfiniteData<GroupPostsResponse>>(
        { queryKey: communityQueryKeys.groupLists() },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === variables.postId ? updateLike(post) : post,
              ),
            })),
          };
        },
      );
      queryClient.setQueriesData<InfiniteData<GroupBookmarksResponse>>(
        { queryKey: mypageQueryKeys.bookmarks('groups') },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === variables.postId ? updateLike(post) : post,
              ),
            })),
          };
        },
      );

      await queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.groupApplications(),
      });
    },
  });
}
