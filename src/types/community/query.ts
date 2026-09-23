import type { CommunitySort, InfoSort } from '@/app/(app)/community/_constants/community';

export type JobPostsListParams = {
  sort?: CommunitySort;
  keyword?: string;
  cursor?: string;
  limit?: number;
};

export type InfoPostsListParams = {
  sort?: InfoSort;
  keyword?: string;
  cursor?: string;
  limit?: number;
};

export type GroupPostsListParams = {
  sort?: CommunitySort;
  keyword?: string;
  cursor?: string;
  limit?: number;
};
