import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteInfoPost, type DeleteInfoPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useDeleteInfoPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteInfoPostRequest) => deleteInfoPost(request),
    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: communityQueryKeys.infoDetail(variables.infoId, variables.userId),
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.infoLists(),
      });
    },
  });
}
