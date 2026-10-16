import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateGroupPost, type UpdateGroupPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useUpdateGroupPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateGroupPostRequest) => updateGroupPost(request),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.groupDetail(variables.groupId),
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.groupLists(),
        }),
      ]);
    },
  });
}
