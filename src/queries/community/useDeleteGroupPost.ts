import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteGroupPost, type DeleteGroupPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useDeleteGroupPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteGroupPostRequest) => deleteGroupPost(request),
    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: communityQueryKeys.groupDetail(variables.groupId, variables.userId),
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.groupLists(),
      });
    },
  });
}
