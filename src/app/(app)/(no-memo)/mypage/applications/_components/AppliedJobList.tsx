'use client';

import { useMemo } from 'react';

import { useLikeToggle } from '@/hooks/useLikeToggle';
import JobPostCard from '@/components/community/jobs/JobPostCard';

import type { CommunitySort } from '@/app/(app)/community/_constants/community';

import { jobPosts } from '@/mocks/posts';

type AppliedJobListProps = {
  sort: CommunitySort;
  keyword: string;
};

export default function AppliedJobList({ sort, keyword }: AppliedJobListProps) {
  const appliedJobPosts = useMemo(
    () => jobPosts.filter((post) => post.isApplied && post.apply.type === 'direct'),
    [],
  );

  const { posts, toggleLike } = useLikeToggle(appliedJobPosts);

  const filteredJobPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const searchedPosts = posts.filter((post) => {
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
  }, [posts, sort, keyword]);

  return (
    <>
      {filteredJobPosts.map((post) => (
        <JobPostCard
          key={post.id}
          post={post}
          onDirectApply={() => {
            // TODO: 지원현황 UX 결정 후 적용
          }}
          onToggleLike={({ postId }) => toggleLike(postId)}
        />
      ))}
    </>
  );
}
