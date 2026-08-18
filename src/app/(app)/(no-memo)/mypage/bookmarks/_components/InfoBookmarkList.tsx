import { useMemo } from 'react';

import InfoPostCard from '@/components/community/info';

import { useBookmarkedPosts } from '../hooks/useBookmarkedPosts';

import type { InfoSort } from '@/app/(app)/community/_constants/community';
import type { TogglePostLikeParams } from '@/types/community/community';

import { infoPosts } from '@/mocks/posts';

type InfoBookmarkListProps = {
  sort: InfoSort;
  keyword: string;
};

// TODO:
// Mutation 적용 시 관심글에서는 좋아요 해제 후에도
// 현재 화면에서는 목록을 유지하고,
// 재조회(새로고침/재진입) 시 목록에서 제외되도록 처리
export default function InfoBookmarkList({ sort, keyword }: InfoBookmarkListProps) {
  const { bookmarkedPosts: bookmarkedInfoPosts, toggleLike } = useBookmarkedPosts(infoPosts);

  const filteredInfoPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return bookmarkedInfoPosts.filter((post) => {
      const matchesCategory = sort === 'all' || post.category === sort;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      return (
        post.title.toLowerCase().includes(normalizedKeyword) ||
        post.author.nickname.toLowerCase().includes(normalizedKeyword) ||
        post.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))
      );
    });
  }, [bookmarkedInfoPosts, sort, keyword]);

  const handleToggleLike = ({ postId }: TogglePostLikeParams) => {
    toggleLike(postId);
  };

  return (
    <>
      {filteredInfoPosts?.map((post) => (
        <InfoPostCard key={post.id} post={post} onToggleLike={handleToggleLike} />
      ))}
    </>
  );
}
