import type { UserSummary } from './community';

export type CommunityCommentCategory = 'jobs' | 'groups' | 'info';

export type CommunityCommentReply = {
  id: string;
  author: UserSummary;
  content: string;
  createdAt: string;
  parentId: string;
};

export type CommunityComment = Omit<CommunityCommentReply, 'parentId'> & {
  parentId: null;
  replies: CommunityCommentReply[];
};

export type CommunityCommentsResponse = {
  items: CommunityComment[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type CommunityCommentResult = Omit<CommunityCommentReply, 'parentId'> & {
  parentId: string | null;
};
