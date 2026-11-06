import { useMutation, useQueryClient } from '@tanstack/react-query';

import { signupWithOAuth } from '@/api/auth.api';

import { authQueryKeys } from './authQueryKeys';

export function useOAuthSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signupWithOAuth,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: authQueryKeys.me(),
      });
    },
  });
}
