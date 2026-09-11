'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useMypage } from '@/queries/mypage/useMypage';
import { useDeleteInfoPost } from '@/queries/community/useDeleteInfoPost';

import type { InfoPost } from '@/types/community/community';

type InfoDetailHeaderProps = {
  infoPost: InfoPost;
};

// TODO: author.id 식별 기준 확정 필요
// 현재 author.id 기반 isMine 판별은 신뢰할 수 없으므로,
// 스펙 확정 후 본인 작성 글은 수정·삭제, 타인 작성 글은 신고 메뉴로 분기
export default function InfoDetailHeader({ infoPost }: InfoDetailHeaderProps) {
  const router = useRouter();

  const { data: user } = useCurrentUser();
  const { data: mypage } = useMypage(user?.id);
  const { mutate: deleteInfoPost, isPending: isDeletePending } = useDeleteInfoPost();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMine =
    (infoPost.author.profileType === 'personal' &&
      infoPost.author.id === mypage?.personalProfile.id) ||
    (infoPost.author.profileType === 'company' && infoPost.author.id === mypage?.companyProfile.id);

  return (
    <PostDetailHeader
      category={infoPost.category}
      title={infoPost.title}
      createdAt={infoPost.createdAt}
      viewCount={infoPost.viewCount}
      isMine={isMine}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={() => {
        if (!user || !isMine || isDeletePending) return;
        router.push(`/community/info/${infoPost.id}/edit`);
      }}
      onDelete={() => {
        if (!user || !isMine || isDeletePending) return;
        if (!window.confirm('삭제하시겠습니까?')) return;

        deleteInfoPost(
          { infoId: infoPost.id, userId: user.id },
          {
            onSuccess: () => {
              router.push('/community/info');
            },
            onError: (error) => {
              alert(
                error instanceof ApiError
                  ? error.message
                  : '정보/자료공유 게시글 삭제에 실패했습니다.',
              );
            },
          },
        );
      }}
    />
  );
}
