import { apiClient } from '@/api/client';
import type { GroupPost, JobPost } from '@/types/community/community';
import type { ApplicationSort } from '@/app/(app)/(no-memo)/mypage/applications/_constants/applications';

import type {
  PersonalProfile,
  Mypage,
  CompanyProfile,
  ProfileType,
  AccountSettings,
} from '@/types/profile';

export async function getMypage(signal?: AbortSignal) {
  return apiClient<Mypage>('/backend-api/mypage', {
    method: 'GET',
    cache: 'no-store',
    signal,
  });
}

export type UpdateActiveProfileTypeRequest = {
  activeProfileType: ProfileType;
};

export async function updateActiveProfileType({
  activeProfileType,
}: UpdateActiveProfileTypeRequest) {
  return apiClient<Mypage>('/backend-api/mypage/active-profile', {
    method: 'PATCH',
    body: JSON.stringify({ activeProfileType }),
  });
}

export type UpdatePersonalProfileRequest = {
  data: Omit<PersonalProfile, 'id' | 'email'>;
};

export async function updatePersonalProfile({ data }: UpdatePersonalProfileRequest) {
  return apiClient<Mypage>('/backend-api/mypage/profile/personal', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type UpdateCompanyProfileRequest = {
  data: Omit<CompanyProfile, 'id' | 'email'>;
};

export async function updateCompanyProfile({ data }: UpdateCompanyProfileRequest) {
  return apiClient<Mypage>('/backend-api/mypage/profile/company', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type UpdateAccountSettingsRequest = {
  data: Omit<AccountSettings, 'contactEmail'>;
};

export async function updateAccountSettings({ data }: UpdateAccountSettingsRequest) {
  return apiClient<Mypage>('/backend-api/mypage/account-settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type UpdateContactEmailRequest = {
  contactEmail: string;
};

// TODO: 연락용 이메일 변경 플로우 연동
export function updateContactEmail(data: UpdateContactEmailRequest) {
  return apiClient<Mypage>('/backend-api/mypage/contact-email', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type ApplicationsParams = {
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
  { cursor, limit = 20, q, sort = 'latest' }: ApplicationsParams,
  signal?: AbortSignal,
) {
  return apiClient<JobApplicationsResponse>('/backend-api/mypage/applications', {
    method: 'GET',
    cache: 'no-store',
    query: { type: 'jobs', cursor, limit: String(limit), q, sort },
    signal,
  });
}

export type GroupApplicationsResponse = {
  items: GroupPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function getGroupApplications(
  { cursor, limit = 20, q, sort = 'latest' }: ApplicationsParams,
  signal?: AbortSignal,
) {
  return apiClient<GroupApplicationsResponse>('/backend-api/mypage/applications', {
    method: 'GET',
    cache: 'no-store',
    query: { type: 'groups', cursor, limit: String(limit), q, sort },
    signal,
  });
}

export type BookmarkType = 'jobs' | 'groups' | 'info';

export type BookmarkListParams = {
  cursor?: string;
  limit?: number;
};

export type JobBookmarksResponse = {
  items: JobPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function getJobBookmarks({ cursor, limit = 20 }: BookmarkListParams, signal?: AbortSignal) {
  return apiClient<JobBookmarksResponse>('/backend-api/mypage/bookmarks', {
    method: 'GET',
    cache: 'no-store',
    query: { type: 'jobs', cursor, limit: String(limit) },
    signal,
  });
}

export type GroupBookmarksResponse = {
  items: GroupPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function getGroupBookmarks(
  { cursor, limit = 20 }: BookmarkListParams,
  signal?: AbortSignal,
) {
  return apiClient<GroupBookmarksResponse>('/backend-api/mypage/bookmarks', {
    method: 'GET',
    cache: 'no-store',
    query: { type: 'groups', cursor, limit: String(limit) },
    signal,
  });
}
