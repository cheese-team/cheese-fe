import { apiClient } from '@/api/client';
import type {
  CommunityCommentCategory,
  CommunityCommentReply,
  CommunityCommentResult,
  CommunityCommentsResponse,
} from '@/types/community/comment';

import type {
  ApplyInfo,
  GroupPost,
  InfoPost,
  JobPost,
  UserSummary,
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

export type GroupPostResponse = Omit<GroupPost, 'author'> & {
  author: Omit<UserSummary, 'profileType'> & { type: UserSummary['profileType'] };
};

export type GroupPostsResponse = {
  nextCursor: string | null;
  hasMore: boolean;
  items: GroupPost[];
};

export function mapGroupPost({ author, ...post }: GroupPostResponse): GroupPost {
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

export type InfoPostResponse = Omit<InfoPost, 'author'> & {
  author: Omit<UserSummary, 'profileType'> & {
    type: UserSummary['profileType'];
  };
};

export type InfoPostsResponse = {
  nextCursor: string | null;
  hasMore: boolean;
  items: InfoPost[];
};

export function mapInfoPost({ author, ...post }: InfoPostResponse): InfoPost {
  const { type, ...profile } = author;
  return { ...post, author: { ...profile, profileType: type } };
}

export async function getInfoPosts({
  sort = 'all',
  keyword,
  cursor,
  limit = 20,
  signal,
}: InfoPostsListParams & { signal?: AbortSignal } = {}): Promise<InfoPostsResponse> {
  const response = await apiClient<
    Omit<InfoPostsResponse, 'items'> & { items: InfoPostResponse[] }
  >('/backend-api/community/info', {
    method: 'GET',
    cache: 'no-store',
    query: { sort, keyword, cursor, limit: limit.toString() },
    signal,
  });

  return { ...response, items: response.items.map(mapInfoPost) };
}

type GetInfoPostParams = {
  infoId: string;
  signal?: AbortSignal;
};

export async function getInfoPost({ infoId, signal }: GetInfoPostParams): Promise<InfoPost> {
  const response = await apiClient<InfoPostResponse>(
    `/backend-api/community/info/${encodeURIComponent(infoId)}`,
    {
      method: 'GET',
      cache: 'no-store',
      signal,
    },
  );

  return mapInfoPost(response);
}

export type CreateInfoPostRequest = Pick<InfoPost, 'category' | 'title' | 'content' | 'tags'> & {
  attachmentFileId?: string;
};

export async function createInfoPost(request: CreateInfoPostRequest): Promise<InfoPost> {
  const response = await apiClient<InfoPostResponse>('/backend-api/community/info', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return mapInfoPost(response);
}

type UpdateInfoPostData = Pick<InfoPost, 'category' | 'title' | 'content' | 'tags'> & {
  attachmentFileId?: string | null;
  authorProfileType: UserSummary['profileType'];
};

export type UpdateInfoPostRequest = {
  infoId: string;
  data: UpdateInfoPostData;
};

export async function updateInfoPost({ infoId, data }: UpdateInfoPostRequest): Promise<InfoPost> {
  const response = await apiClient<InfoPostResponse>(
    `/backend-api/community/info/${encodeURIComponent(infoId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );

  return mapInfoPost(response);
}

export type DeleteInfoPostRequest = {
  infoId: string;
};

export async function deleteInfoPost({ infoId }: DeleteInfoPostRequest) {
  const response = await apiClient<InfoPostResponse>(
    `/backend-api/community/info/${encodeURIComponent(infoId)}`,
    {
      method: 'DELETE',
    },
  );

  return mapInfoPost(response);
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

type CommentResponse = Omit<CommunityCommentResult, 'author'> & {
  author: Omit<UserSummary, 'profileType'> & { type: UserSummary['profileType'] };
};

type CommentsListResponse = Omit<CommunityCommentsResponse, 'items'> & {
  items: (CommentResponse & {
    parentId: null;
    replies: (CommentResponse & { parentId: string })[];
  })[];
};

function mapComment({ author, ...comment }: CommentResponse): CommunityCommentResult {
  const { type, ...profile } = author;
  return { ...comment, author: { ...profile, profileType: type } };
}

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
  const response = await apiClient<CommentsListResponse>(
    `/backend-api/community/${category}/${postId}/comments`,
    { method: 'GET', cache: 'no-store', query: { cursor, limit }, signal },
  );
  return {
    ...response,
    items: response.items.map((comment) => ({
      ...mapComment(comment),
      parentId: null,
      replies: comment.replies.map(
        (reply): CommunityCommentReply => ({ ...mapComment(reply), parentId: reply.parentId }),
      ),
    })),
  };
}
export type CreateCommentRequest = CommentsParams & {
  content: string;
  parentId?: string;
};

export async function createComment({ category, postId, ...data }: CreateCommentRequest) {
  const response = await apiClient<CommentResponse>(
    `/backend-api/community/${category}/${postId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );

  return mapComment(response);
}

export type UpdateCommentRequest = {
  commentId: string;
  content: string;
  authorProfileType: UserSummary['profileType'];
};

export async function updateComment({
  commentId,
  content,
  authorProfileType,
}: UpdateCommentRequest) {
  const response = await apiClient<CommentResponse>(
    `/backend-api/community/comments/${commentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ content, authorProfileType }),
    },
  );
  return mapComment(response);
}

export type DeleteCommentRequest = { commentId: string };

export function deleteComment({ commentId }: DeleteCommentRequest) {
  return apiClient<{ success: boolean }>(`/backend-api/community/comments/${commentId}`, {
    method: 'DELETE',
  });
}
