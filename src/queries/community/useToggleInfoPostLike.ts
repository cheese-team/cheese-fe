import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeInfoPost, unlikeInfoPost } from '@/api/mocks/community.api';
import { communityQueryKeys } from './communityQueryKeys';

import type { TogglePostLikeParams } from '@/types/community/community';

export function useToggleInfoPostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: TogglePostLikeParams) => {
      return isLiked ? unlikeInfoPost(postId) : likeInfoPost(postId);
    },

    onSuccess: async () => {
      // TODO: 실제 API 응답 구조에 따라 invalidate 대신 setQueryData 또는 optimistic update 적용 검토
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.infoLists(),
      });
    },
  });
}
