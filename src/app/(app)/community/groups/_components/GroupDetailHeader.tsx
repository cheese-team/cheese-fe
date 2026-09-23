'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PostDetailHeader from '../../_components/PostDetail';

import { ApiError } from '@/api/client';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';
import { useMypage } from '@/queries/mypage/useMypage';
import { useDeleteGroupPost } from '@/queries/community/useDeleteGroupPost';
import { useUpdateActiveProfileType } from '@/queries/mypage/useUpdateActiveProfileType';

import type { GroupPost } from '@/types/community/community';

type GroupDetailHeaderProps = {
  groupPost: GroupPost;
};

export default function GroupDetailHeader({ groupPost }: GroupDetailHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();

  const { data: user } = useCurrentUser();
  const { data: mypage } = useMypage();
  const { mutate: deleteGroupPost, isPending: isDeletePending } = useDeleteGroupPost();
  const { mutate: updateActiveProfileType, isPending: isProfileSwitchPending } =
    useUpdateActiveProfileType();

  const isMine =
    (groupPost.author.profileType === 'personal' &&
      groupPost.author.id === mypage?.personalProfile.id) ||
    (groupPost.author.profileType === 'company' &&
      groupPost.author.id === mypage?.companyProfile.id);

  const handleEdit = () => {
    if (!user || !isMine || isProfileSwitchPending || isDeletePending) return;

    const authorProfileType = groupPost.author.profileType;

    if (authorProfileType === user.account.activeProfileType) {
      router.push(`/community/groups/${groupPost.id}/edit`);
      return;
    }

    const confirmed = window.confirm(
      `이 게시글은 ${authorProfileType === 'company' ? '기업' : '개인'} 프로필로 작성되었습니다.\n수정하려면 해당 프로필로 전환해야 합니다. 전환하시겠습니까?`,
    );

    if (!confirmed) return;

    updateActiveProfileType(
      {
        activeProfileType: authorProfileType,
      },
      {
        onSuccess: () => {
          router.push(`/community/groups/${groupPost.id}/edit`);
        },
      },
    );
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
        if (!user || !isMine || isDeletePending || isProfileSwitchPending) return;
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
