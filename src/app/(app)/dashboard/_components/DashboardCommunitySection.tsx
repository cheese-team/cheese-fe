import Link from 'next/link';

import { CommunityIcon } from '@/assets/icons/sidebar';

import DashboardPostList from './DashboardPostList';
import DashboardSectionHeader from './DashboardSectionHeader';

import { groupPosts, infoPosts, jobPosts } from '@/mocks/posts';

type PopularPostItem = {
  id: string;
  category: string;
  title: string;
  likeCount: number;
  viewCount: number;
  href: string;
};

function toPopularPosts(): { daily: PopularPostItem[]; weekly: PopularPostItem[] } {
  const items: PopularPostItem[] = [
    ...jobPosts.map((post) => ({
      id: `job-${post.id}`,
      category: '채용공고',
      title: post.title,
      likeCount: post.likeCount,
      viewCount: post.viewCount,
      href: `/community/jobs/${post.id}`,
    })),
    ...groupPosts.map((post) => ({
      id: `group-${post.id}`,
      category: '그룹모집',
      title: post.title,
      likeCount: post.likeCount,
      viewCount: post.viewCount,
      href: `/community/groups/${post.id}`,
    })),
    ...infoPosts.map((post) => ({
      id: `info-${post.id}`,
      category:
        post.category === 'question' ? 'Q&A' : post.category === 'resource' ? '자료공유' : '정보',
      title: post.title,
      likeCount: post.likeCount,
      viewCount: post.viewCount,
      href: `/community/info/${post.id}`,
    })),
  ];

  const byLike = [...items].sort((a, b) => b.likeCount - a.likeCount);
  const byView = [...items].sort((a, b) => b.viewCount - a.viewCount);

  return {
    daily: byLike.slice(0, 4),
    weekly: byView.slice(0, 4),
  };
}

export default function DashboardCommunitySection() {
  const popularPosts = toPopularPosts();

  return (
    <section>
      <DashboardSectionHeader icon={<CommunityIcon />} title="커뮤니티" className="mb-4" />

      {popularPosts.daily.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          <DashboardPostList
            title="일간 인기 게시글"
            href="/community/jobs"
            posts={popularPosts.daily}
          />
          <DashboardPostList
            title="주간 인기 게시글"
            href="/community/jobs"
            posts={popularPosts.weekly}
          />
        </div>
      ) : (
        <div className="flex min-h-[160px] flex-col items-center justify-center rounded-[10px] border border-gray-300 bg-white p-8 text-center">
          <p className="text-text-muted text-[15px] leading-[22px] font-medium">
            인기 게시글이 없습니다.
          </p>

          <Link
            href="/community/jobs"
            className="mt-3 text-[15px] leading-[22px] font-medium hover:underline"
          >
            커뮤니티 둘러보기
          </Link>
        </div>
      )}
    </section>
  );
}
