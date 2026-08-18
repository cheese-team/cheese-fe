import { useMemo } from 'react';

import GroupPostCard from '@/components/community/groups';

import { useBookmarkedPosts } from '../hooks/useBookmarkedPosts';

import type { CommunitySort } from '@/app/(app)/community/_constants/community';
import type { TogglePostLikeParams } from '@/types/community/community';

import { groupPosts } from '@/mocks/posts';

type GroupBookmarkListProps = {
  sort: CommunitySort;
  keyword: string;
};

// TODO:
// Mutation 적용 시 관심글에서는 좋아요 해제 후에도
// 현재 화면에서는 목록을 유지하고,
// 재조회(새로고침/재진입) 시 목록에서 제외되도록 처리
export default function GroupBookmarkList({ sort, keyword }: GroupBookmarkListProps) {
  const { bookmarkedPosts: bookmarkedGroupPosts, toggleLike } = useBookmarkedPosts(groupPosts);

  const filteredGroupPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const searchedPosts = bookmarkedGroupPosts.filter((post) => {
      if (!normalizedKeyword) {
        return true;
      }

      return (
        post.title.toLowerCase().includes(normalizedKeyword) ||
        post.author.nickname.toLowerCase().includes(normalizedKeyword) ||
        post.field.some((field) => field.toLowerCase().includes(normalizedKeyword)) ||
        post.skills.some((skill) => skill.toLowerCase().includes(normalizedKeyword))
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
  }, [bookmarkedGroupPosts, sort, keyword]);

  const handleToggleLike = ({ postId }: TogglePostLikeParams) => {
    toggleLike(postId);
  };

  return (
    <div className="grid w-full max-w-[930px] grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
      {filteredGroupPosts?.map((post) => (
        <GroupPostCard key={post.id} post={post} onToggleLike={handleToggleLike} />
      ))}
    </div>
  );
}
