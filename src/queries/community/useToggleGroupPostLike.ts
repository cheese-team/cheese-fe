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
    mutationFn: async ({ postId, isLiked }: ToggleGroupPostLikeParams) => {
      if (!currentUser) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      const request = { groupId: postId, userId: currentUser?.account.userId }; // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,

      await (isLiked ? unlikeGroupPost(request) : likeGroupPost(request));

      return { isLiked: !isLiked, userId: currentUser?.account.userId }; // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,
    },

    onMutate: async (variables) => {
      if (!currentUser) return;

      const listFilters = getGroupListFilters(currentUser.account.userId); // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,

      await Promise.all([
        queryClient.cancelQueries({
          queryKey: communityQueryKeys.groupDetail(variables.postId, currentUser.account.userId), // TODO: 타입 에러를 위한 임시 코드로, JWT 인증 방식 전환 시 id값 다시 확인,
          exact: true,
        }),
        queryClient.cancelQueries(listFilters),
        queryClient.cancelQueries({
          queryKey: mypageQueryKeys.bookmarks('groups'), // TODO: JWT 인증 방식 전환 시 확인
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
        communityQueryKeys.groupDetail(variables.postId, response.userId),
        (current) => (current ? updateLike(current) : current),
      );

      queryClient.setQueriesData<InfiniteData<GroupPostsResponse>>(listFilters, (current) => {
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
      });
      queryClient.setQueriesData<InfiniteData<GroupBookmarksResponse>>(
        { queryKey: mypageQueryKeys.bookmarks('groups') }, // TODO: JWT 인증 방식 전환 시 확인
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
        queryKey: mypageQueryKeys.groupApplications(), // TODO: JWT 인증 방식 전환 시 확인
      });
    },
  });
}
