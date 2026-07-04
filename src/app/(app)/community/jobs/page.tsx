'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import JobPostCard from '@/components/community/jobs/JobPostCard';
import ApplyModal from '../_components/ApplyModal/ApplyModal';

import { useLikeToggle } from '@/hooks/useLikeToggle';
import { getDeadlineTime, isRecruitClosed } from '@/lib/formatDeadline';

import type { JobPost } from '@/types/community';

import { jobPosts as JOB_POSTS } from '@/mocks/posts';

export default function CommunityJobsPage() {
  const searchParams = useSearchParams();
  const { posts: jobPosts, toggleLike } = useLikeToggle(JOB_POSTS);
  const [selectedApplyPost, setSelectedApplyPost] = useState<JobPost | null>(null);

  const sort = searchParams.get('sort') ?? 'latest';
  const keyword = searchParams.get('keyword') ?? '';

  const filteredJobPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return jobPosts
      .filter((post) => {
        if (normalizedKeyword.length === 0) {
          return true;
        }

        return (
          post.title.toLowerCase().includes(normalizedKeyword) ||
          post.companyName.toLowerCase().includes(normalizedKeyword) ||
          post.skills.some((skill) => skill.toLowerCase().includes(normalizedKeyword))
        );
      })
      .sort((a, b) => {
        if (sort === 'like') {
          return b.likeCount - a.likeCount;
        }

        if (sort === 'deadline') {
          const aClosed = isRecruitClosed(a.deadline);
          const bClosed = isRecruitClosed(b.deadline);

          if (aClosed !== bClosed) {
            return aClosed ? 1 : -1;
          }

          return getDeadlineTime(a.deadline) - getDeadlineTime(b.deadline);
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [jobPosts, keyword, sort]);

  return (
    <div>
      {filteredJobPosts?.map((jobPost) => (
        <JobPostCard
          key={jobPost.id}
          post={jobPost}
          onDirectApply={() => setSelectedApplyPost(jobPost)}
          onToggleLike={toggleLike}
        />
      ))}

      {selectedApplyPost && (
        <ApplyModal
          post={selectedApplyPost}
          isOpen={!!selectedApplyPost}
          onClose={() => setSelectedApplyPost(null)}
        />
      )}
    </div>
  );
}
