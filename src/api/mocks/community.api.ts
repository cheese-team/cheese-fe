import { getDeadlineTime, isRecruitClosed } from '@/lib/formatDeadline';
import { getOptionLabel } from '@/lib/getOptionLabel';

import { INFO_SORT_OPTIONS, type CommunitySort } from '@/app/(app)/community/_constants/community';

import type { GroupPost, JobPost, InfoPost } from '@/types/community/community';
import type { CommunityPostsListParams, InfoPostsListParams } from '@/types/community/query';

import { jobPosts, groupPosts, infoPosts } from '@/mocks/posts';

/* ================================
     커뮤니티 목록
   ================================ */

type RecruitPostSortFields = {
  likeCount: number;
  deadline: string | null;
};

function sortRecruitPosts<T extends RecruitPostSortFields>(
  posts: T[],
  sort: CommunitySort,
  getLatestValue: (post: T) => number,
): T[] {
  return [...posts].sort((a, b) => {
    if (sort === 'like') {
      return b.likeCount - a.likeCount;
    }

    if (sort === 'deadline') {
      const aClosed = isRecruitClosed(a.deadline);
      const bClosed = isRecruitClosed(b.deadline);

      if (aClosed !== bClosed) {
        return aClosed ? 1 : -1;
      }

      return getDeadlineTime(a.deadline) - getDeadlineTime(b.deadline);
    }

    return getLatestValue(b) - getLatestValue(a);
  });
}

export async function getGroupPosts({
  sort = 'latest',
  keyword = '',
}: CommunityPostsListParams = {}): Promise<GroupPost[]> {
  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredPosts = groupPosts.filter((post) => {
    if (!normalizedKeyword) {
      return true;
    }

    return (
      post.title.toLowerCase().includes(normalizedKeyword) ||
      post.author.nickname.toLowerCase().includes(normalizedKeyword) ||
      post.field.some((field) => field.toLowerCase().includes(normalizedKeyword))
    );
  });

  return sortRecruitPosts(filteredPosts, sort, (post) => new Date(post.createdAt).getTime());
}

export async function getInfoPosts({
  sort = 'all',
  keyword = '',
}: InfoPostsListParams = {}): Promise<InfoPost[]> {
  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredPosts = infoPosts.filter((post) => {
    const matchesSort = sort === 'all' || post.category === sort;

    if (!matchesSort) {
      return false;
    }

    if (!normalizedKeyword) {
      return true;
    }

    return (
      post.title.toLowerCase().includes(normalizedKeyword) ||
      post.content.toLowerCase().includes(normalizedKeyword) ||
      post.author.nickname.toLowerCase().includes(normalizedKeyword) ||
      getOptionLabel(INFO_SORT_OPTIONS, post.category).toLowerCase().includes(normalizedKeyword) ||
      post.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))
    );
  });

  return [...filteredPosts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/* ================================
     좋아요
   ================================ */

type LikeablePost = {
  id: string | number;
  isLiked: boolean;
  likeCount: number;
};

function updatePostLike(
  posts: LikeablePost[],
  postId: string | number,
  nextIsLiked: boolean,
): void {
  const postIndex = posts.findIndex((post) => post.id === postId);

  if (postIndex === -1) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  const post = posts[postIndex];

  if (post.isLiked === nextIsLiked) {
    return;
  }

  posts[postIndex] = {
    ...post,
    isLiked: nextIsLiked,
    likeCount: Math.max(0, post.likeCount + (nextIsLiked ? 1 : -1)),
  };
}

export async function likeGroupPost(postId: string): Promise<void> {
  updatePostLike(groupPosts, postId, true);
}

export async function unlikeGroupPost(postId: string): Promise<void> {
  updatePostLike(groupPosts, postId, false);
}

export async function likeInfoPost(postId: number): Promise<void> {
  updatePostLike(infoPosts, postId, true);
}

export async function unlikeInfoPost(postId: number): Promise<void> {
  updatePostLike(infoPosts, postId, false);
}
