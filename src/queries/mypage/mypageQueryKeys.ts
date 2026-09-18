import type { BookmarkListParams, BookmarkType, ApplicationsParams } from '@/api/mypage.api';

export const mypageQueryKeys = {
  all: ['mypage'] as const,

  user: () => [...mypageQueryKeys.all, 'user'] as const,

  jobApplications: () => [...mypageQueryKeys.user(), 'applications', 'jobs'] as const,

  jobApplicationList: (params: Omit<ApplicationsParams, 'cursor'>) =>
    [...mypageQueryKeys.jobApplications(), params] as const,

  groupApplications: () => [...mypageQueryKeys.user(), 'applications', 'groups'] as const,

  groupApplicationList: (params: Omit<ApplicationsParams, 'cursor'>) =>
    [...mypageQueryKeys.groupApplications(), params] as const,

  bookmarks: (type: BookmarkType) => [...mypageQueryKeys.user(), 'bookmarks', type] as const,

  bookmarkList: (type: BookmarkType, params: Omit<BookmarkListParams, 'cursor'>) =>
    [...mypageQueryKeys.bookmarks(type), params] as const,
};
