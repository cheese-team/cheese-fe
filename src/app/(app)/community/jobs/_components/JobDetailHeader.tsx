'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import type { JobPost } from '@/types/community/community';

const currentUserId = 1;

type JobDetailHeaderProps = {
  jobPost: JobPost;
};

export default function JobDetailHeader({ jobPost }: JobDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  return (
    <PostDetailHeader
      title={jobPost.title}
      createdAt={jobPost.createdAt}
      viewCount={jobPost.viewCount}
      isMine={jobPost.author.id === currentUserId}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={() => router.push(`/community/jobs/${jobPost.id}/edit`)}
      onDelete={() => {
        // TODO: 삭제 API
        alert('게시글이 삭제되었습니다.');
        router.push('/community/jobs');
      }}
    />
  );
}
