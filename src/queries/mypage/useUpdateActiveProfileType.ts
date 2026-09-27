import { updateActiveProfileType, type UpdateActiveProfileTypeRequest } from '@/api/mypage.api';
import { authQueryKeys } from '@/queries/auth/authQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateActiveProfileType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateActiveProfileTypeRequest) => {
      return updateActiveProfileType(request);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: mypageQueryKeys.user(),
        }),
        queryClient.invalidateQueries({
          queryKey: authQueryKeys.me(),
        }),
      ]);
    },
  });
}
