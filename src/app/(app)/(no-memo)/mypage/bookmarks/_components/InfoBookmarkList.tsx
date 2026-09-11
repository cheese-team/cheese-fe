import { useEffect, useMemo, useRef } from 'react';

import InfoPostCard from '@/components/community/info';

import CommunityListState from '@/app/(app)/community/_components/CommunityListState';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useInfoBookmarks } from '@/queries/mypage/useInfoBookmarks';
import { useToggleInfoPostLike } from '@/queries/community/useToggleInfoPostLike';

export default function InfoBookmarkList() {
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
  } = useInfoBookmarks();
  const { mutate: toggleLike, isPending: isLikePending } = useToggleInfoPostLike();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const bookmarkedInfoPosts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

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

  if (isPending) return <CommunityListState type="loading" message="로딩 중..." />;

  if (isError && !isFetchNextPageError) {
    return (
      <CommunityListState
        type="error"
        message="관심글을 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col">
        {bookmarkedInfoPosts.map((infoPost) => (
          <InfoPostCard
            key={infoPost.id}
            post={infoPost}
            onToggleLike={toggleLike}
            isLikePending={isLikePending}
          />
        ))}
      </div>
      {bookmarkedInfoPosts.length === 0 && !hasNextPage && (
        <CommunityListState type="empty" message="관심 정보/자료공유가 없습니다." />
      )}
      <div ref={loadMoreRef} className="h-px" />
      {isFetching && hasNextPage && <CommunityListState type="loading" message="로딩 중..." />}
      {isFetchNextPageError && (
        <CommunityListState
          type="error"
          message="다음 관심글을 불러오지 못했습니다."
          onRetry={() => {
            void fetchNextPage();
          }}
        />
      )}
    </>
  );
}
