'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import JobPostCard from '@/components/community/jobs/JobPostCard';

import ApplyModal from '../_components/ApplyModal';

import { isCommunitySort } from '@/app/(app)/community/_constants/community';

import { useJobPosts } from '@/queries/community/useJobPosts';
import { useToggleJobPostLike } from '@/queries/community/useToggleJobPostLike';

import type { JobPost } from '@/types/community/community';

export default function CommunityJobsPage() {
  const searchParams = useSearchParams();
  const [selectedApplyPost, setSelectedApplyPost] = useState<JobPost | null>(null);

  const sortParam = searchParams.get('sort');
  const sort = isCommunitySort(sortParam) ? sortParam : 'latest';
  const keyword = searchParams.get('keyword') ?? '';

  const { data: jobPosts = [], isPending, isError } = useJobPosts({ sort, keyword });

  // TODO: API 연동 후 좋아요 캐시 갱신 방식 최적화
  const { mutate: toggleJobPostLike } = useToggleJobPostLike();

  if (isPending) {
    return <div>불러오는 중입니다.</div>;
  }

  if (isError) {
    return <div>채용공고를 불러오지 못했습니다.</div>;
  }

  return (
    <div>
      {jobPosts.map((jobPost) => (
        <JobPostCard
          key={jobPost.id}
          post={jobPost}
          onDirectApply={() => setSelectedApplyPost(jobPost)}
          onToggleLike={toggleJobPostLike}
        />
      ))}

      {selectedApplyPost && (
        <ApplyModal post={selectedApplyPost} isOpen onClose={() => setSelectedApplyPost(null)} />
      )}
    </div>
  );
}
