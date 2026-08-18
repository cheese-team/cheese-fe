import { CommunitySort, InfoSort } from '@/app/(app)/community/_constants/community';

export type CommunityPostsListParams = {
  sort?: CommunitySort;
  keyword?: string;
};

export type InfoPostsListParams = {
  sort?: InfoSort;
  keyword?: string;
};
