import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeInfoPost, unlikeInfoPost, type InfoPostsResponse } from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { communityQueryKeys } from './communityQueryKeys';

import type { InfoPost, ToggleInfoPostLikeParams } from '@/types/community/community';
import type { InfiniteData, QueryFilters } from '@tanstack/react-query';

const getInfoListFilters = (userId: string): QueryFilters => ({
  queryKey: communityQueryKeys.infoLists(),
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

export function useToggleInfoPostLike() {
  const queryClient = useQueryClient();
  const { data: currentUser } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ infoId, isLiked }: ToggleInfoPostLikeParams) => {
      if (!currentUser) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      const request = { infoId, userId: currentUser.id };

      const response = await (isLiked ? unlikeInfoPost(request) : likeInfoPost(request));

      return { isLiked: response.isLiked, userId: currentUser.id };
    },

    onMutate: async (variables) => {
      if (!currentUser) return;

      const listFilters = getInfoListFilters(currentUser.id);

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.infoDetail(variables.infoId, currentUser.id),
          exact: true,
        }),
        queryClient.cancelQueries(listFilters),
      ]);
    },

    onSuccess: (response, variables) => {
      const listFilters = getInfoListFilters(response.userId);

      const updateLike = (post: InfoPost): InfoPost => ({
        ...post,
        isLiked: response.isLiked,
        likeCount: Math.max(
          0,
          post.likeCount + (post.isLiked === response.isLiked ? 0 : response.isLiked ? 1 : -1),
        ),
      });

      queryClient.setQueryData<InfoPost>(
        communityQueryKeys.infoDetail(variables.infoId, response.userId),
        (current) => (current ? updateLike(current) : current),
      );

      queryClient.setQueriesData<InfiniteData<InfoPostsResponse>>(listFilters, (current) => {
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
      });
    },
  });
}
