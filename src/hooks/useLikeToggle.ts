import { useState } from 'react';

type LikeablePost = {
  id: number;
  isLiked: boolean;
  likeCount: number;
};

export function useLikeToggle<T extends LikeablePost>(initialPosts: T[]) {
  const [posts, setPosts] = useState(initialPosts);

  const toggleLike = (postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== postId) return post;

        const nextIsLiked = !post.isLiked;

        return {
          ...post,
          isLiked: nextIsLiked,
          likeCount: nextIsLiked ? post.likeCount + 1 : post.likeCount - 1,
        };
      }),
    );
  };

  return {
    posts,
    setPosts,
    toggleLike,
  };
}
