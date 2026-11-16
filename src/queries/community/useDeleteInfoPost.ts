import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteInfoPost, type DeleteInfoPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useDeleteInfoPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteInfoPostRequest) => deleteInfoPost(request),
    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: communityQueryKeys.infoDetail(variables.infoId),
        exact: true,
      });

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.infoLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.dashboardPopularPosts(),
        }),
      ]);
    },
  });
}
