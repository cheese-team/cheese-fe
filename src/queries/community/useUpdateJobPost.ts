import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateJobPost, type UpdateJobPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useUpdateJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateJobPostRequest) => updateJobPost(request),

    onSuccess: async (updatedJobPost, variables) => {
      queryClient.setQueryData(communityQueryKeys.jobDetail(variables.jobId), updatedJobPost);

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.jobLists(),
      });
    },
  });
}
