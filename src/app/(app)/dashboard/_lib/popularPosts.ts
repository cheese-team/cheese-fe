import type { DashboardCommunityPosts } from '@/api/dashboardCommunity.api';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const POPULAR_POST_LIMIT = 4;

type PopularPostItem = {
  id: string;
  category: string;
  title: string;
  href: string;
};

type PopularPostCandidate = PopularPostItem & {
  createdAt: number;
  likeCount: number;
  commentCount: number;
  viewCount: number;
};

function selectPostsForPeriod(posts: PopularPostCandidate[], cutoff: number): PopularPostItem[] {
  const popularPosts = posts
    .filter((post) => post.createdAt >= cutoff)
    .sort(
      (a, b) =>
        b.likeCount - a.likeCount ||
        b.commentCount - a.commentCount ||
        b.viewCount - a.viewCount ||
        b.createdAt - a.createdAt,
    )
    .slice(0, POPULAR_POST_LIMIT);

  const remainingCount = POPULAR_POST_LIMIT - popularPosts.length;

  if (remainingCount > 0) {
    const olderPosts = posts
      .filter((post) => post.createdAt < cutoff)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, remainingCount);

    popularPosts.push(...olderPosts);
  }

  return popularPosts.map(({ id, category, title, href }) => ({ id, category, title, href }));
}

export function selectDashboardPopularPosts(data: DashboardCommunityPosts): {
  recent: PopularPostItem[];
  weekly: PopularPostItem[];
} {
  const posts: PopularPostCandidate[] = [
    ...data.jobs.map((post) => ({
      id: `job-${post.id}`,
      category: '채용공고',
      title: post.title,
      href: `/community/jobs/${post.id}`,
      createdAt: Date.parse(post.createdAt),
      likeCount: post.likeCount,
      commentCount: 0,
      viewCount: post.viewCount,
    })),
    ...data.groups.map((post) => ({
      id: `group-${post.id}`,
      category: '그룹모집',
      title: post.title,
      href: `/community/groups/${post.id}`,
      createdAt: Date.parse(post.createdAt),
      likeCount: post.likeCount,
      commentCount: 0,
      viewCount: post.viewCount,
    })),
    ...data.info.map((post) => ({
      id: `info-${post.id}`,
      category:
        post.category === 'question' ? 'Q&A' : post.category === 'resource' ? '자료공유' : '정보',
      title: post.title,
      href: `/community/info/${post.id}`,
      createdAt: Date.parse(post.createdAt),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      viewCount: post.viewCount,
    })),
  ];

  const uniquePosts = new Map<string, PopularPostCandidate>();

  for (const post of posts) {
    if (
      !Number.isFinite(post.createdAt) ||
      post.createdAt > data.asOf ||
      uniquePosts.has(post.id)
    ) {
      continue;
    }

    uniquePosts.set(post.id, post);
  }

  const candidates = [...uniquePosts.values()];

  return {
    recent: [...candidates]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, POPULAR_POST_LIMIT)
      .map(({ id, category, title, href }) => ({ id, category, title, href })),
    weekly: selectPostsForPeriod(candidates, data.asOf - 7 * DAY_IN_MS),
  };
}
