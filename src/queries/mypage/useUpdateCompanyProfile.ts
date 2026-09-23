import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateCompanyProfile, type UpdateCompanyProfileRequest } from '@/api/mypage.api';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';
import { authQueryKeys } from '@/queries/auth/authQueryKeys';

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateCompanyProfileRequest) => {
      return updateCompanyProfile(request);
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
