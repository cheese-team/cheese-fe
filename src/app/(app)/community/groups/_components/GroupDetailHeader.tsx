'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import type { GroupPost } from '@/types/community/community';
import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useMypage } from '@/queries/mypage/useMypage';
import { useDeleteGroupPost } from '@/queries/community/useDeleteGroupPost';

type GroupDetailHeaderProps = {
  groupPost: GroupPost;
};

export default function GroupDetailHeader({ groupPost }: GroupDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: mypage } = useMypage(user?.id);
  const { mutate: deleteGroupPost, isPending: isDeletePending } = useDeleteGroupPost();

  const isMine =
    (groupPost.author.profileType === 'personal' &&
      groupPost.author.id === mypage?.personalProfile.id) ||
    (groupPost.author.profileType === 'company' &&
      groupPost.author.id === mypage?.companyProfile.id);

  return (
    <PostDetailHeader
      title={groupPost.title}
      createdAt={groupPost.createdAt}
      viewCount={groupPost.viewCount}
      isMine={isMine}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={() => {
        if (!user || !isMine || isDeletePending) return;
        router.push(`/community/groups/${groupPost.id}/edit`);
      }}
      onDelete={() => {
        if (!user || !isMine || isDeletePending) return;
        if (!window.confirm('삭제하시겠습니까?')) return;

        deleteGroupPost(
          { groupId: groupPost.id, userId: user.id },
          {
            onSuccess: () => {
              router.push('/community/groups');
            },
            onError: (error) => {
              alert(error instanceof ApiError ? error.message : '그룹모집 삭제에 실패했습니다.');
            },
          },
        );
      }}
    />
  );
}
