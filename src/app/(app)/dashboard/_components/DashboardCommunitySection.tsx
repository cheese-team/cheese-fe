'use client';

import Link from 'next/link';

import { Button } from '@/components/common/Button';
import DashboardPostList from './DashboardPostList';
import DashboardSectionHeader from './DashboardSectionHeader';

import { ApiError } from '@/api/client';
import { useDashboardPopularPosts } from '@/queries/community/useDashboardPopularPosts';

import { cn } from '@/lib/cn';

import { CommunityIcon } from '@/assets/icons/sidebar';

export default function DashboardCommunitySection() {
  const {
    data: popularPosts,
    error,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useDashboardPopularPosts();

  return (
    <section>
      <DashboardSectionHeader icon={<CommunityIcon />} title="커뮤니티" href="/community" />

      {isError && (
        <div
          role="alert"
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-[10px] bg-white',
            popularPosts ? 'mb-4 py-3' : 'min-h-[188px] border border-gray-300 p-8',
          )}
        >
          <p className="flex flex-col text-center text-[15px] font-medium text-gray-800">
            <span>
              {popularPosts
                ? '게시글을 새로고침하지 못했습니다.'
                : error instanceof ApiError
                  ? error.message
                  : '커뮤니티 게시글을 불러오지 못했습니다.'}
            </span>

            {popularPosts && <span>이전에 불러온 결과를 표시합니다.</span>}
          </p>

          <Button
            type="button"
            width={120}
            size={30}
            disabled={isFetching}
            onClick={() => {
              void refetch();
            }}
          >
            다시 시도
          </Button>
        </div>
      )}

      {isPending ? (
        <div
          role="status"
          className="flex min-h-[188px] items-center justify-center rounded-[10px] border border-gray-300 bg-white p-8 text-[15px] font-medium text-gray-600"
        >
          커뮤니티 게시글을 불러오는 중입니다.
        </div>
      ) : popularPosts && popularPosts.recent.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          <DashboardPostList title="최근 게시글" posts={popularPosts.recent} />
          <DashboardPostList title="주간 인기 게시글" posts={popularPosts.weekly} />
        </div>
      ) : popularPosts ? (
        <div className="flex min-h-[188px] flex-col items-center justify-center rounded-[10px] border border-gray-300 bg-white p-8 text-center">
          <p className="text-text-muted text-[15px] leading-[22px] font-medium">
            등록된 게시글이 없습니다.
          </p>

          <Link
            href="/community/jobs"
            className="mt-3 text-[15px] leading-[22px] font-medium hover:underline"
          >
            커뮤니티 둘러보기
          </Link>
        </div>
      ) : null}
    </section>
  );
}
