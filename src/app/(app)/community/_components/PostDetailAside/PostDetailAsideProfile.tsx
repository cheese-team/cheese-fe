'use client';

import { useState } from 'react';

import { Button } from '@/components/common/Button';
import ProfileImage from '@/components/common/ProfileImage';
import { PublicProfileModal } from '@/components/common/PublicProfile/PublicProfileModal';
import { useCurrentUser } from '@/queries/auth/useCurrentUser';

import type { UserSummary } from '@/types/community/community';

type PostDetailAsideProfileProps = {
  // 공개 작성자 응답은 UUID userId/displayName을 사용한다. 기존 목록 모델도 수용한다.
  author: UserSummary & { userId?: string; displayName?: string };
};

export default function PostDetailAsideProfile({ author }: PostDetailAsideProfileProps) {
  const currentUser = useCurrentUser();
  const viewerId = currentUser.isSuccess ? currentUser.data.account.userId : undefined;
  const userId = author.userId ?? (author.id == null ? '' : String(author.id));
  const name = author.displayName || author.nickname || '사용자';
  const [openedProfile, setOpenedProfile] = useState<{
    viewerId: string;
    userId: string;
    trigger: HTMLButtonElement;
  } | null>(null);

  return (
    <div className="flex w-full flex-col items-center gap-4 py-10">
      <div className="flex flex-col items-center gap-3">
        <ProfileImage size={100} src={author.profileImageUrl} />

        <div className="flex flex-col gap-1 text-center leading-[30px]">
          <span className="text-[20px] font-bold break-words">{name}</span>
          <span className="break-all">{author.email}</span>
        </div>
      </div>

      <Button
        onClick={(event) => {
          if (viewerId && userId)
            setOpenedProfile({ viewerId, userId, trigger: event.currentTarget });
        }}
        disabled={!viewerId || !userId}
        fullWidth
        variant="outlineGray"
        className="border-gray-400"
        size={44}
      >
        {author.profileType === 'company' ? '기업 정보 알아보기' : '프로필 보기'}
      </Button>

      {openedProfile && viewerId === openedProfile.viewerId && userId === openedProfile.userId ? (
        <PublicProfileModal
          viewerId={viewerId}
          userId={userId}
          trigger={openedProfile.trigger}
          onClose={() => setOpenedProfile(null)}
        />
      ) : null}
    </div>
  );
}
