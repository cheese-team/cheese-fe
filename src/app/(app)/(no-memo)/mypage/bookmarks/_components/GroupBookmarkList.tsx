import { useEffect, useMemo, useRef } from 'react';

import GroupPostCard from '@/components/community/groups/GroupPostCard';

import CommunityListState from '@/app/(app)/community/_components/CommunityListState';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useGroupBookmarks } from '@/queries/mypage/useGroupBookmarks';
import { useToggleGroupPostLike } from '@/queries/community/useToggleGroupPostLike';

import type { CommunitySort } from '@/app/(app)/community/_constants/community';

type GroupBookmarkListProps = {
  sort: CommunitySort;
  keyword: string;
};

export default function GroupBookmarkList({ sort, keyword }: GroupBookmarkListProps) {
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
  } = useGroupBookmarks();
  const { mutate: toggleLike, isPending: isLikePending } = useToggleGroupPostLike();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const bookmarkedGroupPosts = useMemo(
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
  }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError, keyword, sort]);

  // TODO:
  // 관심글 조회 API에 검색(q), 정렬(sort) 파라미터가 없어
  // 현재 로드된 데이터에 대해서만 클라이언트에서 검색/정렬하고 있음
  // API 지원 시 전체 관심글 기준 서버 검색/정렬로 전환 필요
  const filteredGroupPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const searchedPosts = bookmarkedGroupPosts.filter((post) => {
      if (!normalizedKeyword) {
        return true;
      }

      return (
        post.title.toLowerCase().includes(normalizedKeyword) ||
        post.author.nickname.toLowerCase().includes(normalizedKeyword) ||
        post.field.some((field) => field.toLowerCase().includes(normalizedKeyword)) ||
        post.skills.some((skill) => skill.toLowerCase().includes(normalizedKeyword))
      );
    });

    return [...searchedPosts].sort((a, b) => {
      if (sort === 'like') {
        return b.likeCount - a.likeCount;
      }

      if (sort === 'deadline') {
        if (!a.deadline && !b.deadline) {
          return 0;
        }

        if (!a.deadline) {
          return 1;
        }

        if (!b.deadline) {
          return -1;
        }

        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [bookmarkedGroupPosts, sort, keyword]);

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
      <div className="grid w-full max-w-[930px] grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
        {filteredGroupPosts.map((groupPost) => (
          <GroupPostCard
            key={groupPost.id}
            post={groupPost}
            onToggleLike={toggleLike}
            isLikePending={isLikePending}
          />
        ))}
      </div>
      {filteredGroupPosts.length === 0 && !hasNextPage && (
        <CommunityListState
          type="empty"
          message={keyword.trim() ? '검색 결과가 없습니다.' : '관심 그룹모집이 없습니다.'}
        />
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
