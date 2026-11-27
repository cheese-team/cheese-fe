import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import {
  createComment,
  updateComment,
  deleteComment,
  type CommentsParams,
  type CreateCommentRequest,
} from '@/api/community.api';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import { communityQueryKeys } from './communityQueryKeys';

import type { CommunityCommentsResponse } from '@/types/community/comment';

export function useCommentMutations({ category, postId }: CommentsParams) {
  const queryClient = useQueryClient();

  const { data: user } = useCurrentUser();

  const queryKey = communityQueryKeys.comments(category, postId);

  const detailKey =
    category === 'jobs'
      ? communityQueryKeys.jobDetails()
      : category === 'groups'
        ? communityQueryKeys.groupDetails()
        : communityQueryKeys.infoDetails();

  const listKey =
    category === 'jobs'
      ? communityQueryKeys.jobLists()
      : category === 'groups'
        ? communityQueryKeys.groupLists()
        : communityQueryKeys.infoLists();

  const invalidateComments = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey, exact: true }),
      queryClient.invalidateQueries({ queryKey: [...detailKey, postId], exact: true }),
      queryClient.invalidateQueries({ queryKey: listKey }),
      category === 'info' &&
        queryClient.invalidateQueries({ queryKey: communityQueryKeys.dashboardPopularPosts() }),
    ]);
  };

  const cancel = () => queryClient.cancelQueries({ queryKey, exact: true });

  const create = useMutation({
    mutationFn: (data: Pick<CreateCommentRequest, 'content' | 'parentId'>) =>
      createComment({ category, postId, ...data }),
    onSuccess: invalidateComments,
  });

  const update = useMutation({
    mutationFn: (data: { commentId: string; content: string }) => {
      if (!user) {
        throw new Error('로그인 사용자 정보가 필요합니다.');
      }

      return updateComment({
        ...data,
        authorProfileType: user.account.profileType,
      });
    },

    onMutate: cancel,

    onSuccess: async (response, variables) => {
      queryClient.setQueryData<InfiniteData<CommunityCommentsResponse>>(queryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items.map((comment) =>
              comment.id === variables.commentId
                ? {
                    ...comment,
                    content: response.content,
                    createdAt: response.createdAt,
                  }
                : {
                    ...comment,
                    replies: comment.replies.map((reply) =>
                      reply.id === variables.commentId
                        ? {
                            ...reply,
                            content: response.content,
                            createdAt: response.createdAt,
                          }
                        : reply,
                    ),
                  },
            ),
          })),
        };
      });
      await invalidateComments();
    },
  });

  const remove = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await deleteComment({ commentId });

      if (!response.success) throw new Error('댓글 삭제에 실패했습니다.');

      return response;
    },

    onMutate: cancel,
    onSuccess: invalidateComments,
  });

  return { create, update, remove };
}
