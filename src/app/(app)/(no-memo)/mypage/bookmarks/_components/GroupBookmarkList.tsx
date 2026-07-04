import GroupPostCard from '@/components/community/groups/GroupPostCard';

import { useBookmarkedPosts } from '../hooks/useBookmarkedPosts';

import { groupPosts } from '@/mocks/posts';

export default function GroupBookmarkList() {
  const { bookmarkedPosts: bookmarkedGroupPosts, toggleLike } = useBookmarkedPosts(groupPosts);

  return (
    <div className="grid w-full max-w-[930px] grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
      {bookmarkedGroupPosts?.map((post) => (
        <GroupPostCard key={post.id} post={post} onToggleLike={toggleLike} />
      ))}
    </div>
  );
}
