'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useDeleteGroupPost } from '@/queries/community/useDeleteGroupPost';

import type { GroupPostDetail } from '@/types/community/community';

type GroupDetailHeaderProps = {
  groupPost: GroupPostDetail;
};

export default function GroupDetailHeader({ groupPost }: GroupDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  const { data: user } = useCurrentUser();
  const { mutate: deleteGroupPost, isPending: isDeletePending } = useDeleteGroupPost();

  const isMine = !!user && groupPost.author.userId === user.account.userId;

  const handleEdit = () => {
    if (!user || !isMine || isDeletePending) return;

    router.push(`/community/groups/${groupPost.id}/edit`);
  };

  return (
    <PostDetailHeader
      title={groupPost.title}
      createdAt={groupPost.createdAt}
      viewCount={groupPost.viewCount}
      isMine={isMine}
      isMenuOpen={isMenuOpen}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onCloseMenu={() => setIsMenuOpen(false)}
      onEdit={handleEdit}
      onDelete={() => {
        if (!user || !isMine || isDeletePending) return;
        if (!window.confirm('삭제하시겠습니까?')) return;

        deleteGroupPost(
          { groupId: groupPost.id },
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
