import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createGroupPost, type CreateGroupPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useCreateGroupPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateGroupPostRequest) => createGroupPost(request),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.groupLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.dashboardPopularPosts(),
        }),
      ]);
    },
  });
}
