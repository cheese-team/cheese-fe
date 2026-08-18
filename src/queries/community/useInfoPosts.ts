import { useQuery } from '@tanstack/react-query';

import { communityQueryKeys } from './communityQueryKeys';

import { getInfoPosts } from '@/api/mocks/community.api';

import type { InfoPostsListParams } from '@/types/community/query';

export function useInfoPosts(params: InfoPostsListParams) {
  return useQuery({
    queryKey: communityQueryKeys.infoList(params),
    queryFn: () => getInfoPosts(params),
  });
}
