import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePersonalProfile, type UpdatePersonalProfileRequest } from '@/api/mypage.api';
import { authQueryKeys } from '@/queries/auth/authQueryKeys';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

export function useUpdatePersonalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdatePersonalProfileRequest) => {
      return updatePersonalProfile(request);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: mypageQueryKeys.user() }),
        queryClient.invalidateQueries({
          queryKey: authQueryKeys.me(),
        }),
      ]);
    },
  });
}
