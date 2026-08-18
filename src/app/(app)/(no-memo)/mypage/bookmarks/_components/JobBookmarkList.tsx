import { useMemo, useState } from 'react';

import JobPostCard from '@/components/community/jobs/JobPostCard';
import ApplyModal from '@/app/(app)/community/_components/ApplyModal';

import { useBookmarkedPosts } from '../hooks/useBookmarkedPosts';

import type { JobPost } from '@/types/community/community';
import type { CommunitySort } from '@/app/(app)/community/_constants/community';
import type { TogglePostLikeParams } from '@/types/community/community';

import { jobPosts } from '@/mocks/posts';

type JobBookmarkListProps = {
  sort: CommunitySort;
  keyword: string;
};

// TODO:
// Mutation 적용 시 관심글에서는 좋아요 해제 후에도
// 현재 화면에서는 목록을 유지하고,
// 재조회(새로고침/재진입) 시 목록에서 제외되도록 처리
export default function JobBookmarkList({ sort, keyword }: JobBookmarkListProps) {
  const [selectedApplyPost, setSelectedApplyPost] = useState<JobPost | null>(null);
  const { bookmarkedPosts: bookmarkedJobPosts, toggleLike } = useBookmarkedPosts(jobPosts);

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

  const handleToggleLike = ({ postId }: TogglePostLikeParams) => {
    toggleLike(postId);
  };

  return (
    <>
      {filteredJobPosts.map((jobPost) => (
        <JobPostCard
          key={jobPost.id}
          post={jobPost}
          onToggleLike={handleToggleLike}
          onDirectApply={() => setSelectedApplyPost(jobPost)}
        />
      ))}

      {selectedApplyPost && (
        <ApplyModal post={selectedApplyPost} isOpen onClose={() => setSelectedApplyPost(null)} />
      )}
    </>
  );
}
