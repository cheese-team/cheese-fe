import InfoPostCard from '@/components/community/info/InfoPostCard';

import { useBookmarkedPosts } from '../hooks/useBookmarkedPosts';

import { infoPosts } from '@/mocks/posts';

export default function InfoBookmarkList() {
  const { bookmarkedPosts: bookmarkedInfoPosts, toggleLike } = useBookmarkedPosts(infoPosts);

  return (
    <>
      {bookmarkedInfoPosts?.map((post) => (
        <InfoPostCard key={post.id} post={post} onToggleLike={toggleLike} />
      ))}
    </>
  );
}
