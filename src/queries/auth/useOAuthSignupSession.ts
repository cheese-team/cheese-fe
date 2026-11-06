import { useQuery } from '@tanstack/react-query';

import { getOAuthSignupSession } from '@/api/auth.api';

import { authQueryKeys } from './authQueryKeys';

export function useOAuthSignupSession() {
  return useQuery({
    queryKey: authQueryKeys.oauthSignupSession(),
    queryFn: getOAuthSignupSession,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
