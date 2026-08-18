'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import type { GroupPost } from '@/types/community/community';

const currentUserId = 1;

type GroupDetailHeaderProps = {
  groupPost: GroupPost;
};

export default function GroupDetailHeader({ groupPost }: GroupDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  return (
    <PostDetailHeader
      title={groupPost.title}
      createdAt={groupPost.createdAt}
      viewCount={groupPost.viewCount}
      isMine={groupPost.author.id === currentUserId}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={() => router.push(`/community/groups/${groupPost.id}/edit`)}
      onDelete={() => {
        // TODO: 삭제 API
        alert('게시글이 삭제되었습니다.');
        router.push('/community/groups');
      }}
    />
  );
}
