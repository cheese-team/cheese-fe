import { useQuery } from '@tanstack/react-query';

import { getDashboardCommunityPosts } from '@/api/dashboardCommunity.api';
import { selectDashboardPopularPosts } from '@/app/(app)/dashboard/_lib/popularPosts';

import { communityQueryKeys } from './communityQueryKeys';

export function useDashboardPopularPosts() {
  return useQuery({
    queryKey: communityQueryKeys.dashboardPopularPosts(),
    queryFn: ({ signal }) => getDashboardCommunityPosts({ signal }),
    select: selectDashboardPopularPosts,
    staleTime: 5 * 60 * 1000,
  });
}
