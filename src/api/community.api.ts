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

type DeleteJobPostResponse = {
  success: boolean;
};

export function deleteJobPost({ jobId, userId }: DeleteJobPostRequest) {
  return apiClient<DeleteJobPostResponse>(`/backend-api/community/jobs/${jobId}`, {
    method: 'DELETE',
    query: { userId },
  });
}

type JobPostLikeRequest = {
  jobId: string;
  userId: string;
};

type JobPostLikeResponse = {
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

type JobPostApplyRequest = {
  jobId: string;
  userId: string;
};

type JobPostApplyResponse = {
  isApplied: boolean;
};

export function applyJobPost({ jobId, userId }: JobPostApplyRequest) {
  return apiClient<JobPostApplyResponse>(`/backend-api/community/jobs/${jobId}/apply`, {
    method: 'POST',
    query: { userId },
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
  const response = await apiClient<GroupPostResponse>(`/backend-api/community/groups/${groupId}`, {
    method: 'GET',
    cache: 'no-store',
    query: { userId },
    signal,
  });

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
  const response = await apiClient<GroupPostResponse>(`/backend-api/community/groups/${groupId}`, {
    method: 'PATCH',
    query: { userId },
    body: JSON.stringify(data),
  });

  return mapGroupPost(response);
}

export type DeleteGroupPostRequest = {
  groupId: string;
  userId: string;
};

type DeleteGroupPostResponse = {
  success: boolean;
};

export async function deleteGroupPost({ groupId, userId }: DeleteGroupPostRequest) {
  return apiClient<DeleteGroupPostResponse>(`/backend-api/community/groups/${groupId}`, {
    method: 'DELETE',
    query: { userId },
  });
}

type GroupPostLikeRequest = {
  groupId: string;
  userId: string;
};

type GroupPostLikeResponse = {
  isLiked: boolean;
};

export function likeGroupPost({ groupId, userId }: GroupPostLikeRequest) {
  return apiClient<GroupPostLikeResponse>(`/backend-api/community/groups/${groupId}/like`, {
    method: 'POST',
    query: { userId },
  });
}

export function unlikeGroupPost({ groupId, userId }: GroupPostLikeRequest) {
  return apiClient<GroupPostLikeResponse>(`/backend-api/community/groups/${groupId}/like`, {
    method: 'DELETE',
    query: { userId },
  });
}

type GroupPostApplyRequest = {
  groupId: string;
  userId: string;
};

type GroupPostApplyResponse = {
  isApplied: boolean;
};

export function applyGroupPost({ groupId, userId }: GroupPostApplyRequest) {
  return apiClient<GroupPostApplyResponse>(`/backend-api/community/groups/${groupId}/apply`, {
    method: 'POST',
    query: { userId },
  });
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
  userId,
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
    query: { userId, sort, keyword, cursor, limit: limit.toString() },
    signal,
  });

  return { ...response, items: response.items.map(mapInfoPost) };
}

type GetInfoPostParams = {
  infoId: string;
  userId?: string;
  signal?: AbortSignal;
};

export async function getInfoPost({
  infoId,
  userId,
  signal,
}: GetInfoPostParams): Promise<InfoPost> {
  const response = await apiClient<InfoPostResponse>(`/backend-api/community/info/${infoId}`, {
    method: 'GET',
    cache: 'no-store',
    query: { userId },
    signal,
  });

  return mapInfoPost(response);
}

export type CreateInfoPostRequest = Pick<InfoPost, 'category' | 'title' | 'content' | 'tags'> & {
  userId: string;
  attachmentFileId?: string;
};

export async function createInfoPost(request: CreateInfoPostRequest): Promise<InfoPost> {
  const response = await apiClient<InfoPostResponse>('/backend-api/community/info', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return mapInfoPost(response);
}

type UpdateInfoPostData = Omit<CreateInfoPostRequest, 'userId' | 'attachmentFileId'> & {
  attachmentFileId?: string | null;
};

export type UpdateInfoPostRequest = {
  infoId: string;
  userId: string;
  data: UpdateInfoPostData;
};

export async function updateInfoPost({
  infoId,
  userId,
  data,
}: UpdateInfoPostRequest): Promise<InfoPost> {
  const response = await apiClient<InfoPostResponse>(`/backend-api/community/info/${infoId}`, {
    method: 'PATCH',
    query: { userId },
    body: JSON.stringify(data),
  });

  return mapInfoPost(response);
}

export type DeleteInfoPostRequest = {
  infoId: string;
  userId: string;
};

type DeleteInfoPostResponse = {
  success: boolean;
};

export async function deleteInfoPost({ infoId, userId }: DeleteInfoPostRequest) {
  return apiClient<DeleteInfoPostResponse>(`/backend-api/community/info/${infoId}`, {
    method: 'DELETE',
    query: { userId },
  });
}

type InfoPostLikeRequest = {
  infoId: string;
  userId: string;
};

type InfoPostLikeResponse = {
  isLiked: boolean;
};

export function likeInfoPost({ infoId, userId }: InfoPostLikeRequest) {
  return apiClient<InfoPostLikeResponse>(`/backend-api/community/info/${infoId}/like`, {
    method: 'POST',
    query: { userId },
  });
}

export function unlikeInfoPost({ infoId, userId }: InfoPostLikeRequest) {
  return apiClient<InfoPostLikeResponse>(`/backend-api/community/info/${infoId}/like`, {
    method: 'DELETE',
    query: { userId },
  });
}

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
  userId: string;
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
export type UpdateCommentRequest = { commentId: string; userId: string; content: string };
export async function updateComment({ commentId, userId, content }: UpdateCommentRequest) {
  const response = await apiClient<CommentResponse>(
    `/backend-api/community/comments/${commentId}`,
    {
      method: 'PATCH',
      query: { userId },
      body: JSON.stringify({ content }),
    },
  );
  return mapComment(response);
}
export type DeleteCommentRequest = { commentId: string; userId: string };
export function deleteComment({ commentId, userId }: DeleteCommentRequest) {
  return apiClient<{ success: boolean }>(`/backend-api/community/comments/${commentId}`, {
    method: 'DELETE',
    query: { userId },
  });
}
