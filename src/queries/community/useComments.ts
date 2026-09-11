import { useInfiniteQuery } from '@tanstack/react-query';
import { getComments, type CommentsParams } from '@/api/community.api';
import { communityQueryKeys } from './communityQueryKeys';

export function useComments({ category, postId }: CommentsParams) {
  return useInfiniteQuery({
    queryKey: communityQueryKeys.comments(category, postId),
    queryFn: ({ pageParam, signal }) =>
      getComments({ category, postId, cursor: pageParam, limit: '20', signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: Boolean(postId),
  });
}
