'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import { ApiError } from '@/api/client';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useDeleteJobPost } from '@/queries/community/useDeleteJobPost';

import type { JobPostDetail } from '@/types/community/community';

type JobDetailHeaderProps = {
  jobId: string;
  jobPost: JobPostDetail;
};

export default function JobDetailHeader({ jobId, jobPost }: JobDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  const { data: user } = useCurrentUser();
  const { mutate: deleteJobPost, isPending: isDeletePending } = useDeleteJobPost();

  const isMine = !!user && jobPost.author.userId === user.account.userId;

  const handleEdit = () => {
    if (!user || !isMine || isDeletePending) return;

    router.push(`/community/jobs/${jobId}/edit`);
  };

  return (
    <PostDetailHeader
      title={jobPost.title}
      createdAt={jobPost.createdAt}
      viewCount={jobPost.viewCount}
      isMine={isMine}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={handleEdit}
      onDelete={() => {
        if (!user || !isMine || isDeletePending) return;

        const confirmed = window.confirm('삭제하시겠습니까?');
        if (!confirmed) return;

        deleteJobPost(
          { jobId },
          {
            onSuccess: () => {
              router.push('/community/jobs');
            },
            onError: (error) => {
              alert(
                error instanceof ApiError ? error.message : '채용공고 게시글 삭제에 실패했습니다.',
              );
            },
          },
        );
      }}
    />
  );
}
