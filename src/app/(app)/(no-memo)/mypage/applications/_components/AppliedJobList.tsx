'use client';

import JobPostCard from '@/components/community/jobs/JobPostCard';

import { jobPosts } from '@/mocks/posts';

export default function AppliedJobList() {
  const AppliedPosts = jobPosts?.filter((post) => post.isApplied);
  return (
    <>
      {AppliedPosts?.map((post) => (
        <JobPostCard
          key={post.id}
          post={post}
          onDirectApply={() => {
            // TODO: 모달 열기
          }}
          onToggleLike={() => {
            // TODO: 마이페이지 지원 내역 좋아요 처리 연동
          }}
        />
      ))}
    </>
  );
}
