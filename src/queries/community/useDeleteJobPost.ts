import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteJobPost, type DeleteJobPostRequest } from '@/api/community.api';

import { communityQueryKeys } from './communityQueryKeys';

export function useDeleteJobPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: DeleteJobPostRequest) => deleteJobPost(request),

    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: communityQueryKeys.jobDetail(variables.jobId),
        exact: true,
      });

      await queryClient.invalidateQueries({
        queryKey: communityQueryKeys.jobLists(),
      });
    },
  });
}
