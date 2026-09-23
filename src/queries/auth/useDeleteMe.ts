import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteMe } from '@/api/auth.api';

export function useDeleteMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
