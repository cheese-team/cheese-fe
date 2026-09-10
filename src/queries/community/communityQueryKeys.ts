import type {
  GroupPostsListParams,
  InfoPostsListParams,
  JobPostsListParams,
} from '@/types/community/query';

export const communityQueryKeys = {
  all: ['community'] as const,

  jobs: () => [...communityQueryKeys.all, 'jobs'] as const,
  jobLists: () => [...communityQueryKeys.jobs(), 'list'] as const,
  jobList: (params: JobPostsListParams) => [...communityQueryKeys.jobLists(), params] as const,
  jobDetails: () => [...communityQueryKeys.jobs(), 'detail'] as const,
  jobDetail: (jobId: string, userId?: string) =>
    [...communityQueryKeys.jobDetails(), jobId, { userId }] as const,

  groups: () => [...communityQueryKeys.all, 'groups'] as const,
  groupLists: () => [...communityQueryKeys.groups(), 'list'] as const,
  groupList: (params: GroupPostsListParams) =>
    [...communityQueryKeys.groupLists(), params] as const,

  groupDetails: () => [...communityQueryKeys.groups(), 'detail'] as const,
  groupDetail: (groupId: string, userId?: string) =>
    [...communityQueryKeys.groupDetails(), groupId, { userId }] as const,

  info: () => [...communityQueryKeys.all, 'info'] as const,
  infoLists: () => [...communityQueryKeys.info(), 'list'] as const,
  infoList: (params: InfoPostsListParams) => [...communityQueryKeys.infoLists(), params] as const,
};
