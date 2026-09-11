'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useMypage } from '@/queries/mypage/useMypage';
import { useDeleteJobPost } from '@/queries/community/useDeleteJobPost';
import { useUpdateActiveProfileType } from '@/queries/mypage/useUpdateActiveProfileType';

import type { JobPost } from '@/types/community/community';

type JobDetailHeaderProps = {
  jobId: string;
  jobPost: JobPost;
};

// TODO: author.id 식별 기준 확정 필요
// 현재 author.id 기반 isMine 판별은 신뢰할 수 없으므로,
// 스펙 확정 후 본인 작성 글은 수정·삭제, 타인 작성 글은 신고 메뉴로 분기
export default function JobDetailHeader({ jobId, jobPost }: JobDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  const { data: user } = useCurrentUser();
  const { data: mypage } = useMypage(user?.id);
  const { mutate: deleteJobPost, isPending: isDeletePending } = useDeleteJobPost();
  const { mutate: updateActiveProfileType, isPending: isProfileSwitchPending } =
    useUpdateActiveProfileType();

  const isMine =
    (jobPost.author.profileType === 'personal' &&
      jobPost.author.id === mypage?.personalProfile.id) ||
    (jobPost.author.profileType === 'company' && jobPost.author.id === mypage?.companyProfile.id);

  const handleEdit = () => {
    console.log('handleEdit 실행', {
      authorProfileType: jobPost.author.profileType,
      activeProfileType: user?.activeProfileType,
    });
    if (!user || isProfileSwitchPending) return;

    const authorProfileType = jobPost.author.profileType;

    if (authorProfileType === user.activeProfileType) {
      router.push(`/community/jobs/${jobId}/edit`);
      return;
    }

    const confirmed = window.confirm(
      `이 게시글은 ${authorProfileType === 'company' ? '기업' : '개인'} 프로필로 작성되었습니다.\n수정하려면 해당 프로필로 전환해야 합니다. 전환하시겠습니까?`,
    );

    if (!confirmed) return;

    updateActiveProfileType(
      {
        userId: user.id,
        activeProfileType: authorProfileType,
      },
      {
        onSuccess: () => {
          router.push(`/community/jobs/${jobId}/edit`);
        },
      },
    );
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
        if (!user || isDeletePending) return;

        const confirmed = window.confirm('삭제하시겠습니까?');
        if (!confirmed) return;

        deleteJobPost(
          { jobId, userId: user.id },
          {
            onSuccess: () => {
              router.push('/community/jobs');
            },
          },
        );
      }}
    />
  );
}
