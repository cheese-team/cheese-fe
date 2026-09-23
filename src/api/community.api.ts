import { apiClient } from '@/api/client';

import type { ApplyInfo, GroupPost, JobPost, UserSummary } from '@/types/community/community';
import type { GroupPostsListParams, JobPostsListParams } from '@/types/community/query';

/* ================================
     Job
   ================================ */

export type JobPostsResponse = {
  nextCursor: string | null;
  hasMore: boolean;
  items: JobPost[];
};

export function getJobPosts({
  sort,
  keyword,
  cursor,
  limit,
  signal,
}: JobPostsListParams & { signal?: AbortSignal }) {
  return apiClient<JobPostsResponse>('/backend-api/community/jobs', {
    method: 'GET',
    cache: 'no-store',
    query: {
      sort,
      keyword,
      cursor,
      limit: limit?.toString(),
    },
    signal,
  });
}

type GetJobPostParams = {
  jobId: string;
  signal?: AbortSignal;
};

export function getJobPost({ jobId, signal }: GetJobPostParams) {
  return apiClient<JobPost>(`/backend-api/community/jobs/${jobId}`, {
    method: 'GET',
    cache: 'no-store',
    signal,
  });
}

export type CreateJobPostRequest = {
  companyName: string;
  title: string;
  field: string[];
  employmentType: string;
  location: string;
  education: string;
  career: string;
  skills: string[];
  deadline: string | null;
  apply: ApplyInfo;
  content: string;
};

export function createJobPost(request: CreateJobPostRequest) {
  return apiClient<JobPost>('/backend-api/community/jobs', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export type UpdateJobPostRequest = {
  jobId: string;
  data: CreateJobPostRequest;
};

export function updateJobPost({ jobId, data }: UpdateJobPostRequest) {
  return apiClient<JobPost>(`/backend-api/community/jobs/${jobId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type DeleteJobPostRequest = {
  jobId: string;
};

export function deleteJobPost({ jobId }: DeleteJobPostRequest) {
  return apiClient<JobPost>(`/backend-api/community/jobs/${jobId}`, {
    method: 'DELETE',
  });
}

export type JobPostLikeRequest = {
  jobId: string;
};

export type JobPostLikeResponse = {
  isLiked: boolean;
};

export function likeJobPost({ jobId }: JobPostLikeRequest) {
  return apiClient<JobPostLikeResponse>(`/backend-api/community/jobs/${jobId}/like`, {
    method: 'POST',
  });
}

export function unlikeJobPost({ jobId }: JobPostLikeRequest) {
  return apiClient<JobPostLikeResponse>(`/backend-api/community/jobs/${jobId}/like`, {
    method: 'DELETE',
  });
}

export type JobPostApplyRequest = {
  jobId: string;
};

export type JobPostApplyResponse = {
  isApplied: boolean;
};

export function applyJobPost({ jobId }: JobPostApplyRequest) {
  return apiClient<JobPostApplyResponse>(`/backend-api/community/jobs/${jobId}/apply`, {
    method: 'POST',
  });
}

/* ================================
     Group
   ================================ */

type GroupPostResponse = Omit<GroupPost, 'author'> & {
  author: Omit<UserSummary, 'profileType'> & { type: UserSummary['profileType'] };
};

export type GroupPostsResponse = {
  nextCursor: string | null;
  hasMore: boolean;
  items: GroupPost[];
};

function mapGroupPost({ author, ...post }: GroupPostResponse): GroupPost {
  const { type, ...profile } = author;
  return { ...post, author: { ...profile, profileType: type } };
}

export async function getGroupPosts({
  sort = 'latest',
  keyword,
  cursor,
  limit = 20,
  signal,
}: GroupPostsListParams & { signal?: AbortSignal } = {}): Promise<GroupPostsResponse> {
  const response = await apiClient<
    Omit<GroupPostsResponse, 'items'> & { items: GroupPostResponse[] }
  >('/backend-api/community/groups', {
    method: 'GET',
    cache: 'no-store',
    query: { sort, keyword, cursor, limit: limit.toString() },
    signal,
  });

  return { ...response, items: response.items.map(mapGroupPost) };
}

type GetGroupPostParams = {
  groupId: string;
  signal?: AbortSignal;
};

export async function getGroupPost({ groupId, signal }: GetGroupPostParams): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}`,
    {
      method: 'GET',
      cache: 'no-store',
      signal,
    },
  );

  return mapGroupPost(response);
}

export type CreateGroupPostRequest = Pick<
  GroupPost,
  | 'field'
  | 'title'
  | 'recruitCount'
  | 'expectedPeriod'
  | 'progressType'
  | 'skills'
  | 'deadline'
  | 'content'
>;

export async function createGroupPost(request: CreateGroupPostRequest): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>('/backend-api/community/groups', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return mapGroupPost(response);
}

export type UpdateGroupPostRequest = {
  groupId: string;
  data: CreateGroupPostRequest;
};

export async function updateGroupPost({
  groupId,
  data,
}: UpdateGroupPostRequest): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );

  return mapGroupPost(response);
}

export type DeleteGroupPostRequest = {
  groupId: string;
};

export async function deleteGroupPost({ groupId }: DeleteGroupPostRequest): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}`,
    {
      method: 'DELETE',
    },
  );

  return mapGroupPost(response);
}

export type GroupPostLikeRequest = {
  groupId: string;
};

export type GroupPostLikeResponse = {
  isLiked: boolean;
};

export function likeGroupPost({ groupId }: GroupPostLikeRequest) {
  return apiClient<GroupPostLikeResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}/like`,
    { method: 'POST' },
  );
}

export function unlikeGroupPost({ groupId }: GroupPostLikeRequest) {
  return apiClient<GroupPostLikeResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}/like`,
    { method: 'DELETE' },
  );
}

export type GroupPostApplyRequest = {
  groupId: string;
};

export type GroupPostApplyResponse = {
  isApplied: boolean;
};

export function applyGroupPost({ groupId }: GroupPostApplyRequest) {
  return apiClient<GroupPostApplyResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}/apply`,
    { method: 'POST' },
  );
}
