'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/common/Button';
import GroupPostCard from '@/components/community/groups';
import CommunityListState from '../_components/CommunityListState';

import { COMMUNITY_LIST_LIMIT, isCommunitySort } from '@/app/(app)/community/_constants/community';

import { useGroupPosts } from '@/queries/community/useGroupPosts';
import { useToggleGroupPostLike } from '@/queries/community/useToggleGroupPostLike';

export default function CommunityGroupsPage() {
  const searchParams = useSearchParams();

  const sortParam = searchParams.get('sort');
  const sort = isCommunitySort(sortParam) ? sortParam : 'latest';
  const keyword = searchParams.get('keyword') ?? '';

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useGroupPosts({ sort, keyword, limit: COMMUNITY_LIST_LIMIT });

  const groupPosts = data?.pages.flatMap((page) => page.items) ?? [];
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage || isFetching || isFetchNextPageError) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        void fetchNextPage({ cancelRefetch: false });
      }
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError]);

  const { mutate: toggleGroupPostLike, isPending: isLikePending } = useToggleGroupPostLike();

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (isError && !isFetchNextPageError) {
    return (
      <CommunityListState
        type="error"
        message="그룹모집을 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (groupPosts.length === 0) {
    return (
      <CommunityListState
        type="empty"
        message={keyword ? '검색 결과가 없습니다.' : '등록된 그룹모집이 없습니다.'}
      />
    );
  }

  return (
    <div>
      <div className="mx-auto grid max-w-[976px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {groupPosts.map((groupPost) => (
          <GroupPostCard
            key={groupPost.id}
            post={groupPost}
            isLikePending={isLikePending}
            onToggleLike={toggleGroupPostLike}
          />
        ))}
      </div>

      <div ref={loadMoreRef} className="h-px" />

      {isFetchingNextPage && <CommunityListState type="loading" message="로딩 중..." />}
      {isFetchNextPageError && (
        <div className="flex justify-center py-5">
          <Button
            width={120}
            variant="outlineGray"
            onClick={() => {
              if (hasNextPage && !isFetching) void fetchNextPage({ cancelRefetch: false });
            }}
            disabled={isFetching}
          >
            다시 시도
          </Button>
        </div>
      )}
    </div>
  );
}
