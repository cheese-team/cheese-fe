import JobPostCard from '@/components/community/jobs/JobPostCard';

import { useBookmarkedPosts } from '../hooks/useBookmarkedPosts';

import { jobPosts } from '@/mocks/posts';

export default function JobBookmarkList() {
  const { bookmarkedPosts: bookmarkedJobPosts, toggleLike } = useBookmarkedPosts(jobPosts);

  return (
    <>
      {bookmarkedJobPosts?.map((post) => (
        <JobPostCard
          key={post.id}
          post={post}
          onToggleLike={toggleLike}
          onDirectApply={() => {
            // 모달 열기
          }}
        />
      ))}
    </>
  );
}
