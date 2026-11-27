'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/common/Button';
import JobPostCard from '@/components/community/jobs/JobPostCard';

import CommunityListState from '../_components/CommunityListState';
import ApplyModal from '../_components/ApplyModal';

import { COMMUNITY_LIST_LIMIT, isCommunitySort } from '@/app/(app)/community/_constants/community';

import { useJobPosts } from '@/queries/community/useJobPosts';
import { useToggleJobPostLike } from '@/queries/community/useToggleJobPostLike';
import { useApplyJobPost } from '@/queries/community/useApplyJobPost';
import { isRecruitClosed } from '@/lib/formatDeadline';

export default function CommunityJobsPage() {
  const searchParams = useSearchParams();
  const [selectedApplyPostId, setSelectedApplyPostId] = useState<string | null>(null);

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
    isFetchNextPageError,
  } = useJobPosts({ sort, keyword, limit: COMMUNITY_LIST_LIMIT });

  const jobPosts = data?.pages.flatMap((page) => page.items) ?? [];
  const selectedApplyPost = jobPosts.find((post) => post.id === selectedApplyPostId);

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

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetching, isFetchNextPageError]);

  const { mutate: toggleJobPostLike, isPending: isLikePending } = useToggleJobPostLike();
  const {
    mutateAsync: applyJobPost,
    isPending: isApplyPending,
    variables: applyingJobId,
  } = useApplyJobPost();

  if (isPending) {
    return <CommunityListState type="loading" message="로딩 중..." />;
  }

  if (isError && !isFetchNextPageError) {
    return (
      <CommunityListState
        type="error"
        message="채용공고를 불러오지 못했습니다."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (jobPosts.length === 0) {
    return (
      <CommunityListState
        type="empty"
        message={keyword ? '검색 결과가 없습니다.' : '등록된 채용공고가 없습니다.'}
      />
    );
  }

  return (
    <div>
      {jobPosts.map((jobPost) => (
        <JobPostCard
          key={jobPost.id}
          post={jobPost}
          onDirectApply={() => {
            if (isApplyPending || jobPost.isApplied || isRecruitClosed(jobPost.deadline)) return;
            setSelectedApplyPostId(jobPost.id);
          }}
          isApplyPending={isApplyPending && applyingJobId === jobPost.id}
          onToggleLike={toggleJobPostLike}
          isLikePending={isLikePending}
        />
      ))}

      <div ref={loadMoreRef} className="h-px" />

      {isFetchNextPageError && (
        <div className="flex justify-center py-5">
          <Button
            width={120}
            variant="outlineGray"
            onClick={() => {
              void fetchNextPage({ cancelRefetch: false });
            }}
            disabled={isFetching}
          >
            다시 시도
          </Button>
        </div>
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
            if (!response.isApplied) {
              throw new Error('지원이 완료되지 않았습니다. 다시 시도해주세요.');
            }
          }}
        />
      )}
    </div>
  );
}
