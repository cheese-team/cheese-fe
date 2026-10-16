import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateInfoPost, type UpdateInfoPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useUpdateInfoPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateInfoPostRequest) => updateInfoPost(request),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.infoDetail(variables.infoId),
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.infoLists(),
        }),
      ]);
    },
  });
}
