'use client';

import { useEffect, useRef } from 'react';

import JobPostCard from '@/components/community/jobs/JobPostCard';
import CommunityListState from '@/app/(app)/community/_components/CommunityListState';

import { useJobApplications } from '@/queries/mypage/useJobApplications';
import { useToggleJobPostLike } from '@/queries/community/useToggleJobPostLike';

import type { ApplicationSort } from '../_constants/applications';

type AppliedJobListProps = {
  sort: ApplicationSort;
  keyword: string;
};

export default function AppliedJobList({ sort, keyword }: AppliedJobListProps) {
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
  } = useJobApplications({ sort, q: keyword.trim(), limit: 20 });
  const { mutate: toggleLike, isPending: isLikePending } = useToggleJobPostLike();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const posts = data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetching || isFetchNextPageError) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void fetchNextPage();
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError]);

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (isError && !isFetchNextPageError) {
    return (
      <CommunityListState
        type="error"
        message="지원현황을 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (posts.length === 0) {
    return (
      <CommunityListState
        type="empty"
        message={keyword.trim() ? '검색 결과가 없습니다.' : '지원한 채용공고가 없습니다.'}
      />
    );
  }

  return (
    <>
      {posts.map((post) => (
        <JobPostCard
          key={post.id}
          post={post}
          onDirectApply={() => {}}
          onToggleLike={toggleLike}
          isLikePending={isLikePending}
        />
      ))}
      <div ref={loadMoreRef} className="h-px" />
      {isFetchNextPageError && (
        <CommunityListState
          type="error"
          message="다음 지원현황을 불러오지 못했습니다."
          onRetry={() => {
            void fetchNextPage();
          }}
        />
      )}
    </>
  );
}
