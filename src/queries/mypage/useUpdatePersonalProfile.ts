import { updatePersonalProfile, type UpdatePersonalProfileRequest } from '@/api/mypage.api';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdatePersonalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdatePersonalProfileRequest) => {
      return updatePersonalProfile(request);
    },

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.user(), // TODO: JWT 인증 방식 전환 시 확인
      });
    },
  });
}
