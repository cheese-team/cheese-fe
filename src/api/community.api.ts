import { apiClient } from '@/api/client';
import type {
  CommunityCommentCategory,
  CommunityCommentResult,
  CommunityCommentsResponse,
} from '@/types/community/comment';

import type {
  ApplyInfo,
  CommunityAuthor,
  GroupPost,
  GroupPostDetail,
  InfoPost,
  InfoPostDetail,
  JobPost,
  JobPostDetail,
  JobPostLink,
} from '@/types/community/community';
import type {
  GroupPostsListParams,
  InfoPostsListParams,
  JobPostsListParams,
} from '@/types/community/query';

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

export async function getJobPost({ jobId, signal }: GetJobPostParams): Promise<JobPostDetail> {
  return apiClient<JobPostDetail>(`/backend-api/community/jobs/${encodeURIComponent(jobId)}`, {
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
  links?: JobPostLink[];
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

type JobPostLikeRequest = {
  jobId: string;
};

type JobPostLikeResponse = {
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

type JobPostApplyRequest = {
  jobId: string;
};

type JobPostApplyResponse = {
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

export type GroupPostsResponse = {
  nextCursor: string | null;
  hasMore: boolean;
  items: GroupPost[];
};

export async function getGroupPosts({
  sort = 'latest',
  keyword,
  cursor,
  limit = 20,
  signal,
}: GroupPostsListParams & { signal?: AbortSignal } = {}): Promise<GroupPostsResponse> {
  return apiClient<GroupPostsResponse>('/backend-api/community/groups', {
    method: 'GET',
    cache: 'no-store',
    query: { sort, keyword, cursor, limit: limit.toString() },
    signal,
  });
}

type GetGroupPostParams = {
  groupId: string;
  signal?: AbortSignal;
};

export async function getGroupPost({
  groupId,
  signal,
}: GetGroupPostParams): Promise<GroupPostDetail> {
  return apiClient<GroupPostDetail>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}`,
    {
      method: 'GET',
      cache: 'no-store',
      signal,
    },
  );
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
  return apiClient<GroupPost>('/backend-api/community/groups', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export type UpdateGroupPostRequest = {
  groupId: string;
  data: CreateGroupPostRequest;
};

export async function updateGroupPost({
  groupId,
  data,
}: UpdateGroupPostRequest): Promise<GroupPost> {
  return apiClient<GroupPost>(`/backend-api/community/groups/${encodeURIComponent(groupId)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type DeleteGroupPostRequest = {
  groupId: string;
};

export async function deleteGroupPost({ groupId }: DeleteGroupPostRequest): Promise<void> {
  await apiClient<unknown>(`/backend-api/community/groups/${encodeURIComponent(groupId)}`, {
    method: 'DELETE',
  });
}

type GroupPostLikeRequest = {
  groupId: string;
};

type GroupPostLikeResponse = {
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

type GroupPostApplyRequest = {
  groupId: string;
};

type GroupPostApplyResponse = {
  isApplied: boolean;
};

export function applyGroupPost({ groupId }: GroupPostApplyRequest) {
  return apiClient<GroupPostApplyResponse>(
    `/backend-api/community/groups/${encodeURIComponent(groupId)}/apply`,
    { method: 'POST' },
  );
}

/* ================================
      Info
   ================================ */

export type InfoPostsResponse = {
  nextCursor: string | null;
  hasMore: boolean;
  items: InfoPost[];
};

export async function getInfoPosts({
  sort = 'all',
  keyword,
  cursor,
  limit = 20,
  signal,
}: InfoPostsListParams & { signal?: AbortSignal } = {}): Promise<InfoPostsResponse> {
  return apiClient<InfoPostsResponse>('/backend-api/community/info', {
    method: 'GET',
    cache: 'no-store',
    query: { sort, keyword, cursor, limit: limit.toString() },
    signal,
  });
}

type GetInfoPostParams = {
  infoId: string;
  signal?: AbortSignal;
};

export async function getInfoPost({ infoId, signal }: GetInfoPostParams): Promise<InfoPostDetail> {
  return apiClient<InfoPostDetail>(`/backend-api/community/info/${encodeURIComponent(infoId)}`, {
    method: 'GET',
    cache: 'no-store',
    signal,
  });
}

export type CreateInfoPostRequest = Pick<InfoPost, 'category' | 'title' | 'content' | 'tags'> & {
  attachmentFileId?: string;
};

export async function createInfoPost(request: CreateInfoPostRequest): Promise<InfoPost> {
  return apiClient<InfoPost>('/backend-api/community/info', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

type UpdateInfoPostData = Pick<InfoPost, 'category' | 'title' | 'content' | 'tags'> & {
  attachmentFileId?: string | null;
  authorProfileType: CommunityAuthor['profileType'];
};

export type UpdateInfoPostRequest = {
  infoId: string;
  data: UpdateInfoPostData;
};

export async function updateInfoPost({ infoId, data }: UpdateInfoPostRequest): Promise<InfoPost> {
  return apiClient<InfoPost>(`/backend-api/community/info/${encodeURIComponent(infoId)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export type DeleteInfoPostRequest = {
  infoId: string;
};

export async function deleteInfoPost({ infoId }: DeleteInfoPostRequest): Promise<void> {
  await apiClient<{ success: boolean }>(
    `/backend-api/community/info/${encodeURIComponent(infoId)}`,
    {
      method: 'DELETE',
    },
  );
}

type InfoPostLikeRequest = {
  infoId: string;
};

type InfoPostLikeResponse = {
  isLiked: boolean;
};

export function likeInfoPost({ infoId }: InfoPostLikeRequest) {
  return apiClient<InfoPostLikeResponse>(
    `/backend-api/community/info/${encodeURIComponent(infoId)}/like`,
    {
      method: 'POST',
    },
  );
}

export function unlikeInfoPost({ infoId }: InfoPostLikeRequest) {
  return apiClient<InfoPostLikeResponse>(
    `/backend-api/community/info/${encodeURIComponent(infoId)}/like`,
    {
      method: 'DELETE',
    },
  );
}

/* ================================
      Comment
   ================================ */

export type CommentsParams = { category: CommunityCommentCategory; postId: string };

export async function getComments({
  category,
  postId,
  cursor,
  limit = '20',
  signal,
}: CommentsParams & {
  cursor?: string;
  limit?: string;
  signal?: AbortSignal;
}): Promise<CommunityCommentsResponse> {
  return apiClient<CommunityCommentsResponse>(
    `/backend-api/community/${category}/${postId}/comments`,
    { method: 'GET', cache: 'no-store', query: { cursor, limit }, signal },
  );
}
export type CreateCommentRequest = CommentsParams & {
  content: string;
  parentId?: string;
};

export async function createComment({
  category,
  postId,
  ...data
}: CreateCommentRequest): Promise<CommunityCommentsResponse> {
  return apiClient<CommunityCommentsResponse>(
    `/backend-api/community/${category}/${postId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export type UpdateCommentRequest = {
  commentId: string;
  content: string;
  authorProfileType: CommunityAuthor['profileType'];
};

export async function updateComment({
  commentId,
  content,
  authorProfileType,
}: UpdateCommentRequest): Promise<CommunityCommentResult> {
  return apiClient<CommunityCommentResult>(`/backend-api/community/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content, authorProfileType }),
  });
}

export type DeleteCommentRequest = { commentId: string };

export function deleteComment({ commentId }: DeleteCommentRequest) {
  return apiClient<{ success: boolean }>(`/backend-api/community/comments/${commentId}`, {
    method: 'DELETE',
  });
}
