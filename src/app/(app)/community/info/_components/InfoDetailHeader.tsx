'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import type { InfoPost } from '@/types/community/community';

const currentUserId = 1;

type InfoDetailHeaderProps = {
  infoPost: InfoPost;
};

export default function InfoDetailHeader({ infoPost }: InfoDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  return (
    <PostDetailHeader
      category={infoPost.category}
      title={infoPost.title}
      createdAt={infoPost.createdAt}
      viewCount={infoPost.viewCount}
      isMine={infoPost.author.id === currentUserId}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={() => router.push(`/community/info/${infoPost.id}/edit`)}
      onDelete={() => {
        // TODO: 삭제 API
        alert('게시글이 삭제되었습니다.');
        router.push('/community/info');
      }}
    />
  );
}
