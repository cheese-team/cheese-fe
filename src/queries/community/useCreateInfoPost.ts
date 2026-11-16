import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createInfoPost, type CreateInfoPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useCreateInfoPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateInfoPostRequest) => createInfoPost(request),
    onSuccess: async () => {
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
