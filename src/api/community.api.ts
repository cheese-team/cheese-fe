import { apiClient } from '@/api/client';

import type { ApplyInfo, GroupPost, JobPost, UserSummary } from '@/types/community/community';
import type { GroupPostsListParams, JobPostsListParams } from '@/types/community/query';

export type JobPostsResponse = {
  nextCursor: string | null;
  hasMore: boolean;
  items: JobPost[];
};

export function getJobPosts({
  userId,
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
      userId,
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
  userId?: string;
  signal?: AbortSignal;
};

export function getJobPost({ jobId, userId, signal }: GetJobPostParams) {
  return apiClient<JobPost>(`/backend-api/community/jobs/${jobId}`, {
    method: 'GET',
    cache: 'no-store',
    query: { userId },
    signal,
  });
}

export type CreateJobPostRequest = {
  userId: string;
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
  userId: string;
  data: Omit<CreateJobPostRequest, 'userId'>;
};

export function updateJobPost({ jobId, userId, data }: UpdateJobPostRequest) {
  return apiClient<JobPost>(`/backend-api/community/jobs/${jobId}`, {
    method: 'PATCH',
    query: { userId },
    body: JSON.stringify(data),
  });
}

export type DeleteJobPostRequest = {
  jobId: string;
  userId: string;
};

export function deleteJobPost({ jobId, userId }: DeleteJobPostRequest) {
  return apiClient<JobPost>(`/backend-api/community/jobs/${jobId}`, {
    method: 'DELETE',
    query: { userId },
  });
}

export type JobPostLikeRequest = {
  jobId: string;
  userId: string;
};

export type JobPostLikeResponse = {
  isLiked: boolean;
};

export function likeJobPost({ jobId, userId }: JobPostLikeRequest) {
  return apiClient<JobPostLikeResponse>(`/backend-api/community/jobs/${jobId}/like`, {
    method: 'POST',
    query: { userId },
  });
}

export function unlikeJobPost({ jobId, userId }: JobPostLikeRequest) {
  return apiClient<JobPostLikeResponse>(`/backend-api/community/jobs/${jobId}/like`, {
    method: 'DELETE',
    query: { userId },
  });
}

export type JobPostApplyRequest = {
  jobId: string;
  userId: string;
};

export type JobPostApplyResponse = {
  isApplied: boolean;
};

export function applyJobPost({ jobId, userId }: JobPostApplyRequest) {
  return apiClient<JobPostApplyResponse>(`/backend-api/community/jobs/${jobId}/apply`, {
    method: 'POST',
    query: { userId },
  });
}

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
  userId,
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
    query: { userId, sort, keyword, cursor, limit: limit.toString() },
    signal,
  });

  return { ...response, items: response.items.map(mapGroupPost) };
}

type GetGroupPostParams = {
  groupId: string;
  userId?: string;
  signal?: AbortSignal;
};

export async function getGroupPost({
  groupId,
  userId,
  signal,
}: GetGroupPostParams): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}`,
    {
      method: 'GET',
      cache: 'no-store',
      query: { userId },
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
> & { userId: string };

export async function createGroupPost(request: CreateGroupPostRequest): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>('/backend-api/community/groups', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return mapGroupPost(response);
}

export type UpdateGroupPostRequest = {
  groupId: string;
  userId: string;
  data: Omit<CreateGroupPostRequest, 'userId'>;
};

export async function updateGroupPost({
  groupId,
  userId,
  data,
}: UpdateGroupPostRequest): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}`,
    {
      method: 'PATCH',
      query: { userId },
      body: JSON.stringify(data),
    },
  );

  return mapGroupPost(response);
}

export type DeleteGroupPostRequest = {
  groupId: string;
  userId: string;
};

export async function deleteGroupPost({
  groupId,
  userId,
}: DeleteGroupPostRequest): Promise<GroupPost> {
  const response = await apiClient<GroupPostResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}`,
    {
      method: 'DELETE',
      query: { userId },
    },
  );

  return mapGroupPost(response);
}

export type GroupPostLikeRequest = {
  groupId: string;
  userId: string;
};

export type GroupPostLikeResponse = {
  isLiked: boolean;
};

export function likeGroupPost({ groupId, userId }: GroupPostLikeRequest) {
  return apiClient<GroupPostLikeResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}/like`,
    { method: 'POST', query: { userId } },
  );
}

export function unlikeGroupPost({ groupId, userId }: GroupPostLikeRequest) {
  return apiClient<GroupPostLikeResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}/like`,
    { method: 'DELETE', query: { userId } },
  );
}

export type GroupPostApplyRequest = {
  groupId: string;
  userId: string;
};

export type GroupPostApplyResponse = {
  isApplied: boolean;
};

export function applyGroupPost({ groupId, userId }: GroupPostApplyRequest) {
  return apiClient<GroupPostApplyResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}/apply`,
    { method: 'POST', query: { userId } },
  );
}
