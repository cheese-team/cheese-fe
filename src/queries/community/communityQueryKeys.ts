import type { CommunityCommentCategory } from '@/types/community/comment';
import type {
  GroupPostsListParams,
  InfoPostsListParams,
  JobPostsListParams,
} from '@/types/community/query';

export const communityQueryKeys = {
  all: ['community'] as const,
  comments: (category: CommunityCommentCategory, postId: string) =>
    [...communityQueryKeys.all, category, postId, 'comments'] as const,

  jobs: () => [...communityQueryKeys.all, 'jobs'] as const,
  jobLists: () => [...communityQueryKeys.jobs(), 'list'] as const,
  jobList: (params: JobPostsListParams) => [...communityQueryKeys.jobLists(), params] as const,
  jobDetails: () => [...communityQueryKeys.jobs(), 'detail'] as const,
  jobDetail: (jobId: string) => [...communityQueryKeys.jobDetails(), jobId] as const,

  groups: () => [...communityQueryKeys.all, 'groups'] as const,
  groupLists: () => [...communityQueryKeys.groups(), 'list'] as const,
  groupList: (params: GroupPostsListParams) =>
    [...communityQueryKeys.groupLists(), params] as const,
  groupDetails: () => [...communityQueryKeys.groups(), 'detail'] as const,
  groupDetail: (groupId: string) => [...communityQueryKeys.groupDetails(), groupId] as const,

  info: () => [...communityQueryKeys.all, 'info'] as const,
  infoLists: () => [...communityQueryKeys.info(), 'list'] as const,
  infoList: (params: InfoPostsListParams) => [...communityQueryKeys.infoLists(), params] as const,
  infoDetails: () => [...communityQueryKeys.info(), 'detail'] as const,
  infoDetail: (infoId: string) => [...communityQueryKeys.infoDetails(), infoId] as const,
};
