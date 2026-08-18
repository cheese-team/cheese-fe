import { useQuery } from '@tanstack/react-query';

import { communityQueryKeys } from './communityQueryKeys';

import { getGroupPosts } from '@/api/mocks/community.api';

import type { CommunityPostsListParams } from '@/types/community/query';

export function useGroupPosts(params: CommunityPostsListParams) {
  return useQuery({
    queryKey: communityQueryKeys.groupList(params),
    queryFn: () => getGroupPosts(params),
  });
}
