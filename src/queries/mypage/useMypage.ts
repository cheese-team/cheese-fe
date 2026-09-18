import { useQuery } from '@tanstack/react-query';

import { getMypage } from '@/api/mypage.api';
import { mypageQueryKeys } from '@/queries/mypage/mypageQueryKeys';

export function useMypage() {
  return useQuery({
    queryKey: mypageQueryKeys.user(),
    queryFn: ({ signal }) => {
      return getMypage(signal);
    },
  });
}
