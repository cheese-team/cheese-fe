import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateGroupPost, type UpdateGroupPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useUpdateGroupPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateGroupPostRequest) => updateGroupPost(request),

    onSuccess: async (updatedGroupPost, variables) => {
      queryClient.removeQueries({
        queryKey: [...communityQueryKeys.groupDetails(), variables.groupId],
      });

      queryClient.setQueryData(
        communityQueryKeys.groupDetail(variables.groupId, variables.userId),
        updatedGroupPost,
      );

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.groupLists(),
      });
    },
  });
}
