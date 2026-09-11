import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateInfoPost, type UpdateInfoPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useUpdateInfoPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateInfoPostRequest) => updateInfoPost(request),

    onSuccess: async (updatedInfoPost, variables) => {
      queryClient.removeQueries({
        queryKey: [...communityQueryKeys.infoDetails(), variables.infoId],
      });

      queryClient.setQueryData(
        communityQueryKeys.infoDetail(variables.infoId, variables.userId),
        updatedInfoPost,
      );

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.infoLists(),
      });
    },
  });
}
