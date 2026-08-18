import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeGroupPost, unlikeGroupPost } from '@/api/mocks/community.api';
import { communityQueryKeys } from './communityQueryKeys';

import type { TogglePostLikeParams } from '@/types/community/community';

export function useToggleGroupPostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: TogglePostLikeParams) => {
      return isLiked ? unlikeGroupPost(postId) : likeGroupPost(postId);
    },

    onSuccess: async () => {
      // TODO: 실제 API 응답 구조에 따라 invalidate 대신 setQueryData 또는 optimistic update 적용 검토
      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.groupLists(),
      });
    },
  });
}
