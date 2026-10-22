import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateJobPost, type UpdateJobPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useUpdateJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateJobPostRequest) => updateJobPost(request),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.jobDetail(variables.jobId),
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: communityQueryKeys.jobLists(),
        }),
      ]);
    },
  });
}
