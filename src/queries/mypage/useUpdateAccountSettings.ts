import { updateAccountSettings } from '@/api/mypage.api';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateAccountSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccountSettings,

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: mypageQueryKeys.user(), // TODO: JWT 인증 방식 전환 시 확인
      });
    },
  });
}
