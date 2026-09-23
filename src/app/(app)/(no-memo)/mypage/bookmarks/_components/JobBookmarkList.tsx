import { useEffect, useMemo, useRef, useState } from 'react';

import JobPostCard from '@/components/community/jobs/JobPostCard';
import ApplyModal from '@/app/(app)/community/_components/ApplyModal';

import CommunityListState from '@/app/(app)/community/_components/CommunityListState';

import { useJobBookmarks } from '@/queries/mypage/useJobBookmarks';
import { useToggleJobPostLike } from '@/queries/community/useToggleJobPostLike';
import { useApplyJobPost } from '@/queries/community/useApplyJobPost';

import { isRecruitClosed } from '@/lib/formatDeadline';

import type { CommunitySort } from '@/app/(app)/community/_constants/community';

type JobBookmarkListProps = {
  sort: CommunitySort;
  keyword: string;
};

export default function JobBookmarkList({ sort, keyword }: JobBookmarkListProps) {
  const [selectedApplyPostId, setSelectedApplyPostId] = useState<string | null>(null);

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
  } = useJobBookmarks();

  const { mutate: toggleLike, isPending: isLikePending } = useToggleJobPostLike();

  const {
    mutateAsync: applyJobPost,
    isPending: isApplyPending,
    variables: applyingJobId,
  } = useApplyJobPost();

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const bookmarkedJobPosts = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const selectedApplyPost = bookmarkedJobPosts.find((post) => post.id === selectedApplyPostId);

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
  const filteredJobPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const searchedPosts = bookmarkedJobPosts.filter((post) => {
      if (!normalizedKeyword) {
        return true;
      }

      return (
        post.title.toLowerCase().includes(normalizedKeyword) ||
        post.companyName.toLowerCase().includes(normalizedKeyword) ||
        post.author.nickname.toLowerCase().includes(normalizedKeyword)
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
  }, [bookmarkedJobPosts, sort, keyword]);

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
      {filteredJobPosts.map((jobPost) => (
        <JobPostCard
          key={jobPost.id}
          post={jobPost}
          onToggleLike={toggleLike}
          isLikePending={isLikePending}
          isApplyPending={isApplyPending && applyingJobId === jobPost.id}
          onDirectApply={() => {
            if (isApplyPending || jobPost.isApplied || isRecruitClosed(jobPost.deadline)) return;
            setSelectedApplyPostId(jobPost.id);
          }}
        />
      ))}

      {filteredJobPosts.length === 0 && !hasNextPage && (
        <CommunityListState
          type="empty"
          message={keyword.trim() ? '검색 결과가 없습니다.' : '관심 채용공고가 없습니다.'}
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

      {selectedApplyPost && (
        <ApplyModal
          key={selectedApplyPost.id}
          post={selectedApplyPost}
          isOpen
          onClose={() => setSelectedApplyPostId(null)}
          isApplied={selectedApplyPost.isApplied}
          isApplyPending={isApplyPending}
          onApply={async () => {
            if (
              isApplyPending ||
              selectedApplyPost.isApplied ||
              isRecruitClosed(selectedApplyPost.deadline)
            )
              return;
            const response = await applyJobPost(selectedApplyPost.id);
            if (!response.isApplied)
              throw new Error('지원이 완료되지 않았습니다. 다시 시도해주세요.');
          }}
        />
      )}
    </>
  );
}
