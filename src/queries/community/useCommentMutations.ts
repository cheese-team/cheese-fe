import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  createComment,
  updateComment,
  deleteComment,
  type CommentsParams,
} from '@/api/community.api';
import type { CommunityCommentsResponse } from '@/types/community/comment';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { communityQueryKeys } from './communityQueryKeys';

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

  const updateCommentCount = (delta: number) => {
    type PostWithCommentCount = { id: string; commentCount?: number };
    const updateCount = (post: PostWithCommentCount) =>
      typeof post.commentCount === 'number'
        ? { ...post, commentCount: Math.max(0, post.commentCount + delta) }
        : post;
    queryClient.setQueriesData<PostWithCommentCount>(
      { queryKey: [...detailKey, postId] },
      (current) => (current ? updateCount(current) : current),
    );
    queryClient.setQueriesData<InfiniteData<{ items: PostWithCommentCount[] }>>(
      { queryKey: listKey },
      (current) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                items: page.items.map((post) => (post.id === postId ? updateCount(post) : post)),
              })),
            }
          : current,
    );
  };

  const getUserId = () => {
    if (!user) throw new Error('로그인 사용자 정보가 필요합니다.');
    return user.id;
  };

  const cancel = () => queryClient.cancelQueries({ queryKey, exact: true });

  const create = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) =>
      createComment({ category, postId, userId: getUserId(), ...data }),
    onSuccess: async () => {
      updateCommentCount(1);
      await queryClient.invalidateQueries({ queryKey, exact: true });
    },
  });

  const update = useMutation({
    mutationFn: (data: { commentId: string; content: string }) =>
      updateComment({ ...data, userId: getUserId() }),

    onMutate: cancel,

    onSuccess: (response, variables) => {
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
                    author: response.author,
                    createdAt: response.createdAt,
                  }
                : {
                    ...comment,
                    replies: comment.replies.map((reply) =>
                      reply.id === variables.commentId
                        ? {
                            ...reply,
                            content: response.content,
                            author: response.author,
                            createdAt: response.createdAt,
                          }
                        : reply,
                    ),
                  },
            ),
          })),
        };
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await deleteComment({ commentId, userId: getUserId() });
      if (!response.success) throw new Error('댓글 삭제에 실패했습니다.');
      return response;
    },

    onMutate: async (commentId) => {
      await cancel();
      const current = queryClient.getQueryData<InfiniteData<CommunityCommentsResponse>>(queryKey);
      const comment = current?.pages
        .flatMap((page) => page.items)
        .find((item) => item.id === commentId);
      return { deletedCount: comment ? 1 + comment.replies.length : 1 };
    },

    onSuccess: (_, commentId, context) => {
      updateCommentCount(-(context?.deletedCount ?? 1));
      queryClient.setQueryData<InfiniteData<CommunityCommentsResponse>>(queryKey, (current) => {
        if (!current) return current;
        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            items: page.items
              .filter((comment) => comment.id !== commentId)
              .map((comment) => ({
                ...comment,
                replies: comment.replies.filter((reply) => reply.id !== commentId),
              })),
          })),
        };
      });
    },
  });
  return { create, update, remove };
}
