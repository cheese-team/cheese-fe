import { apiClient } from '@/api/client';
import { mapGroupPost, mapInfoPost } from '@/api/community.api';

import type { GroupPostResponse, InfoPostResponse } from '@/api/community.api';
import type { GroupPost, JobPost, InfoPost } from '@/types/community/community';
import type { ApplicationSort } from '@/app/(app)/(no-memo)/mypage/applications/_constants/applications';

import type {
  PersonalProfile,
  Mypage,
  CompanyProfile,
  ProfileType,
  AccountSettings,
} from '@/types/profile';

export async function getMypage(userId: string, signal?: AbortSignal) {
  return apiClient<Mypage>('/backend-api/mypage', {
    method: 'GET',
    cache: 'no-store',
    query: { userId },
    signal,
  });
}

export type UpdateActiveProfileTypeRequest = {
  userId: string;
  activeProfileType: ProfileType;
};

export async function updateActiveProfileType({
  userId,
  activeProfileType,
}: UpdateActiveProfileTypeRequest) {
  return apiClient<Mypage>('/backend-api/mypage/active-profile', {
    method: 'PATCH',
    body: JSON.stringify({ userId, activeProfileType }),
  });
}

export type UpdatePersonalProfileRequest = {
  userId: string;
  data: Omit<PersonalProfile, 'id'>;
};

export async function updatePersonalProfile({ userId, data }: UpdatePersonalProfileRequest) {
  return apiClient<Mypage>('/backend-api/mypage/profile/personal', {
    method: 'PATCH',
    body: JSON.stringify({ userId, ...data }),
  });
}

export type UpdateCompanyProfileRequest = {
  userId: string;
  data: Omit<CompanyProfile, 'id'>;
};

export async function updateCompanyProfile({ userId, data }: UpdateCompanyProfileRequest) {
  return apiClient<Mypage>('/backend-api/mypage/profile/company', {
    method: 'PATCH',
    body: JSON.stringify({ userId, ...data }),
  });
}

export type UpdateAccountSettingsRequest = {
  userId: string;
  data: AccountSettings;
};

export async function updateAccountSettings({ userId, data }: UpdateAccountSettingsRequest) {
  return apiClient<Mypage>('/backend-api/mypage/account-settings', {
    method: 'PATCH',
    body: JSON.stringify({
      userId,
      ...data,
    }),
  });
}

export type ApplicationsParams = {
  userId: string;
  cursor?: string;
  limit?: number;
  q?: string;
  sort?: ApplicationSort;
};

export type JobApplicationsResponse = {
  items: JobPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function getJobApplications(
  { userId, cursor, limit = 20, q, sort = 'latest' }: ApplicationsParams,
  signal?: AbortSignal,
) {
  return apiClient<JobApplicationsResponse>('/backend-api/mypage/applications', {
    method: 'GET',
    cache: 'no-store',
    query: { userId, type: 'jobs', cursor, limit: String(limit), q, sort },
    signal,
  });
}

export type GroupApplicationsResponse = {
  items: GroupPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function getGroupApplications(
  { userId, cursor, limit = 20, q, sort = 'latest' }: ApplicationsParams,
  signal?: AbortSignal,
): Promise<GroupApplicationsResponse> {
  const response = await apiClient<
    Omit<GroupApplicationsResponse, 'items'> & {
      items: GroupPostResponse[];
    }
  >('/backend-api/mypage/applications', {
    method: 'GET',
    cache: 'no-store',
    query: { userId, type: 'groups', cursor, limit: String(limit), q, sort },
    signal,
  });

  return {
    ...response,
    items: response.items.map(mapGroupPost),
  };
}

export type BookmarkType = 'jobs' | 'groups' | 'info';

export type BookmarkListParams = {
  userId: string;
  cursor?: string;
  limit?: number;
};

export type JobBookmarksResponse = {
  items: JobPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function getJobBookmarks(
  { userId, cursor, limit = 20 }: BookmarkListParams,
  signal?: AbortSignal,
) {
  return apiClient<JobBookmarksResponse>('/backend-api/mypage/bookmarks', {
    method: 'GET',
    cache: 'no-store',
    query: { userId, type: 'jobs', cursor, limit: String(limit) },
    signal,
  });
}

export type GroupBookmarksResponse = {
  items: GroupPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function getGroupBookmarks(
  { userId, cursor, limit = 20 }: BookmarkListParams,
  signal?: AbortSignal,
): Promise<GroupBookmarksResponse> {
  const response = await apiClient<
    Omit<GroupBookmarksResponse, 'items'> & {
      items: GroupPostResponse[];
    }
  >('/backend-api/mypage/bookmarks', {
    method: 'GET',
    cache: 'no-store',
    query: { userId, type: 'groups', cursor, limit: String(limit) },
    signal,
  });

  return {
    ...response,
    items: response.items.map(mapGroupPost),
  };
}

export type InfoBookmarksResponse = {
  items: (InfoPost & { likedAt?: string })[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function getInfoBookmarks(
  { userId, cursor, limit = 20 }: BookmarkListParams,
  signal?: AbortSignal,
): Promise<InfoBookmarksResponse> {
  const response = await apiClient<
    Omit<InfoBookmarksResponse, 'items'> & {
      items: (InfoPostResponse & { likedAt?: string })[];
    }
  >('/backend-api/mypage/bookmarks', {
    method: 'GET',
    cache: 'no-store',
    query: { userId, type: 'info', cursor, limit: String(limit) },
    signal,
  });

  return {
    ...response,
    items: response.items.map(({ likedAt, ...post }) => ({
      ...mapInfoPost(post),
      likedAt,
    })),
  };
}
