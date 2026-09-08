import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeGroupPost, unlikeGroupPost, type GroupPostsResponse } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { GroupPost, ToggleGroupPostLikeParams } from '@/types/community/community';
import type { InfiniteData } from '@tanstack/react-query';

export function useToggleGroupPostLike() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: ToggleGroupPostLikeParams) => {
      if (!currentUser) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      const request = { groupId: postId, userId: currentUser.id };

      await (isLiked ? unlikeGroupPost(request) : likeGroupPost(request));
      return { isLiked: !isLiked, userId: currentUser.id };
    },

    onSuccess: (response, variables) => {
      void queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.bookmarks(response.userId, 'groups'),
      });

      const updateLike = (post: GroupPost): GroupPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(
          0,
          post.likeCount + (post.isLiked === response.isLiked ? 0 : response.isLiked ? 1 : -1),
        ),
      });

      queryClient.setQueryData<GroupPost>(
        communityQueryKeys.groupDetail(variables.postId, response.userId),
        (current) => (current ? updateLike(current) : current),
      );

      queryClient.setQueriesData<InfiniteData<GroupPostsResponse>>(
        {
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
        },
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
    },
  });
}
