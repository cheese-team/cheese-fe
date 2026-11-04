import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateContactEmail } from '@/api/mypage.api';
import { mypageQueryKeys } from './mypageQueryKeys';

export function useUpdateContactEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateContactEmail,
    onSuccess: async (mypage) => {
      const queryKey = mypageQueryKeys.user();

      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueryData(queryKey, mypage);
      await queryClient.invalidateQueries({ queryKey, refetchType: 'none' });
    },
  });
}
