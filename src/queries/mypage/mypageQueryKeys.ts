import type { BookmarkListParams, BookmarkType, JobApplicationsParams } from '@/api/mypage.api';

export const mypageQueryKeys = {
  all: ['mypage'] as const,

  user: (userId: string | undefined) => [...mypageQueryKeys.all, userId] as const,
  jobApplications: (userId: string | undefined) =>
    [...mypageQueryKeys.user(userId), 'applications', 'jobs'] as const,
  groupApplications: (userId: string | undefined) =>
    [...mypageQueryKeys.user(userId), 'applications', 'groups'] as const,
  jobApplicationList: (
    userId: string | undefined,
    params: Omit<JobApplicationsParams, 'userId' | 'cursor'>,
  ) => [...mypageQueryKeys.jobApplications(userId), params] as const,
  bookmarks: (userId: string | undefined, type: BookmarkType) =>
    [...mypageQueryKeys.user(userId), 'bookmarks', type] as const,
  bookmarkList: (userId: string | undefined, type: BookmarkType, params: BookmarkListParams) =>
    [...mypageQueryKeys.bookmarks(userId, type), params] as const,
};
