import { useLikeToggle } from '@/hooks/useLikeToggle';

type BookmarkablePost = {
  id: number;
  isLiked: boolean;
  likeCount: number;
};

export function useBookmarkedPosts<T extends BookmarkablePost>(initialPosts: T[]) {
  const bookmarkedPosts = initialPosts.filter((post) => post.isLiked);

  const { posts, toggleLike } = useLikeToggle(bookmarkedPosts);

  const visibleBookmarkedPosts = posts.filter((post) => post.isLiked);

  return {
    bookmarkedPosts: visibleBookmarkedPosts,
    toggleLike,
  };
}
