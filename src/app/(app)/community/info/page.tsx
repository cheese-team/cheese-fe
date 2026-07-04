'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

import InfoPostCard from '@/components/community/info/InfoPostCard';

import { useLikeToggle } from '@/hooks/useLikeToggle';
import { getOptionLabel } from '@/lib/getOptionLabel';
import { INFO_SORT_OPTIONS } from '../_constants/community';

import { infoPosts as INFO_POSTS } from '@/mocks/posts';

type InfoCategoryValue = (typeof INFO_SORT_OPTIONS)[number]['value'];

export default function CommunityInfoPage() {
  const searchParams = useSearchParams();
  const { posts: infoPosts, toggleLike } = useLikeToggle(INFO_POSTS);

  const category = (searchParams.get('sort') ?? 'all') as InfoCategoryValue;
  const keyword = searchParams.get('keyword') ?? '';

  const filteredInfoPosts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return infoPosts
      .filter((post) => {
        const matchesCategory = category === 'all' || post.category === category;

        if (!matchesCategory) {
          return false;
        }

        if (normalizedKeyword.length === 0) {
          return true;
        }

        return (
          post.title.toLowerCase().includes(normalizedKeyword) ||
          post.content.toLowerCase().includes(normalizedKeyword) ||
          post.author.nickname.toLowerCase().includes(normalizedKeyword) ||
          getOptionLabel(INFO_SORT_OPTIONS, post.category)
            .toLowerCase()
            .includes(normalizedKeyword) ||
          post.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [infoPosts, keyword, category]);

  return (
    <div className="mx-auto flex flex-col px-[50px]">
      {filteredInfoPosts.map((infoPost) => (
        <InfoPostCard
          key={infoPost.id}
          post={infoPost}
          onToggleLike={toggleLike}
          wrapperClassName="py-8"
        />
      ))}
    </div>
  );
}
