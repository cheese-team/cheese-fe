import type { CommunitySort, InfoSort } from '@/app/(app)/community/_constants/community';

export type CommunityPostsListParams = {
  sort?: CommunitySort;
  keyword?: string;
};

export type JobPostsListParams = {
  userId?: string;
  sort?: CommunitySort;
  keyword?: string;
  cursor?: string;
  limit?: number;
};

export type InfoPostsListParams = {
  sort?: InfoSort;
  keyword?: string;
};

export type GroupPostsListParams = {
  userId?: string;
  sort?: CommunitySort;
  keyword?: string;
  cursor?: string;
  limit?: number;
};
