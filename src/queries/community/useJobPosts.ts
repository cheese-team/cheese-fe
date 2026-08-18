import { useQuery } from '@tanstack/react-query';

import { communityQueryKeys } from './communityQueryKeys';

import { getJobPosts } from '@/api/mocks/community.api';

import type { CommunityPostsListParams } from '@/types/community/query';

export function useJobPosts(params: CommunityPostsListParams) {
  return useQuery({
    queryKey: communityQueryKeys.jobList(params),
    queryFn: () => getJobPosts(params),
  });
}
