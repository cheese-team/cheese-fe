'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import GroupPostCard from '@/components/community/groups/GroupPostCard';

import { useLikeToggle } from '@/hooks/useLikeToggle';
import { getDeadlineTime, isRecruitClosed } from '@/lib/formatDeadline';

import { groupPosts as GROUP_POSTS } from '@/mocks/posts';

export default function CommunityGroupsPage() {
  const searchParams = useSearchParams();
  const { posts: groupPosts, toggleLike } = useLikeToggle(GROUP_POSTS);

  const sort = searchParams.get('sort') ?? 'latest';
  const keyword = searchParams.get('keyword') ?? '';

  const filteredGroupPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return groupPosts
      .filter((post) => {
        if (normalizedKeyword.length === 0) {
          return true;
        }

        return (
          post.title.toLowerCase().includes(normalizedKeyword) ||
          post.author.nickname.toLowerCase().includes(normalizedKeyword) ||
          post.field.toLowerCase().includes(normalizedKeyword)
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

        return b.id - a.id;
      });
  }, [groupPosts, keyword, sort]);

  return (
    <div className="mx-auto grid max-w-[976px] grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {filteredGroupPosts.map((groupPost) => (
        <GroupPostCard key={groupPost.id} post={groupPost} onToggleLike={toggleLike} />
      ))}
    </div>
  );
}
