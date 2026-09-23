import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeInfoPost, unlikeInfoPost, type InfoPostsResponse } from '@/api/community.api';
import { communityQueryKeys } from './communityQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import type { InfiniteData } from '@tanstack/react-query';
import type { InfoBookmarksResponse } from '@/api/mypage.api';
import type { InfoPost, ToggleInfoPostLikeParams } from '@/types/community/community';

export function useToggleInfoPostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ infoId, isLiked }: ToggleInfoPostLikeParams) => {
      const request = { infoId };

      return isLiked ? unlikeInfoPost(request) : likeInfoPost(request);
    },

    onMutate: async (variables) => {
      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.infoDetail(variables.infoId),
          exact: true,
        }),
        queryClient.cancelQueries({ queryKey: communityQueryKeys.infoLists() }),
        queryClient.cancelQueries({
          queryKey: mypageQueryKeys.bookmarks('info'),
        }),
      ]);
    },

    onSuccess: async (response, variables) => {
      const updateLike = (post: InfoPost): InfoPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(
          0,
          post.likeCount + (post.isLiked === response.isLiked ? 0 : response.isLiked ? 1 : -1),
        ),
      });

      queryClient.setQueryData<InfoPost>(
        communityQueryKeys.infoDetail(variables.infoId),
        (current) => (current ? updateLike(current) : current),
      );

      queryClient.setQueriesData<InfiniteData<InfoPostsResponse>>(
        { queryKey: communityQueryKeys.infoLists() },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === variables.infoId ? updateLike(post) : post,
              ),
            })),
          };
        },
      );
      queryClient.setQueriesData<InfiniteData<InfoBookmarksResponse>>(
        { queryKey: mypageQueryKeys.bookmarks('info') },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            pages: current.pages.map((page) => ({
              ...page,
              items: page.items.map((post) =>
                post.id === variables.infoId ? { ...post, ...updateLike(post) } : post,
              ),
            })),
          };
        },
      );
      if (response.isLiked) {
        await queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.bookmarks('info'),
        });
      }
    },
  });
}
