import { updateCompanyProfile, type UpdateCompanyProfileRequest } from '@/api/mypage.api';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateCompanyProfileRequest) => {
      return updateCompanyProfile(request);
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.user(), // TODO: JWT 인증 방식 전환 시 확인
      });
    },
  });
}
