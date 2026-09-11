'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/common/Button';
import InfoPostCard from '@/components/community/info';
import CommunityListState from '../_components/CommunityListState';

import { COMMUNITY_LIST_LIMIT, isInfoSort } from '@/app/(app)/community/_constants/community';

import { useInfoPosts } from '@/queries/community/useInfoPosts';
import { useToggleInfoPostLike } from '@/queries/community/useToggleInfoPostLike';

export default function CommunityInfoPage() {
  const searchParams = useSearchParams();
  const { mutate: toggleInfoPostLike, isPending: isLikePending } = useToggleInfoPostLike();

  const sortParam = searchParams.get('sort');
  const sort = isInfoSort(sortParam) ? sortParam : 'all';
  const keyword = searchParams.get('keyword') ?? '';

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useInfoPosts({ sort, keyword, limit: COMMUNITY_LIST_LIMIT });

  const infoPosts = data?.pages.flatMap((page) => page.items) ?? [];
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !hasNextPage || isFetchNextPageError) return;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError]);

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (isError && !isFetchNextPageError) {
    return (
      <CommunityListState
        type="error"
        message="정보/자료공유 게시글을 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (infoPosts.length === 0) {
    return (
      <CommunityListState
        type="empty"
        message={keyword ? '검색 결과가 없습니다.' : '등록된 정보/자료공유 게시글이 없습니다.'}
      />
    );
  }

  return (
    <div>
      <div className="mx-auto flex w-full flex-col px-[50px]">
        {infoPosts.map((infoPost) => (
          <InfoPostCard
            key={infoPost.id}
            post={infoPost}
            wrapperClassName="py-8"
            onToggleLike={toggleInfoPostLike}
            isLikePending={isLikePending}
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
              if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
            }}
            disabled={isFetchingNextPage}
          >
            다시 시도
          </Button>
        </div>
      )}
    </div>
  );
}
