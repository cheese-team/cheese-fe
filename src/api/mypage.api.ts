import { apiClient } from '@/api/client';
import type { GroupPost, JobPost, InfoPost } from '@/types/community/community';
import type { ApplicationSort } from '@/app/(app)/(no-memo)/mypage/applications/_constants/applications';

import type { PersonalProfile, Mypage, CompanyProfile, AccountSettings } from '@/types/profile';

export async function getMypage(signal?: AbortSignal) {
  return apiClient<Mypage>('/backend-api/mypage', {
    method: 'GET',
    cache: 'no-store',
    signal,
  });
}

export type UpdatePersonalProfileRequest = {
  data: Pick<
    PersonalProfile,
    | 'nickname'
    | 'profileImageUrl'
    | 'interestedJob'
    | 'coverLetter'
    | 'additionalDocument'
    | 'skills'
    | 'interests'
    | 'contactMethod'
    | 'contactUrl'
  >;
};

export async function updatePersonalProfile({ data }: UpdatePersonalProfileRequest) {
  return apiClient<Mypage>('/backend-api/mypage/profile/personal', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type UpdateCompanyProfileRequest = {
  data: Pick<
    CompanyProfile,
    | 'companyName'
    | 'profileImageUrl'
    | 'representativeName'
    | 'companyType'
    | 'resumeTemplate'
    | 'industryType'
    | 'employeeCount'
    | 'foundedAt'
    | 'contactMethod'
    | 'contactUrl'
  >;
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

export async function getGroupApplications(
  { cursor, limit = 20, q, sort = 'latest' }: ApplicationsParams,
  signal?: AbortSignal,
): Promise<GroupApplicationsResponse> {
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

export async function getGroupBookmarks(
  { cursor, limit = 20 }: BookmarkListParams,
  signal?: AbortSignal,
): Promise<GroupBookmarksResponse> {
  return apiClient<GroupBookmarksResponse>('/backend-api/mypage/bookmarks', {
    method: 'GET',
    cache: 'no-store',
    query: { type: 'groups', cursor, limit: String(limit) },
    signal,
  });
}

export type InfoBookmarksResponse = {
  items: (InfoPost & { likedAt?: string })[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function getInfoBookmarks(
  { cursor, limit = 20 }: BookmarkListParams,
  signal?: AbortSignal,
): Promise<InfoBookmarksResponse> {
  return apiClient<InfoBookmarksResponse>('/backend-api/mypage/bookmarks', {
    method: 'GET',
    cache: 'no-store',
    query: { type: 'info', cursor, limit: String(limit) },
    signal,
  });
}
