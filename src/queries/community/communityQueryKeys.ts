import type { CommunityPostsListParams, InfoPostsListParams } from '@/types/community/query';

export const communityQueryKeys = {
  all: ['community'] as const,

  jobs: () => [...communityQueryKeys.all, 'jobs'] as const,
  jobLists: () => [...communityQueryKeys.jobs(), 'list'] as const,
  jobList: (params: CommunityPostsListParams) =>
    [...communityQueryKeys.jobLists(), params] as const,

  groups: () => [...communityQueryKeys.all, 'groups'] as const,
  groupLists: () => [...communityQueryKeys.groups(), 'list'] as const,
  groupList: (params: CommunityPostsListParams) =>
    [...communityQueryKeys.groupLists(), params] as const,

  info: () => [...communityQueryKeys.all, 'info'] as const,
  infoLists: () => [...communityQueryKeys.info(), 'list'] as const,
  infoList: (params: InfoPostsListParams) => [...communityQueryKeys.infoLists(), params] as const,
};
