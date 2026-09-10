'use client';

import { useEffect, useRef } from 'react';

import GroupPostCard from '@/components/community/groups/GroupPostCard';
import CommunityListState from '@/app/(app)/community/_components/CommunityListState';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useGroupApplications } from '@/queries/mypage/useGroupApplications';
import { useToggleGroupPostLike } from '@/queries/community/useToggleGroupPostLike';

import type { ApplicationSort } from '../_constants/applications';

type AppliedGroupListProps = {
  sort: ApplicationSort;
  keyword: string;
};

export default function AppliedGroupList({ sort, keyword }: AppliedGroupListProps) {
  const currentUserQuery = useCurrentUser();
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
  } = useGroupApplications({ sort, q: keyword.trim(), limit: 20 });
  const { mutate: toggleLike, isPending: isLikePending } = useToggleGroupPostLike();
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

  if (currentUserQuery.isError) {
    return (
      <CommunityListState
        type="error"
        message="사용자 정보를 불러오지 못했습니다."
        onRetry={() => {
          void currentUserQuery.refetch();
        }}
      />
    );
  }

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
        message={keyword.trim() ? '검색 결과가 없습니다.' : '지원한 그룹모집이 없습니다.'}
      />
    );
  }

  return (
    <>
      <div className="grid w-full max-w-[930px] grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <GroupPostCard
            key={post.id}
            post={post}
            onToggleLike={toggleLike}
            isLikePending={isLikePending}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className="h-px" />
      {isFetching && hasNextPage && <CommunityListState type="loading" message="로딩 중..." />}
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
